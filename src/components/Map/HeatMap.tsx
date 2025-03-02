import type {
  HeatmapLayerProps,
  LarkMapProps,
  LayerPopupProps,
  PointLayerProps,
} from "@antv/larkmap";
import {
  CustomControl,
  FullscreenControl,
  HeatmapLayer,
  LarkMap,
  LayerPopup,
  LegendRamp,
  MapThemeControl,
  PointLayer,
} from "@antv/larkmap";
import loc_data from "@/components/Map/loc_data.json";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { RegionInterest } from "@/types/interest";
import { SubjectDataMeta } from "@/types/subject";

const colors = [
  "#FF0000", // 红色，映射到 0
  "#FF6600", // 橙色，映射到 30
  "#FFCC00", // 黄色，映射到 50
  "#66FF66", // 浅绿色，映射到 70
  "#33CCFF", // 浅蓝色，映射到 85
  "#0000FF", // 蓝色，映射到 95
  "#800080", // 紫色，映射到 100
];
const labels = ["0", "30", "50", "70", "85", "95", "100"];

const config: LarkMapProps = {
  mapType: "Mapbox",
  mapOptions: {
    style: "mapbox://styles/mapbox/dark-v11",
    center: [41.9028, 12.4964],
    minZoom: 1,
    maxZoom: 8,
    zoom: 1,
    accessToken:
      "pk.eyJ1IjoidGlhbnRpYW4xIiwiYSI6ImNsY3g5enc2dTA3NHkzcG9kazl4c2wzYWIifQ.Ue4XzsBbeT2PAc-yPUjT5w",
    language: "en",
    worldview: "CN",
  },
  logoVisible: false,
};



//组件开始

export interface HeatMapProps {
  data: RegionInterest[];
  meta: SubjectDataMeta;
  currentStep:number;
}
const HeatMap = ({ data, meta }: HeatMapProps) => {

  const [items, setItems] = useState<LayerPopupProps["items"]>([]);
  const [heatOptions, setHeatOptions] = useState<Omit<HeatmapLayerProps, "source"> | null>(null);

  useEffect(() => {
    if (!meta) return;

    setItems([
      {
        layer: "myPointLayer",
        fields: [
          {
            field: "NAME_ZH",
            formatField: () => "country name",
          },
          {
            field: "ISO_A2",
            formatField: "ISO_A2",
          },
          {
            field: meta?.keywords?.[0],
            formatField: () => "搜索指数",
            formatValue: (value) => (value ? value : "无"),
          },
        ],
      },
    ]);

    setHeatOptions({
      autoFit: true,
      shape: "heatmap" as const,
      size: {
        field: meta?.keywords?.[0],
        value: (item) => item[meta?.keywords?.[0]] / 50,
      },
      state: {
        active: true,
      },
      style: {
        intensity: 3,
        radius: 20,
        opacity: 1,
        rampColors: {
          colors: colors,
          positions: [0, 0.3, 0.5, 0.7, 0.85, 0.95, 1],
        },
      },
    });
  }, [meta]);
  
  const [pointOptions] = useState<Omit<PointLayerProps, "source">>({
    autoFit: true,
    shape: "circle",
    size: {
      value: () => {
        return 10;
      },
    },
    state: {
      active: false,
    },
    color: "rgba(0, 0, 0, 0.1)",
    style: {
      opacity: 0.1,
    },
  });
  const [source, setSource] = useState({
    data: loc_data,
    parser: { type: "json", x: "LABEL_X", y: "LABEL_Y" },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if(data.length === 0||!meta) return;
    setSource((prev) => ({
      ...prev,
      transforms: [
        {
          type: "join",
          targetField: "ISO_A2",
          sourceField: "geoCode",
          data: data,
        },
      ],
    }));
    
  }, [data, meta]);

  return (
    <Spin indicator={<LoadingOutlined spin />} size="large" spinning={loading}>
      <LarkMap {...config} style={{ height: "55vh" }}>
        <HeatmapLayer {...heatOptions} source={source}/>
        <PointLayer {...pointOptions} source={source} id="myPointLayer" />

        <LayerPopup
          closeButton={false}
          closeOnClick={false}
          anchor="bottom-left"
          trigger="hover"
          items={items}
        />
        <MapThemeControl position="bottomright" />
        <FullscreenControl />
        <CustomControl position="bottomleft">
          <LegendRamp labels={labels} colors={colors} />
        </CustomControl>
      </LarkMap>
    </Spin>
  );
};
export default HeatMap;
