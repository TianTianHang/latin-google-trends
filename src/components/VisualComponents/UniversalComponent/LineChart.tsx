import React from "react";
import ReactECharts, { EChartsOption } from "echarts-for-react";
import { useDataBinding } from "@/components/Editor/hooks/useDataBinding";

export interface LineChartProps {
    data: Array<Record<string, any>>;
    xKey: string;
    yKey: string;
    title?: string;
    color?: string;
    componentId: string;
    sourceId: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, xKey, yKey, title, color, componentId, sourceId }) => {
    useDataBinding(sourceId, componentId, "data")
    const option: EChartsOption = {
        title: {
            text: title || "折线图",
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
                type: "line",
                itemStyle: {
                    color: color || "#109618"
                },
                smooth: true
            }
        ]
    };
    return <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />;
};

export default LineChart;