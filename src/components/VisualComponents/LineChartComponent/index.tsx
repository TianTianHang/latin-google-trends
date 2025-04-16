import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import ReactECharts from "echarts-for-react";
import type {
  EChartsOption,
  LegendComponentOption,
  SeriesOption,
} from "echarts";
import { useFullscreen } from "ahooks";
import { TimeInterest } from "@/types/interest";
import { LineChartOutlined } from "@ant-design/icons";
import { Switch, Progress, Button, Space, Select, Tag, Checkbox, Dropdown } from "antd";
import dayjs from "dayjs";
import { fillMissingValuesAndTrim } from "@/utils/interest";
import { fitModel, getFitProgress } from "@/api/cfc";
import { useAutoResizeChart } from "../hooks/useAutoResizeChart";
import { RegisteredComponent } from "@/components/Editor/stores/registeredComponentsStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useDataBinding } from "@/components/Editor/hooks/useDataBinding";
import { SubjectDataResponse } from "@/types/subject";
import { useTranslation } from "react-i18next";


type AxisType = "value" | "log";

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
  step?: number;
}

// 坐标轴类型切换hook
const useAxisType = () => {
  const [axisType, setAxisType] = useState<AxisType>("value");
  const toggleAxisType = useCallback(() => {
    setAxisType((prev) => (prev === "value" ? "log" : "value"));
  }, []);
  return { axisType, toggleAxisType };
};

// 将数据处理逻辑提取到自定义hook中
const useChartData = (subjectDatas?: SubjectDataResponse[]) => {
  const filterSubjectDatas = useMemo(() => {
    return subjectDatas?.filter((sd) => sd.data_type == "time");
  }, [subjectDatas]);
  const [index, setIndex] = useState(0);
  const data = useMemo(() => {
    if (!filterSubjectDatas || filterSubjectDatas.length === 0) return null;
    if (filterSubjectDatas[index].data.length == 0) return null;
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
  const [fitMap, setFitMap] = useState<Record<string, boolean>>({});
  const [isFitting, setIsFitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fitData, setFitData] = useState<ChartData[]>([]);

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
        
        // 检查数据中相同值的数量，如果超过阈值则拒绝拟合
        const valueCounts = values.reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);
        
        const maxCount = Math.max(...Object.values(valueCounts));
        if (maxCount > values.length * 0.5) {
          throw new Error("数据中存在过多相同值，不适合拟合");
        }

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

  const toggleFit = useCallback((kw: string) => {
    setFitMap(prev => {
      const newFitMap = {...prev, [kw]: !prev[kw]};
      return newFitMap;
    });
  }, []);

  useEffect(() => {
    if (!dataRef.current) return;

    const fetchFitData = async () => {
      const metaItem = dataRef.current!.meta[index];
      const newFitData: ChartData[] = [];

      const promises = metaItem.keywords
        .filter(kw => fitMap[kw])
        .map(kw => generateFitData(kw, 0));
      
      const results = await Promise.all(promises);
      newFitData.push(...results.flat());

      setFitData(newFitData);
    };

    fetchFitData();
  }, [index, generateFitData, fitMap]);

  return { fitMap, setFitMap, toggleFit, isFitting, progress, fitData };
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
interface ChartOptionsParams {
  data: SubjectDataResponse | null;
  step: number;
  title?: string;
  fitData?: ChartData[];
  lineColors?: string[];
  toggleFullscreen?: () => void;
  axisType?: AxisType;
}

const generateChartOptions = ({
  data,
  step,
  title,
  fitData = [],
  lineColors,
  toggleFullscreen,
  axisType = "value",
}: ChartOptionsParams): EChartsOption => {
  if (data) {
    const series: SeriesOption[] = [];
    const allocatedColors: string[] = []; // 已分配颜色的数组
    const metaItem = data.meta[step];
    const legend: LegendComponentOption = {
      orient: "vertical",
      right: "0%",
      top: "10%",
      data: [],
    };
    metaItem.keywords.forEach((keyword) => {
      if (Array.isArray(data.data) && Array.isArray(data.data[step])) {
        const timeInterestData = data.data[step] as TimeInterest[];

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
        legend.data?.push({ name: keyword });

        if (fitSeriesData.length > 0) {
          series.push({
            name: `${keyword}-fit`,
            type: "line",
            smooth: true,
            data: fitSeriesData,
            itemStyle: {
              color: allocateColor(lineColors, allocatedColors),
            },
          });
          legend.data?.push({ name: `${keyword}-fit` });
        }
      }
    });

    return {
      toolbox: {
        feature: {
          saveAsImage: {
            // 这里可以设置一些保存为图片的参数，例如：
            type: "png", // 可选 'png' 或 'jpeg'
            name: "line-chart", // 下载的文件名称，默认为 'chart'
            backgroundColor: "#fff", // 背景色，默认透明
            // ... 其他可选参数
          },
          myFullscreen: {
            show: true,
            title: "全屏",
            icon: "image://src/assets/fullscreen.svg",
            onclick: toggleFullscreen,
          },
        },
      },
      title: {
        text: title,
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          // label: {
          //   formatter(params:any) {
          //     return dayjs(params.value[0]).format("YYYY-MM-DD");
          //   },
          // },
        }
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
          formatter: (value: number, index: number) => {
            if (index % 2 == 0) {
              return dayjs(value).format("YYYY-MM-DD")
            } else {
              return "";
            }
          },
        },
      },
      yAxis: {
        type: axisType,
        min: 0.1,
        max: 100,
        axisLabel: axisType === "log" ? {
          customValues: [
            0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
          ],
        } : {},
        name: "Value",
        nameLocation: "middle",
        nameGap: 30,
        splitLine: {
          show: true,
        },
      },
      series,
      legend,
    };
  }

  // 默认配置
  const x = Array.from({ length: 100 }, (_, i) => (i / 100) * 2 * Math.PI);
  const y = x.map(Math.sin);

  return {
    toolbox: {
      feature: {
        saveAsImage: {
          // 这里可以设置一些保存为图片的参数，例如：
          type: "png", // 可选 'png' 或 'jpeg'
          name: "line-chart", // 下载的文件名称，默认为 'chart'
          backgroundColor: "#fff", // 背景色，默认透明
          // ... 其他可选参数
        },
        myFullscreen: {
          show: true,
          title: "全屏",
          icon: "image://src/assets/fullscreen.svg",
          onclick: toggleFullscreen,
        },
      },
    },
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
  step = 0
}) => {
  const { t } = useTranslation("visualComponents");
  useDataBinding(`subject-${subjectId}`, componentId, "subjectDatas");
  const { cardRef, echartsRef } = useAutoResizeChart();
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [, { toggleFullscreen }] = useFullscreen(cardRef);

  const handleRetry = useCallback(() => {
    console.log(`Retrying... Attempt ${retryCount + 1}`);
    setRetryCount((prev) => prev + 1);
    setError(null);
  }, [retryCount]);

  const { data, index, setIndex, options } = useChartData(subjectDatas);
  const { fitMap, setFitMap, isFitting, progress, fitData } = useFitData(data, step);

  const { axisType, toggleAxisType } = useAxisType();

  const option = useMemo(() => {
    const options = generateChartOptions({
      data,
      step,
      title,
      fitData,
      lineColors,
      toggleFullscreen,
      axisType,
    });

    // 冻结配置对象以防止意外修改
    return Object.freeze(options);
  }, [data, index, title, fitData, lineColors, toggleFullscreen, axisType]);

  return (
    <div className="w-full h-full" ref={cardRef}>
      <div className="absolute top-2 left-2 z-10 opacity-0 hover:opacity-100 transition-opacity duration-200">
        <Space>
          <Select
            style={{ width: 150 }}
            options={options}
            value={index}
            onChange={(value) => setIndex(value)}
          />
          <Dropdown
            menu={{
              items: data?.meta[index].keywords.map(kw => ({
                key: kw,
                label: (
                  <Checkbox
                    checked={fitMap[kw]}
                    onChange={() => {
                      const newFitMap = {...fitMap, [kw]: !fitMap[kw]};
                      setFitMap(newFitMap);
                    }}
                  >
                    {kw}
                  </Checkbox>
                )
              })),
              selectable: true,
              multiple: true
            }}
            trigger={['click']}
          >
            <Button>选择关键词</Button>
          </Dropdown>
          
          <Switch
            checked={axisType === "log"}
            onChange={toggleAxisType}
            checkedChildren="Log"
            unCheckedChildren="Value"
            style={{ marginLeft: 8 }}
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
          className="background-white h-full"
        />
      )}
    </div>
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
      step: {
        type: "slider",
        label: "Step",
        placeholder: "Enter Step",
        min: 0,
        max: 100,
        step: 1,
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
        tagRender: (props) => {
          const { label, value, closable, onClose } = props;
          const onPreventMouseDown = (
            event: React.MouseEvent<HTMLSpanElement>
          ) => {
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
        },
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
