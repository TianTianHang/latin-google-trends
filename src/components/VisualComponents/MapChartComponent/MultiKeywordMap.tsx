import React, { useEffect, useRef} from "react";
import { RegionInterest } from "@/types/interest";
import { SubjectDataMeta } from "@/types/subject";
import ReactECharts, { EChartsOption } from "echarts-for-react";
import "echarts-extension-amap";
import locData from "./loc_data.json";
import { RegisteredComponent } from "@/components/Editor/types";

interface MultiKeywordMapProps {
  regionInterests: { interests: RegionInterest[]; meta: SubjectDataMeta }[];
}
import icon1 from "./icons/peitubiaotouxiang-.png";
import icon2 from "./icons/touxiang_qinglvtouxiangnansheng3.png";
import icon3 from "./icons/touxiang_qinglvtouxiangnansheng4.png";
import icon4 from "./icons/touxiang_qinglvtouxiangnansheng5.png";
import icon5 from "./icons/touxiang_qinglvtouxiangnansheng6.png";
import icon6 from "./icons/touxiang_qinglvtouxiangnvsheng3.png";
import icon7 from "./icons/touxiang_qinglvtouxiangnvsheng5.png";
import icon8 from "./icons/touxiangshangchuan-datouxiang.png";
const icons = [icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8];
const MultiKeywordMap: React.FC<MultiKeywordMapProps> = ({
  regionInterests,
}) => {
  const echartsRef = useRef<InstanceType<typeof ReactECharts>>(null);

  useEffect(() => {
    if (!echartsRef.current) return;
  }, [echartsRef]);

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
                //@ts-expect-error 111
                location?.LABEL_X + Math.random()*2-1 || 0,
                //@ts-expect-error 111
                location?.LABEL_Y + Math.random()*2-1 || 0,
                interest[kw],
                interest.geo_code,
                kw,
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
      series: [
        {
          type: "scatter",
          coordinateSystem: "amap",
          data,
          encode: {
            value: 2,
          },
          symbol: function (value) {
      
              return 'image://'+icons[value[2]%icons.length]
          },
          symbolSize: 15,
          symbolOffset: [Math.random() * 20 - 10, Math.random() * 20 - 10],
          itemStyle: {
            opacity: 1,
          },
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

export default MultiKeywordMap;

export const registeredMultiKeywordMapComponent: RegisteredComponent<MultiKeywordMapProps> =
  {
    meta: {
      type: "MultiKeywordMap",
      name: "多关键词地图组件",
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
          type: "select",
          label: "Region Interests",
          placeholder: "Enter region interests",
          mode:"multiple"
        },
      },
    },
    component: MultiKeywordMap,
  };
