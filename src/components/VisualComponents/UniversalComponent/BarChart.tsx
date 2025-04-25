import React from "react";
import ReactECharts, { EChartsOption } from "echarts-for-react";


interface BarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  title?: string;
  color?: string;

}

const BarChart: React.FC<BarChartProps> = ({ data, xKey, yKey, title, color }) => {
  const option:EChartsOption = {
    title: {
      text: title || "柱状图",
      left: "center"
    },
    tooltip: {
      trigger: "axis"
    },
    xAxis: {
      type: "category",
      data: data.map(row => row[xKey]),
      name: xKey
    },
    yAxis: {
      type: "value",
      name: yKey
    },
    series: [
      {
        data: data.map(row => row[yKey]),
        type: "bar",
        itemStyle: {
          color: color || "#3366CC"
        }
      }
    ]
  };
  return <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />;
};

export default BarChart;