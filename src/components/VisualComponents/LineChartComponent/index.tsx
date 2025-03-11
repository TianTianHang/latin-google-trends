import React, { useEffect, useMemo, useRef } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { TimeInterest } from "@/types/interest";
import { SubjectDataMeta } from "@/types/subject";
import { RegisteredComponent } from "@/components/Editor/types";
import { LineChartOutlined } from "@ant-design/icons";
import { Card } from "antd";

interface LineChartProps {
  timeInterests?: {
    interests: TimeInterest[];
    meta: SubjectDataMeta;
  }[];
  lineColors?: string[];
  title?: string;
  width: number;
  height: number;
}

const LineChart: React.FC<LineChartProps> = ({
  timeInterests,
  lineColors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"],
  title,
}) => {
  const echartsRef = useRef<InstanceType<typeof ReactECharts>>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || !echartsRef.current) return;
    const echartsInstance = echartsRef.current.getEchartsInstance();
    const resizeObserver = new ResizeObserver(() => {
      echartsInstance.resize({
        width: cardRef.current?.offsetWidth,
        height: cardRef.current?.offsetHeight,
      });
    });

    resizeObserver.observe(cardRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  const option: EChartsOption = useMemo(() => {
    if (timeInterests) {
      const series = timeInterests.flatMap((group) => {
        return group.meta.keywords.map((keyword: string, index: number) => {
          return {
            name: keyword,

            data: group.interests.map((interest: TimeInterest) => [
              new Date(interest.time_utc).getTime(),
              interest[keyword],
            ]),
            itemStyle: {
              color: lineColors?.[index % lineColors.length],
            },
          };
        });
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
          axisLabel: {
            formatter: (value: number) => {
              return new Date(value).toLocaleString();
            },
          },
        },
        yAxis: {
          type: "value",
          name: "Value",
          nameLocation: "middle",
          nameGap: 30,
          axisLabel: {
            formatter: (value: number) => {
              return value.toFixed(2);
            },
          },
        },
        series,
      };
    } else {
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
    }
  }, [timeInterests, lineColors, title]);

  return (
    <Card className="w-full h-full" ref={cardRef}>
      <ReactECharts
        ref={echartsRef}
        autoResize={false}
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
      width: 600,
      height: 400,
      title: "Line Chart",
      lineColors: ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"],
    },
    defaultLayout: {
      // 默认布局配置（假设 Layout 是一个已定义的接口）
      x: 0,
      y: 0,
      w: 6,
      h: 4,
    },
    propSchema: {
      // 属性编辑器配置
      timeInterests: {
        type: "text", // 或者根据实际需求选择合适的类型
        label: "Time Interests",
        placeholder: "Enter time interests",
      },
      lineColors: {
        type: "text", // 或者根据实际需求选择合适的类型
        label: "Line Colors",
        placeholder: "Enter line colors",
      },
      title: {
        type: "text",
        label: "Title",
        placeholder: "Enter chart title",
      },
      width: {
        type: "number",
        label: "Width",
        placeholder: "Enter width",
      },
      height: {
        type: "number",
        label: "Height",
        placeholder: "Enter height",
      },
    },
  },
  component: LineChart, // 注册的组件
};
