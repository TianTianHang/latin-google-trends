import { useRegisteredComponentsStore } from "@/components/Editor/stores/registeredComponentsStore";
import { registeredImageComponent } from "./DefaultComponent/Image";
import { RegisteredLineChart } from "./LineChartComponent";
import { registeredHeatMapComponent } from "./MapChartComponent/HeatMap";
import { registeredMultiKeywordMapComponent } from "./MapChartComponent/MultiKeywordMap";
//import { registeredZipfLawComponent } from "./ZipfLaw";
import { registeredGlobalMoranIndexComponent } from "./DefaultComponent/GlobalMoranIndex";
import { registeredSliderBarComponent } from "./DefaultComponent/PlayerControlBar";
import { registeredZipfLawComponent } from "./ZipfLaw";
import { registeredDataMetaComponent } from "./DefaultComponent/DataMeta";
import { registeredLocalMoranIndexComponent } from "./MapChartComponent/LocalMoranIndex";
import { registeredUniversalComponent } from "./UniversalComponent";


export const useRegisterComponent = () => {
  const { registerComponent } = useRegisteredComponentsStore();
  registerComponent(registeredImageComponent);
  registerComponent(RegisteredLineChart);
  registerComponent(registeredHeatMapComponent);
  registerComponent(registeredMultiKeywordMapComponent);
  registerComponent(registeredGlobalMoranIndexComponent);
  registerComponent(registeredZipfLawComponent);
  registerComponent(registeredSliderBarComponent);
  registerComponent(registeredDataMetaComponent);
  registerComponent(registeredLocalMoranIndexComponent);
  registerComponent(registeredUniversalComponent);
};
