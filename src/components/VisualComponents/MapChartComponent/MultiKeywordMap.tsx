import React, { useEffect, useMemo, useRef, useState } from "react";

import ReactECharts, { EChartsOption } from "echarts-for-react";
import "echarts-extension-amap";
import locData from "./loc_data.json";
import { RegisteredComponent } from "@/components/Editor/types";

interface MultiKeywordMapProps {
  subjectDataId?: number;
}
import icon1 from "./icons/peitubiaotouxiang-.png";
import icon2 from "./icons/touxiang_qinglvtouxiangnansheng3.png";
import icon3 from "./icons/touxiang_qinglvtouxiangnansheng4.png";
import icon4 from "./icons/touxiang_qinglvtouxiangnansheng5.png";
import icon5 from "./icons/touxiang_qinglvtouxiangnansheng6.png";
import icon6 from "./icons/touxiang_qinglvtouxiangnvsheng3.png";
import icon7 from "./icons/touxiang_qinglvtouxiangnvsheng5.png";
import icon8 from "./icons/touxiangshangchuan-datouxiang.png";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { SeriesOption } from "echarts";
import { RegionInterest } from "@/types/interest";
const icons = [icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8];

const MultiKeywordMap: React.FC<MultiKeywordMapProps> = ({ subjectDataId }) => {
  const echartsRef = useRef<InstanceType<typeof ReactECharts>>(null);
  const { subjectDatas } = useSubjectStore();
  const data = useMemo(() => {
    const subject = subjectDatas.find((s) => s.id == subjectDataId);
    return subject ? subject : null;
  }, [subjectDataId, subjectDatas]);
  const [index, _setIndex] = useState(0);
  useEffect(() => {
    if (!echartsRef.current) return;
  }, [echartsRef]);
  const dataOption: EChartsOption = useMemo(() => {
    if (data) {
      const series: SeriesOption[] = [];

      // 遍历每个 SubjectDataMeta 元素
      const metaItem = data.meta[index];
      // 遍历每个 keyword，创建一个系列
      metaItem.keywords.forEach((keyword) => {
        // 检查 data 是否包含 RegionInterest 类型的数据
        if (data.data instanceof Array && data.data[index] instanceof Array) {
          // 提取 RegionInterest 数据
          const regionInterestData = data.data[index] as RegionInterest[];

          const seriesData = regionInterestData.map((item) => {
            const location = locData.find((loc) => loc.ISO_A2 === item.geo_code);
            if (location?.LABEL_X && location?.LABEL_Y) { // 检查 LABEL_X 和 LABEL_Y 是否都有值
              return {
                name: item.geo_name,
                value: [
                  location.LABEL_X,
                  location.LABEL_Y,
                  item[keyword],
                  item.geo_code,
                  keyword,
                ],
              };
            }
            // 如果 LABEL_X 或 LABEL_Y 无值，则不返回任何内容，相当于跳过该元素
          }).filter(item => item); // 清除 undefined 值

          // 添加到 series 数组
          series.push({
            type: "scatter",
            coordinateSystem: "amap",
            data: seriesData,
            encode: {
              value: 2,
            },
            symbol: function (value) {
              return "image://" + icons[value[2] % icons.length];
            },
            label: {
              show:true,
              position:"top",
              formatter:(params)=>{
                //@ts-expect-error 111
                return params.value[4];
              }
            },
            symbolSize: 15,
            symbolOffset: [Math.random() * 20 - 10, Math.random() * 20 - 10],
            itemStyle: {
              opacity: 1,
            },
          });
        }
      });
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
        series: series,
      };
    }else{
      return {}
    }
  }, [data, index]);

  return (
    <ReactECharts
      ref={echartsRef}
      autoResize={true}
      option={dataOption}
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

      propSchema: {
        subjectDataId: {
          type: "select", // 或者根据实际需求选择合适的类型
          label: "Subject Data Id",
          placeholder: "Enter Subject Data Id",
          options: () => {
            return useSubjectStore
              .getState()
              .subjectDatas.filter((s) => s.data_type == "region")
              .map((s) => ({
                label: `${s.data_type}-${s.timestamp}-${s.id}`,
                value: s.id,
              }));
          },
        },
      },
    },
    component: MultiKeywordMap,
  };
