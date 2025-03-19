import React, { useEffect, useMemo,  useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption, SeriesOption } from "echarts";
import { TimeInterest } from "@/types/interest";
import { RegisteredComponent } from "@/components/Editor/types";
import { LineChartOutlined } from "@ant-design/icons";
import { Card, Switch, Progress } from "antd";
import { useSubjectStore } from "@/stores/useSubjectStore";
import dayjs from "dayjs";
import { fillMissingValuesAndTrim } from "@/utils/interest";
import { fitModel, getFitProgress } from "@/api/cfc";
import { useAutoResizeChart } from "../useAutoResizeChart";

interface ChartData {
  time: string;
  value: number;
  keyword: string;
}

interface LineChartProps {
  subjectDataId?: number;
  lineColors?: string[];
  title?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  subjectDataId,
  lineColors,
  title,
}) => {
  
  const { subjectDatas } = useSubjectStore();
  const data = useMemo(() => {
    const subject = subjectDatas.find((s) => s.id == subjectDataId);
    return subject ? subject : null;
  }, [subjectDataId, subjectDatas]);
  const [index, _setIndex] = useState(2);
  const [fit, setFit] = useState(false);
  const [isFitting, setIsFitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fitData, setFitData] = useState<ChartData[]>([]);
  const { cardRef, echartsRef } = useAutoResizeChart();
 

  const generateFitData = async (kw: string): Promise<ChartData[]> => {
    setIsFitting(true);
    try {
      const timeInterestData = data?.data[index] as TimeInterest[];
      if (!timeInterestData) return [];

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
  };

  useEffect(() => {
    if (!data || !fit) return;
    const fit_ = async () => {
      const metaItem = data.meta[index];
      const fitData: ChartData[] = [];
      for (const kw of metaItem.keywords) {
        fitData.push(...(await generateFitData(kw)));
      }
      setFitData(fitData);
    };
    fit_();
  }, [data, index, fit]);

  // 第一个 option 配置，用于处理 data 存在的情况
  const dataOption: EChartsOption = useMemo(() => {
    if (data) {
      const series: SeriesOption[] = [];

      // 遍历每个 SubjectDataMeta 元素
      const metaItem = data.meta[index];
      // 遍历每个 keyword，创建一个系列
      metaItem.keywords.forEach((keyword) => {
        // 检查 data 是否包含 TimeInterest 类型的数据
        if (data.data instanceof Array && data.data[index] instanceof Array) {
          // 提取 TimeInterest 数据
          const timeInterestData = data.data[index] as TimeInterest[];

          // 创建系列数据
          const seriesData = timeInterestData.map((item) => {
            // 假设 keyword 对应的值是 item[keyword]
            return {
              name: item.time_utc,
              value: [item.time_utc, item[keyword]],
            };
          });
          const fitSeriesData = fitData
            .filter((fitItem) => fitItem.keyword == `${keyword}-fit`)
            .map((fitItem) => {
              return {
                name: fitItem.keyword,
                value: [fitItem.time, fitItem.value],
              };
            });
          // 添加到 series 数组
          series.push({
            name: keyword,
            type: "line", // 或其他图表类型
            data: seriesData,
          });
          series.push({
            name: `${keyword}-fit`,
            type: "line", // 或其他图表类型
            smooth: true,
            data: fitSeriesData,
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
            formatter: (value: number) => {
              return dayjs(value).format("YYYY-MM-DD");
            },
          },
        },
        yAxis: {
          type: "log",
          min: 0.1, // 设置最小值
          max: 100, // 设置最大值
          axisLabel: {
            alignWithLabel: false,
            customValues:[
              0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1, 2, 3, 4, 5, 6, 7, 8, 9,
              10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
            ]
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
    } else {
      return {};
    }
  }, [data, index, title, fitData]);

  // 第二个 option 配置，用于处理 data 不存在的情况
  const defaultOption: EChartsOption = useMemo(() => {
    const x: number[] = [];
    const y: number[] = [];
    const numPoints = 100;
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      x.push(angle);
      y.push(Math.sin(angle));
    }

    return {
      title: {
        text: title,
        left: "center",
      },
      xAxis: {
        type: "value",
        name: "X Axis",
        axisLabel: {
          formatter: (value: number) => {
            return value.toFixed(2);
          },
        },
      },
      yAxis: {
        type: "value",
        name: "Y Axis",
        axisLabel: {
          formatter: (value: number) => {
            return value.toFixed(2);
          },
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
  }, [title, lineColors]);
  const option = data ? dataOption : defaultOption;
  return (
    <Card className="w-full h-full" ref={cardRef}>
      <div className="absolute top-2 right-2 z-10 opacity-0 hover:opacity-100 transition-opacity duration-200">
        <Switch
          checked={fit}
          onChange={(checked) => setFit(checked)}
          checkedChildren="Fit"
          unCheckedChildren="Fit"
          style={{ marginLeft: 8 }}
        />
      </div>
      {isFitting && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1/2">
          <Progress percent={progress} status="active" />
        </div>
      )}
      <ReactECharts
        ref={echartsRef}
        autoResize={false}
        notMerge
        option={option}
        opts={{ renderer: "canvas" }}
      />
    </Card>
  );
};
export default LineChart;

// 注册 LineChart 组件对象
// eslint-disable-next-line react-refresh/only-export-components
export const RegisteredLineChart: RegisteredComponent<LineChartProps> = {
  meta: {
    type: "line-chart", // 组件类型标识
    name: "LineChart", // 组件名称
    icon: <LineChartOutlined />, // 可选的图标
    defaultProps: {
      // 默认属性
      title: "Line Chart",
      lineColors: ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"],
    },

    propSchema: {
      // 属性编辑器配置
      subjectDataId: {
        type: "select", // 或者根据实际需求选择合适的类型
        label: "Subject Data Id",
        placeholder: "Enter Subject Data Id",
        options: () => {
          return useSubjectStore
            .getState()
            .subjectDatas.filter((s) => s.data_type == "time")
            .map((s) => ({
              label: `${s.data_type}-${s.timestamp}-${s.id}`,
              value: s.id,
            }));
        },
      },
      lineColors: {
        type: "select", // 或者根据实际需求选择合适的类型
        label: "Line Colors",
        placeholder: "Enter line colors",
        mode: "multiple",
        options: ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"].map(
          (c) => ({
            label: c,
            value: c,
          })
        ),
      },
      title: {
        type: "text",
        label: "Title",
        placeholder: "Enter chart title",
      },
    },
  },
  component: LineChart, // 注册的组件
};
