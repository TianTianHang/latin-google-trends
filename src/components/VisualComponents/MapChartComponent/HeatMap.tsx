import React, { useMemo, useState } from "react";
import { RegionInterest } from "@/types/interest";
import ReactECharts, { EChartsOption } from "echarts-for-react";
import "echarts-extension-amap";
import locData from "./loc_data.json";

import { useSubjectStore } from "@/stores/useSubjectStore";
import { SeriesOption } from "echarts";
import { Empty, Select } from "antd";
import { useAutoResizeChart } from "../hooks/useAutoResizeChart";
import { RegisteredComponent } from "@/components/Editor/stores/registeredComponentsStore";
import { useDataBinding } from "@/components/Editor/hooks/useDataBinding";
import { SubjectDataResponse } from "@/types/subject";
import { downLoadTool } from "./mapDownload";
import { useFullscreen } from "ahooks";

interface HeatMapProps {
  subjectId?: number;
  componentId: string;
  subjectDatas?: SubjectDataResponse[];
  index: number;
  step: number;
}

const HeatMap: React.FC<HeatMapProps> = ({
  subjectId,
  componentId,
  subjectDatas,
  index,
  step,
}) => {
  useDataBinding(`subject-${subjectId}`, componentId, "subjectDatas");
  const filterSubjectDatas = useMemo(() => {
    return subjectDatas?.filter((sd) => sd.data_type == "region");
  }, [subjectDatas]);
  const data = useMemo(() => {
    if (!filterSubjectDatas || filterSubjectDatas.length === 0) return null;
    if(filterSubjectDatas[index].data.length==0) return null;
    return filterSubjectDatas[index];
  }, [index, filterSubjectDatas]);

  const [selectedKeyword, setSelectedKeyword] = useState<string>();
  const { cardRef, echartsRef } = useAutoResizeChart();
  const [, { toggleFullscreen }] = useFullscreen(cardRef);
  const dataOption: EChartsOption = useMemo(() => {
    if (data) {
      const series: SeriesOption[] = [];

      // 遍历每个 SubjectDataMeta 元素
      const metaItem = data.meta[step];
      // 只处理选中的keyword
      const keyword = selectedKeyword || metaItem.keywords[0];
      // 检查 data 是否包含 RegionInterest 类型的数据
      if (data.data instanceof Array && data.data[step] instanceof Array) {
        // 提取 RegionInterest 数据
        const regionInterestData = data.data[step] as RegionInterest[];

        // 创建系列数据
        const seriesData = regionInterestData
          .map((item) => {
            const location = locData.find(
              (loc) => loc.ISO_A2 === item.geo_code
            );
            if (location?.LABEL_X && location?.LABEL_Y) {
              // 检查 LABEL_X 和 LABEL_Y 是否都有值
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
          })
          .filter((item) => item); // 清除 undefined 值

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
        toolbox: {
          feature: {
            myTool: downLoadTool(echartsRef,"heatmap"),
            myFullscreen: {
              show: true,
              title: '全屏',
              icon: 'image://src/assets/fullscreen.svg',
              onclick: toggleFullscreen
            }
          },
        },
        amap: {
          viewMode: "3D",
          center: [12.4964, 41.9028],
          resizeEnable: true,
          zoom: 2,
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
          type: "piecewise", // 使用分段型映射
          pieces: [
            { gt: 0, lte: 2, color: "#9FE7B8" }, // 0-2 显示浅绿色
            { gt: 2, lte: 5, color: "#2AC66F" }, // 2-5 显示中绿
            { gt: 5, lte: 10, color: "#008A3E" }, // 5-10 显示深绿色
            { gt: 10, lte: 30, color: "#FFFF00" }, // 10-30 显示黄色
            { gt: 30, lte: 60, color: "#FF7F00" }, // 30-60 显示橙色
            { gt: 60, lte: 100, color: "#FF0000" }, // 60-100 显示红色
          ],
          show: true,
          right: 20,
          min: 0,
          max: 100,
          seriesIndex: 1,
          calculable: true,
          inRange: {
            color: [
              "#9FE7B8",
              "#2AC66F",
              "#008A3E",
              "#FFFF00",
              "#FF7F00",
              "#FF0000",
            ],
          },
        },
        animation: true,
        series: series,
      };
    } else {
      return {};
    }
  }, [data, step, selectedKeyword, echartsRef, toggleFullscreen]);

  return (
    <div ref={cardRef} className="h-full">
      {Object.keys(dataOption).length > 0 ? (
        <>
          <div className="absolute top-2 left-2 z-10 opacity-0 hover:opacity-100 transition-opacity duration-3000">
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
        </>
      ) : (
        <Empty />
      )}
    </div>
  );
};

export default HeatMap;
//注册组件
// eslint-disable-next-line react-refresh/only-export-components
export const registeredHeatMapComponent: RegisteredComponent<HeatMapProps> = {
  meta: {
    type: "HeatMap",
    name: "heatMap",
    icon: <span>🗺️</span>,
    defaultProps: {
      index: 0,
      step: 0,
      componentId: "",
    },
    propSchema: {
      subjectId: {
        type: "select",
        label: "Subject Id",
        placeholder: "Enter Subject Id",
        options: async () => {
          const subjects = useSubjectStore.getState().allSubjects;
          return subjects.map((s) => ({
            label: `${s.subject_id}-${s.name}-${s.data_num}`,
            value: s.subject_id,
          }));
        },
      },
      step: {
        type: "number",
        label: "Step",
        placeholder: "Enter Step",
      },
    },
  },
  component: HeatMap,
};
