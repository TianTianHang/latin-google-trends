import type {
  IconFontLayerProps,
  LarkMapProps,
} from "@antv/larkmap";
import {
  FullscreenControl,
  IconFontLayer,
  LarkMap,
  LayerPopup,
  MapThemeControl,
} from "@antv/larkmap";
import loc_data from "@/components/Map/loc_data.json";
import { useEffect, useMemo, useState } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { RegionInterest } from "@/types/interest";
import { SubjectDataMeta } from "@/types/subject";



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

export interface IconFontMapProps {
  data: RegionInterest[];
  meta: SubjectDataMeta;
  currentStep: number;
}
interface MapData {
  geoCode: string;
  geoName: string;
  keyword: string;
  value: number;
}
const IconFontMap = ({ data, meta }: IconFontMapProps) => {
  const items = useMemo(() => {
    if (!meta) return [];

    return [
      {
        layer: "myIconFontLayer",
        fields: [
          ...(meta && meta.keywords
            ? meta.keywords.map((kw) => ({
                field: "value",
                formatField: (): string => kw,
                formatValue: (value: number) => (value ? value : "无"),
              }))
            : []),
          {
            field: "NAME_ZH",
            formatField: (): string => "country name",
          },
          {
            field: "ISO_A2",
            formatField: "ISO_A2",
          },
        ],
      },
    ];
  }, [meta]);

  const iconFontOptions = useMemo<Omit<IconFontLayerProps, "source">>(() => {
    const getRandomIcon = () => {
      const icons = ["oldman", "man1", "man2", "man3", "woman"];
      return icons[Math.floor(Math.random() * icons.length)];
    };

    return {
      autoFit: true,
      iconAtlas: {
        fontFamily: "iconfont",
        fontPath:
          "//at.alicdn.com/t/c/font_4840841_5wf9puodfzl.woff2?t=1740645634202",
        iconFonts: [
          ["oldman", "&#xe607;"],
          ["man1", "&#xe645;"],
          ["man2", "&#xe646;"],
          ["man3", "&#xe649;"],
          ["woman1", "&#xe648;"],
        ],
      },
      icon: {
        field: "value",
        value: () => getRandomIcon(),
      },
      iconStyle: {
        textAnchor: "center",
        textOffset: [0, 0],
        fontFamily: "iconfont",
        textAllowOverlap: true,
        iconfont: true,
      },
      filter: {
        field: "value",
        value: ({ value }) => !!value,
      },
      radius: {
        field: "value",
        value: ({ value }) => value / 5,
      },
      label: {
        field: "keyword",
        style: {
          fontFamily: "Times New Roman",
          opacity: 0.5,
          fontSize: 12,
          textAnchor: "top",
          textOffset: [0, 10],
          spacing: 1,
          padding: [5, 0],
          strokeWidth: 0.3,
        },
      },
      opacity: 1,
      state: {
        active: {
          color: "red",
        },
      },
    };
  }, [meta]);

  const originalData = useMemo(() => {
    if (!meta || data.length === 0) return [];
    const result: MapData[] = [];

    meta.keywords.forEach((kw) => {
      data.forEach((d) => {
        result.push({
          geoCode: d.geoCode,
          geoName: d.geoName,
          value: d[kw],
          keyword: kw,
        });
      });
    });

    return result;
  }, [meta, data]);

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
    if (data.length === 0 || !meta) return;
    setSource((prev) => ({
      ...prev,
      transforms: [
        {
          type: "join",
          targetField: "ISO_A2",
          sourceField: "geoCode",
          data: originalData,
        },
      ],
    }));
  }, [originalData, meta]);

  return (
    <Spin indicator={<LoadingOutlined spin />} size="large" spinning={loading}>
      <LarkMap {...config} style={{ height: "55vh" }}>
        <IconFontLayer
          {...iconFontOptions}
          source={source}
          id="myIconFontLayer"
        />

        <LayerPopup
          closeButton={false}
          closeOnClick={false}
          anchor="bottom-left"
          trigger="hover"
          items={items}
        />
        <MapThemeControl position="bottomright" />
        <FullscreenControl />
      </LarkMap>
    </Spin>
  );
};
export default IconFontMap;
