import React, { useMemo, useState } from "react";
import { RegionInterest } from "@/types/interest";
import ReactECharts, { EChartsOption } from "echarts-for-react";
import "echarts-extension-amap";
import locData from "./loc_data.json";
import { RegisteredComponent } from "@/components/Editor/types";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { SeriesOption } from "echarts";
import { Empty, Select } from "antd";
import { useAutoResizeChart } from "../hooks/useAutoResizeChart";
import { useSubjectData } from "@/hooks/useSubjectData";

interface HeatMapProps {
  subjectDataId?: number;
  index:number;
}

const HeatMap: React.FC<HeatMapProps> = ({ subjectDataId,index }) => {

  const data=useSubjectData(subjectDataId)
  const [selectedKeyword, setSelectedKeyword] = useState<string>();
  const { cardRef, echartsRef } = useAutoResizeChart();

  const dataOption: EChartsOption = useMemo(() => {
    if (data) {
      const series: SeriesOption[] = [];

      // 遍历每个 SubjectDataMeta 元素
      const metaItem = data.meta[index];
      // 只处理选中的keyword
      const keyword = selectedKeyword || metaItem.keywords[0];
      // 检查 data 是否包含 RegionInterest 类型的数据
      if (data.data instanceof Array && data.data[index] instanceof Array) {
        // 提取 RegionInterest 数据
        const regionInterestData = data.data[index] as RegionInterest[];

        // 创建系列数据
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

          itemStyle: {
            opacity: 0.1,
          },
        });
        //@ts-expect-error 111
        series.push({
          type: "heatmap",
          coordinateSystem: "amap",
          data: seriesData,
          encode: {
            value: 2,
          },
          pointSize: 8,
          blurSize: 8,
        });
      }

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
            return `value: ${params.value[2]}<br/>geo_name: ${params.name}<br/>geo_code: ${params.value[3]}<br/>keyword: ${params.value[4]}<br/>loc:${params.value[0]}<br/>lan:${params.value[1]}`;
          },
        },
        visualMap: {
          show: true,
          right: 20,
          min: 0,
          max: 100,
          seriesIndex: 1,
          calculable: true,
          inRange: {
            color: ["blue", "blue", "green", "yellow", "red"],
          },
        },
        series: series,
      };
    } else {
      return {};
    }
  }, [data, index, selectedKeyword]);

  return (
    <div ref={cardRef} className="h-full">
{ Object.keys(dataOption).length >0?(<>
  <div className="absolute top-2 right-2 z-10 opacity-0 hover:opacity-100 transition-opacity duration-3000">
        <Select
          style={{ width: 200, marginBottom: 16 }}
          value={selectedKeyword}
          options={data?.meta[index].keywords.map((kw) => ({
            label: kw,
            value: kw,
          }))}
          onChange={(value) => setSelectedKeyword(value)}
        />
      </div>
      <ReactECharts
        ref={echartsRef}
        autoResize={true}
        option={dataOption}
        style={{ height: "100%", width: "100%" }}
      />
</>):<Empty/>}
    </div>
  );
};

export default HeatMap;
//注册组件
export const registeredHeatMapComponent: RegisteredComponent<HeatMapProps> = {
  meta: {
    type: "HeatMap",
    name: "热力地图组件",
    icon: <span>🗺️</span>,
    defaultProps:{
        index:0,
    },
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
  component: HeatMap,
};
