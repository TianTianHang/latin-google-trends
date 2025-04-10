import React, { useMemo, useState } from "react";

import ReactECharts, { EChartsOption } from "echarts-for-react";
import "echarts-extension-amap";
import locData from "./loc_data.json";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { SeriesOption } from "echarts";
import { RegionInterest } from "@/types/interest";
import { Empty } from "antd";
import { RegisteredComponent } from "@/components/Editor/stores/registeredComponentsStore";
import { useDataBinding } from "@/components/Editor/hooks/useDataBinding";
import { SubjectDataResponse } from "@/types/subject";
import { useAutoResizeChart } from "../hooks/useAutoResizeChart";
import { downLoadTool } from "./mapDownload";
import { useFullscreen } from "ahooks";
const icons = Object.values(
  import.meta.glob("./icons/*.png", { eager: true, import: "default" })
).map((module) => module as string);
interface MultiKeywordMapProps {
  subjectId?: number;
  componentId: string;
  subjectDatas?: SubjectDataResponse[];
  index: number;
  step: number;
}
const MultiKeywordMap: React.FC<MultiKeywordMapProps> = ({
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
  const { cardRef, echartsRef } = useAutoResizeChart();
  const [zoom] = useState(2);
  const [, { toggleFullscreen }] = useFullscreen(cardRef);
  const dataOption: EChartsOption = useMemo(() => {
    if (data) {
      const series: SeriesOption[] = [];

      // 遍历每个 SubjectDataMeta 元素
      const metaItem = data.meta[step];
      // 遍历每个 keyword，创建一个系列
      metaItem.keywords.forEach((keyword: string) => {
        // 检查 data 是否包含 RegionInterest 类型的数据
        if (data.data instanceof Array && data.data[step] instanceof Array) {
          // 提取 RegionInterest 数据
          const regionInterestData = data.data[step] as RegionInterest[];

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
            .filter((item) => item&&item.value[2] as number>0); // 清除 undefined 值

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
              show: true,
              position: "top",
              formatter: (params) => {
                //@ts-expect-error 111
                return params.value[4];
              },
            },
            labelLayout: {
              moveOverlap:  'shiftY',
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
        toolbox: {
          feature: {
            myTool: downLoadTool(echartsRef,"multi-keyword-map"),
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
          zoom: zoom,
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
        animation: true,
        series: series,
      };
    } else {
      return {};
    }
  }, [data, echartsRef, step, toggleFullscreen, zoom]);

  return (
    <div ref={cardRef} className="h-full">
      {Object.keys(dataOption).length > 0 ? (
        <ReactECharts
          ref={echartsRef}
          autoResize={true}
          option={dataOption}
          style={{ height: "100%", width: "100%" }}
        />
      ) : (
        <Empty />
      )}
    </div>
  );
};

export default MultiKeywordMap;

// eslint-disable-next-line react-refresh/only-export-components
export const registeredMultiKeywordMapComponent: RegisteredComponent<MultiKeywordMapProps> =
  {
    meta: {
      type: "MultiKeywordMap",
      name: "multiKeywordMap",
      icon: <span>🗺️</span>,
      defaultProps: {
        index: 0,
        componentId: "",
        step: 0,
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
    component: MultiKeywordMap,
  };
