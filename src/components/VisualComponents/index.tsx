import { useEditorStore } from "@/components/Editor/store";
import { registeredImageComponent } from "./DefaultComponent/Image";
import { RegisteredLineChart } from "./LineChartComponent";

export const useRegisterComponent=()=>{
    const { registerComponent } = useEditorStore();
    registerComponent(registeredImageComponent);
    registerComponent(RegisteredLineChart);
}