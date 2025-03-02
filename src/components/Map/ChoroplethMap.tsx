import type {
  LarkMapProps,
  LayerPopupProps,
  PolygonLayerProps,
} from "@antv/larkmap";
import {
  CustomControl,
  FullscreenControl,
  LarkMap,
  LayerPopup,
  LegendRamp,
  MapThemeControl,
  PolygonLayer,
} from "@antv/larkmap";
import geojson from "@/components/Map/geojson.json";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { RegionInterest } from "@/types/interest";
import { SubjectDataMeta } from "@/types/subject";
import { LoadingOutlined } from "@ant-design/icons";


const colors = [
  "#B8E1FF",
  "#7DAAFF",
  "#3D76DD",
  "#0047A5",
  "#001D70",
  "#000B3C",
  "#000522",
];
const labels = ["0", "30", "50", "70", "85", "95", "100"];

const config: LarkMapProps = {
  mapType: "Mapbox",
  mapOptions: {
    mapStyle: "mapbox://styles/mapbox/dark-v11",
    center: [41.9028, 12.4964],
    minZoom:1,
    maxZoom:8,
    zoom: 1,
    accessToken: "pk.eyJ1IjoidGlhbnRpYW4xIiwiYSI6ImNsY3g5enc2dTA3NHkzcG9kazl4c2wzYWIifQ.Ue4XzsBbeT2PAc-yPUjT5w",
    language:"en",
    worldview:"CN"
  },
};


export interface ChoroplethMapProps {
  data: RegionInterest[];
  meta: SubjectDataMeta;
  currentStep: number;
}
const ChoroplethMap = ({ data, meta }: ChoroplethMapProps) => {
  const [items, setItems] = useState<LayerPopupProps["items"]>([]);
  const [polygonOptions, setPolygonOptions] = useState<Omit<PolygonLayerProps, "source"> | null>(null);

  useEffect(() => {
    if (!meta) return;

    setItems([
      {
        layer: "myPolygonLayer",
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

    setPolygonOptions({
      autoFit: true,
      shape: "fill",
      color: {
        field: meta?.keywords?.[0],
        value: colors,
        scale: { type: "quantile" },
      },
      state: {
        active: true,
      },
      style: {
        opacity: 0.6,
      },
    });
  }, [meta]);

  const [source, setSource] = useState({
    data: geojson,
    parser: { type: "geojson" },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (data.length === 0 || !meta) return;
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
        <PolygonLayer {...polygonOptions} source={source} id="myPolygonLayer" />

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
export default ChoroplethMap;
