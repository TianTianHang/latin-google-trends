import React from "react";
import ReactECharts, { EChartsOption } from "echarts-for-react";


interface PieChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  title?: string;
  colors?: string[];
 
}

const PieChart: React.FC<PieChartProps> = ({ data, xKey:nameKey, yKey:valueKey, title, colors }) => {
  const option:EChartsOption = {
    title: {
      text: title || "饼图",
      left: "center"
    },
    tooltip: {
      trigger: "item"
    },
    legend: {
      orient: "vertical",
      left: "left"
    },
    series: [
      {
        name: title || "饼图",
        type: "pie",
        radius: "50%",
        data: data.map(row => ({ name: row[nameKey], value: row[valueKey] })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      }
    ],
    color: colors || undefined
  };
  return <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />;
};

export default PieChart;