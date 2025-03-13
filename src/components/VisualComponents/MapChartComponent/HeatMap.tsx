import React, { useEffect, useRef } from "react";
import { RegionInterest } from "@/types/interest";
import { SubjectDataMeta } from "@/types/subject";
import ReactECharts, { EChartsOption } from "echarts-for-react";
import "echarts-extension-amap";
import locData from "./loc_data.json";
import { RegisteredComponent } from "@/components/Editor/types";

interface HeatMapProps {
  regionInterests: { interests: RegionInterest[]; meta: SubjectDataMeta }[];
}


const HeatMap: React.FC<HeatMapProps> = ({ regionInterests }) => {
  const echartsRef = useRef<InstanceType<typeof ReactECharts>>(null);

  useEffect(() => {
    if (!echartsRef.current) return;
  }, [echartsRef]);
  //@ts-expect-error 111
  const getOption: () => EChartsOption = () => {
    const data = regionInterests
      .flatMap((region) =>
        region.meta.keywords.map((kw) =>
          region.interests.map((interest) => {
            const location = locData.find(
              (loc) => loc.ISO_A2 === interest.geo_code
            );
            return {
              name: interest.geo_name,
              value: [
                location?.LABEL_X || 0,
                location?.LABEL_Y || 0,
                interest[kw],
                interest.geo_code,
                kw
              ],
            };
          })
        )
      )
      .flat();

    return {
      amap: {
        viewMode: "3D",
        center: [105.602725, 37.076636],
        resizeEnable: true,
        zoom: 4,
        mapStyle: "amap://styles/dark",
        lang: "en",
        roam: true,
      },
      tooltip: {
        trigger: "item",
        formatter: function (params) {
          //@ts-expect-error 111
          return `geo_name: ${params.name}<br/>geo_code: ${params.value[3]}<br/>keyword: ${params.value[4]}<br/>loc:${params.value[0]}<br/>lan:${params.value[1]}`;
        },
      },
      visualMap: {
        show: true,
        right: 20,
        min: 0,
        max: 100,
        seriesIndex: 0,
        calculable: true,
        inRange: {
          color: ['blue', 'blue', 'green', 'yellow', 'red']
        }
      },
      series: [
        {
          type: "heatmap",
          coordinateSystem: "amap",
          data,
          encode: {
            value: 2,
          },
          pointSize: 8,
          blurSize: 8
        },
        {
          type: "scatter",
          coordinateSystem: "amap",
          data,
          encode: {
            value: 2,
          },
          pointSize: 8,
          itemStyle :{
            opacity:0.1
          }
          
        },
      ],
    };
  };

  return (
    <ReactECharts
      ref={echartsRef}
      autoResize={true}
      option={getOption()}
      style={{ height: "100%", width: "100%" }}
    />
  );
};

export default HeatMap;
//注册组件
export const registeredHeatMapComponent: RegisteredComponent<HeatMapProps> =
  {
    meta: {
      type: "HeatMap",
      name: "热力地图组件",
      icon: <span>🗺️</span>,
      defaultProps: {
        regionInterests: [],
      },
      defaultLayout: {
        x: 0,
        y: 0,
        w: 2,
        h: 2,
      },
      propSchema: {
        regionInterests: {
          type: "select", // 或者根据实际需求选择合适的类型
          label: "Region Interests",
          placeholder: "Enter region interests",
          mode:"multiple"
        },
      },
    },
    component: HeatMap,
  };
