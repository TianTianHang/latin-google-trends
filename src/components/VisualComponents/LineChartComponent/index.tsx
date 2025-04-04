import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption, SeriesOption } from "echarts";
import { TimeInterest } from "@/types/interest";
import { LineChartOutlined } from "@ant-design/icons";
import { Card, Switch, Progress, Button, Space, Select, Tag } from "antd";
import dayjs from "dayjs";
import { fillMissingValuesAndTrim } from "@/utils/interest";
import { fitModel, getFitProgress } from "@/api/cfc";
import { useAutoResizeChart } from "../hooks/useAutoResizeChart";
import { RegisteredComponent } from "@/components/Editor/stores/registeredComponentsStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useDataBinding } from "@/components/Editor/hooks/useDataBinding";
import { SubjectDataResponse } from "@/types/subject";
import { useTranslation } from "react-i18next";

interface ChartData {
  time: string;
  value: number;
  keyword: string;
}

interface LineChartProps {
  componentId: string;
  subjectId?: number;
  subjectDatas?: SubjectDataResponse[];
  lineColors?: string[];
  title?: string;
}

// 将数据处理逻辑提取到自定义hook中
const useChartData = (subjectDatas?: SubjectDataResponse[]) => {
  const filterSubjectDatas = useMemo(() => {
    return subjectDatas?.filter((sd) => sd.data_type == "time");
  }, [subjectDatas]);
  const [index, setIndex] = useState(0);
  const data = useMemo(() => {
    if (!filterSubjectDatas || filterSubjectDatas.length === 0) return null;
    return filterSubjectDatas[index];
  }, [index, filterSubjectDatas]);
  const options = useMemo(
    () =>
      filterSubjectDatas?.map((sd, index) => ({
        label: `${sd.id}-${sd.data_type}`,
        value: index,
      })),
    [filterSubjectDatas]
  );
  return { data, index, setIndex, options };
};

// 将拟合逻辑提取到自定义hook中
const useFitData = (data: SubjectDataResponse | null, index: number) => {
  const [fit, setFit] = useState(false);
  const [isFitting, setIsFitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fitData, setFitData] = useState<ChartData[]>([]);

  // 使用 ref 存储最新数据，避免闭包问题
  const fitRef = useRef(fit);
  fitRef.current = fit;
  const dataRef = useRef(data);
  dataRef.current = data;

  const generateFitData = useCallback(
    async (kw: string, retryCount = 0): Promise<ChartData[]> => {
      setIsFitting(true);
      try {
        const timeInterestData = data?.data[index] as TimeInterest[];
        if (!timeInterestData) return [];

        // 添加重试机制
        if (retryCount > 2) {
          throw new Error("Max retries exceeded");
        }

        const values = timeInterestData.map((item) => item[kw]);
        const fillValues = fillMissingValuesAndTrim(values, "linear");

        if (!fillValues) {
          throw new Error("插值失败");
        }

        const { task_id, result } = await fitModel({
          timespans: timeInterestData.map((_, i) => i),
          values: fillValues,
        });

        if (result) {
          return timeInterestData.map((item, index) => ({
            time: item.time_utc,
            value: result?.values[index] || 0,
            keyword: `${kw}-fit`,
          }));
        }

        const pollProgress = async (): Promise<ChartData[]> => {
          const data = await getFitProgress(task_id);
          if (data.status === "completed") {
            setIsFitting(false);
            setProgress(100);
            return timeInterestData.map((item, index) => ({
              time: item.time_utc,
              value: data.result?.values[index] || 0,
              keyword: `${kw}-fit`,
            }));
          } else if (data.status === "processing") {
            setProgress(data.progress || 0);
            await new Promise((resolve) => setTimeout(resolve, 1500));
            return pollProgress();
          }
          return [];
        };

        return await pollProgress();
      } catch (err) {
        console.error("Failed to generate fit data:", err);
        return [];
      } finally {
        setIsFitting(false);
      }
    },
    [data, index]
  );

  useEffect(() => {
    if (!dataRef.current || !fitRef.current) return;

    const fetchFitData = async () => {
      const metaItem = dataRef.current!.meta[index];
      const newFitData: ChartData[] = [];

      const promises = metaItem.keywords.map((kw) => generateFitData(kw, 0));
      const results = await Promise.all(promises);
      newFitData.push(...results.flat());

      setFitData(newFitData);
    };

    fetchFitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, generateFitData, fitRef.current]);

  return { fit, setFit, isFitting, progress, fitData };
};
const getRandomColor = () => {
  // 生成随机颜色的方法，返回如 '#RRGGBB' 格式的字符串
  const r = Math.floor(Math.random() * 256).toString(16);
  const g = Math.floor(Math.random() * 256).toString(16);
  const b = Math.floor(Math.random() * 256).toString(16);
  return "#" + ("0" + r).slice(-2) + ("0" + g).slice(-2) + ("0" + b).slice(-2);
};
const allocateColor = (
  lineColors: string[] | undefined,
  allocatedColors: string[]
) => {
  // 如果还有未分配的颜色，则分配之
  if (lineColors) {
    for (const color of lineColors) {
      if (!allocatedColors.includes(color)) {
        allocatedColors.push(color);
        return color;
      }
    }
  }

  // 若所有颜色均已分配，则生成并返回随机颜色
  const newColor = getRandomColor();
  allocatedColors.push(newColor);
  return newColor;
};
// 将图表配置生成逻辑提取到单独的函数中
const generateChartOptions = (
  data: SubjectDataResponse | null,
  index: number,
  title?: string,
  fitData: ChartData[] = [],
  lineColors?: string[]
): EChartsOption => {
  if (data) {
    const series: SeriesOption[] = [];
    const allocatedColors: string[] = []; // 已分配颜色的数组
    const metaItem = data.meta[index];
    metaItem.keywords.forEach((keyword) => {
      if (Array.isArray(data.data) && Array.isArray(data.data[index])) {
        const timeInterestData = data.data[index] as TimeInterest[];

        const seriesData = timeInterestData.map((item) => ({
          name: item.time_utc,
          value: [item.time_utc, item[keyword]],
        }));

        const fitSeriesData = fitData
          .filter((fitItem) => fitItem.keyword === `${keyword}-fit`)
          .map((fitItem) => ({
            name: fitItem.keyword,
            value: [fitItem.time, fitItem.value],
          }));

        series.push({
          name: keyword,
          type: "line",
          data: seriesData,
          itemStyle: {
            color: allocateColor(lineColors, allocatedColors),
          },
        });

        series.push({
          name: `${keyword}-fit`,
          type: "line",
          smooth: true,
          data: fitSeriesData,
          itemStyle: {
            color: allocateColor(lineColors, allocatedColors),
          },
        });
      }
    });

    return {
      title: {
        text: title,
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
        },
      },
      xAxis: {
        type: "time",
        name: "Time UTC",
        nameLocation: "middle",
        nameGap: 30,
        splitLine: {
          show: true,
        },
        axisLabel: {
          formatter: (value: number) => dayjs(value).format("YYYY-MM-DD"),
        },
      },
      yAxis: {
        type: "log",
        min: 0.1,
        max: 100,
        axisLabel: {
          customValues: [
            0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
          ],
        },
        name: "Value",
        nameLocation: "middle",
        nameGap: 30,
        splitLine: {
          show: true,
        },
      },
      series,
    };
  }

  // 默认配置
  const x = Array.from({ length: 100 }, (_, i) => (i / 100) * 2 * Math.PI);
  const y = x.map(Math.sin);

  return {
    title: {
      text: title,
      left: "center",
    },
    xAxis: {
      type: "value",
      name: "X Axis",
      axisLabel: {
        formatter: (value: number) => value.toFixed(2),
      },
    },
    yAxis: {
      type: "value",
      name: "Y Axis",
      axisLabel: {
        formatter: (value: number) => value.toFixed(2),
      },
    },
    series: [
      {
        name: "test",
        type: "line",
        data: x.map((xVal, i) => [xVal, y[i]]),
        itemStyle: {
          color: lineColors?.[0],
        },
      },
    ],
  };
};

const LineChart: React.FC<LineChartProps> = ({
  componentId,
  subjectId,
  subjectDatas,
  lineColors,
  title,
}) => {
  const { t } = useTranslation("visualComponents");
  useDataBinding(`subject-${subjectId}`, componentId, "subjectDatas");
  const { cardRef, echartsRef } = useAutoResizeChart();
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = useCallback(() => {
    console.log(`Retrying... Attempt ${retryCount + 1}`);
    setRetryCount((prev) => prev + 1);
    setError(null);
  }, [retryCount]);

  const { data, index, setIndex, options } = useChartData(subjectDatas);
  const { fit, setFit, isFitting, progress, fitData } = useFitData(data, index);

  const option = useMemo(() => {
    const options = generateChartOptions(
      data,
      index,
      title,
      fitData,
      lineColors
    );

    // 冻结配置对象以防止意外修改
    return Object.freeze(options);
  }, [data, index, title, fitData, lineColors]);

  return (
    <Card className="w-full h-full" ref={cardRef}>
      <div className="absolute top-2 right-2 z-10 opacity-0 hover:opacity-100 transition-opacity duration-200">
        <Space>
          <Select
            style={{ width: 150 }}
            options={options}
            value={index}
            onChange={(value) => setIndex(value)}
          />
          <Switch
            checked={fit}
            onChange={setFit}
            checkedChildren="Fit"
            unCheckedChildren="Fit"
            style={{ marginLeft: 8 }}
            disabled={fit}
          />
        </Space>
      </div>
      {isFitting && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1/2">
          <Progress percent={progress} status="active" />
        </div>
      )}
      {error ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-red-500 mb-4">
            {t(`component.lineChart.error`, { error: error.message })}
          </div>
          <Button type="primary" onClick={handleRetry}>
            重试
          </Button>
        </div>
      ) : (
        <ReactECharts
          ref={echartsRef}
          autoResize={false}
          notMerge
          option={option}
          opts={{ renderer: "canvas" }}
          shouldSetOption={(prevOption, newOption) => {
            // 仅在配置实际变化时更新
            return JSON.stringify(prevOption) !== JSON.stringify(newOption);
          }}
        />
      )}
    </Card>
  );
};

export default React.memo(LineChart);

// 注册 LineChart 组件对象
// eslint-disable-next-line react-refresh/only-export-components
export const RegisteredLineChart: RegisteredComponent<LineChartProps> = {
  meta: {
    type: "line-chart",
    name: "LineChart",
    icon: <LineChartOutlined />,
    defaultProps: {
      title: "Line Chart",
      lineColors: ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"],
      componentId: "",
    },
    propSchema: {
      subjectId: {
        type: "select",
        label: "Subject Id",
        placeholder: "Enter Subject Id",
        options: async () => {
          const subjects = useSubjectStore.getState().allSubjects;
          return subjects.map((s) => ({
            label: `${s.subject_id}-${s.name}-${s.data_num}`,
            value: s.subject_id,
          }));
        },
      },
      lineColors: {
        type: "select",
        label: "Line Colors",
        placeholder: "Enter line colors",
        mode: "multiple",
        options: ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"].map(
          (c) => ({
            label: c,
            value: c,
          })
        ),
        tagRender:(props) => {
          const { label, value, closable, onClose } = props;
          const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
            event.preventDefault();
            event.stopPropagation();
          };
          return (
            <Tag
              color={value}
              onMouseDown={onPreventMouseDown}
              closable={closable}
              onClose={onClose}
              style={{ marginInlineEnd: 4 }}
            >
              {label}
            </Tag>
          );
        }
      },
      title: {
        type: "text",
        label: "Title",
        placeholder: "Enter chart title",
      },
    },
  },
  component: LineChart,
};
