// 集中注册UniversalComponent下的可视化组件
import { RegisteredComponent } from "@/components/Editor/stores/registeredComponentsStore";
import BarChart from "./BarChart";
import LineChart, { LineChartProps } from "./LineChart";
import PieChart from "./PieChart";
import ScatterChart from "./ScatterChart";


export const registeredBarChartComponent: RegisteredComponent<any> = {
    meta: {
        type: "BarChart",
        name: "barChart",
        icon: <span>📊</span>,
        defaultProps: {
            data: [],
            xKey: "x",
            yKey: "y",
            title: "柱状图",
            color: "#3366CC"
        },
        propSchema: {
            data: { type: "json", label: "数据" },
            xKey: { type: "text", label: "X轴字段" },
            yKey: { type: "text", label: "Y轴字段" },
            title: { type: "text", label: "标题" },
            color: { type: "color", label: "颜色" }
        }
    },
    component: BarChart
};

export const registeredLineChartComponent: RegisteredComponent<LineChartProps> = {
    meta: {
        type: "LineChart",
        name: "lineChart",
        icon: <span>📈</span>,
        defaultProps: {
            data: [],
            xKey: "x",
            yKey: "y",
            title: "折线图",
            color: "#109618",
            componentId: "",
            sourceId: ""
        },
        propSchema: {
            sourceId: { type: "text", label: "数据源ID" },
            xKey: { type: "text", label: "X轴字段" },
            yKey: { type: "text", label: "Y轴字段" },
            title: { type: "text", label: "标题" },
            color: { type: "color", label: "颜色" }
        }
    },
    component: LineChart
};

export const registeredPieChartComponent: RegisteredComponent<any> = {
    meta: {
        type: "PieChart",
        name: "pieChart",
        icon: <span>🥧</span>,
        defaultProps: {
            data: [],
            nameKey: "name",
            valueKey: "value",
            title: "饼图",
            colors: ["#3366CC", "#DC3912", "#FF9900"]
        },
        propSchema: {
            data: { type: "json", label: "数据" },
            nameKey: { type: "text", label: "名称字段" },
            valueKey: { type: "text", label: "数值字段" },
            title: { type: "text", label: "标题" },
            colors: { type: "json", label: "颜色数组" }
        }
    },
    component: PieChart
};

export const registeredScatterChartComponent: RegisteredComponent<any> = {
    meta: {
        type: "ScatterChart",
        name: "scatterChart",
        icon: <span>🔵</span>,
        defaultProps: {
            data: [],
            xKey: "x",
            yKey: "y",
            title: "散点图",
            color: "#DC3912"
        },
        propSchema: {
            data: { type: "json", label: "数据" },
            xKey: { type: "text", label: "X轴字段" },
            yKey: { type: "text", label: "Y轴字段" },
            title: { type: "text", label: "标题" },
            color: { type: "color", label: "颜色" }
        }
    },
    component: ScatterChart
};
