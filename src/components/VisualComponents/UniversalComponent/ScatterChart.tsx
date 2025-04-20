import React from "react";
import ReactECharts, { EChartsOption } from "echarts-for-react";

interface ScatterChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  title?: string;
  color?: string;
}

const ScatterChart: React.FC<ScatterChartProps> = ({ data, xKey, yKey, title, color }) => {
  const option:EChartsOption = {
    title: {
      text: title || "散点图",
      left: "center"
    },
    tooltip: {
      trigger: "item"
    },
    xAxis: {
      type: "value",
      name: xKey
    },
    yAxis: {
      type: "value",
      name: yKey
    },
    series: [
      {
        symbolSize: 12,
        data: data.map(row => [row[xKey], row[yKey]]),
        type: "scatter",
        itemStyle: {
          color: color || "#DC3912"
        }
      }
    ]
  };
  return <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />;
};

export default ScatterChart;