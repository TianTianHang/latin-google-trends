import { useEditorStore } from "@/components/Editor/store";
import { registeredImageComponent } from "./DefaultComponent/Image";
import { RegisteredLineChart } from "./LineChartComponent";
import { registeredHeatMapComponent } from "./MapChartComponent/HeatMap";
import { registeredMultiKeywordMapComponent } from "./MapChartComponent/MultiKeywordMap";
import { registeredZipfLawComponent } from "./ZipfLaw";
import { registeredGlobalMoranIndexComponent } from "./DefaultComponent/GlobalMoranIndex";

export const useRegisterComponent=()=>{
    const { registerComponent } = useEditorStore();
    registerComponent(registeredImageComponent);
    registerComponent(RegisteredLineChart);
    registerComponent(registeredHeatMapComponent);
    registerComponent(registeredMultiKeywordMapComponent);
    registerComponent(registeredGlobalMoranIndexComponent);
    registerComponent(registeredZipfLawComponent);
}
