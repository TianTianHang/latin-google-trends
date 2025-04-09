import React, { useCallback, useMemo, useState } from "react";
import { useFullscreen, useRequest } from "ahooks";
import { Select, Spin } from "antd";
import { calculateLocalMoran } from "@/api/moran";
import { RegionInterest } from "@/types/interest";
import { SubjectDataResponse } from "@/types/subject";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { RegisteredComponent } from "@/components/Editor/stores/registeredComponentsStore";
import { useDataBinding } from "@/components/Editor/hooks/useDataBinding";
import { useTranslation } from "react-i18next";
import ReactECharts, { EChartsOption } from "echarts-for-react";
import "echarts-extension-amap";
import { zip } from "lodash";
import { useAutoResizeChart } from "../hooks/useAutoResizeChart";
import locData from "./loc_data.json";
import { downLoadTool } from "./mapDownload";

interface DataItem {
  value: number;
  geo_code: string;
}

interface LocalMoranIndexProps {
  componentId: string;
  subjectId?: number;
  subjectDatas?: SubjectDataResponse[];
  index: number;
  step: number;
}

const LocalMoranIndex: React.FC<LocalMoranIndexProps> = ({
  componentId,
  subjectId,
  subjectDatas,
  index = 0,
  step = 0,
}) => {
  const { t } = useTranslation("visualComponents");
  useDataBinding(`subject-${subjectId}`, componentId, "subjectDatas");
  const [selectedKeyword, setSelectedKeyword] = useState<string>();
  const { cardRef, echartsRef } = useAutoResizeChart();

  const filterSubjectDatas = useMemo(() => {
    return subjectDatas?.filter((sd) => sd.data_type == "region");
  }, [subjectDatas]);

  const moranData = useMemo(() => {
    if (!filterSubjectDatas || filterSubjectDatas.length === 0) return null;
    if(filterSubjectDatas[index].data.length==0) return null;
    return filterSubjectDatas[index];
  }, [index, filterSubjectDatas]);
  const [, { toggleFullscreen }] = useFullscreen(cardRef);
  const data: DataItem[] = useMemo(() => {
    if (moranData) {
      const metaItem = moranData.meta[step];
      const keyword = selectedKeyword || metaItem.keywords[0];
      if (
        moranData.data instanceof Array &&
        moranData.data[step] instanceof Array
      ) {
        const regionInterestData = moranData.data[step] as RegionInterest[];
        return regionInterestData.map((i) => ({
          value: i[keyword],
          geo_code: i.geo_code,
        }));
      }
    }
    return [];
  }, [moranData, selectedKeyword, step]);

  const { data: localMoranResults, loading } = useRequest(
    async () => {
      if (data.length === 0) return null;
      return await calculateLocalMoran({
        data: data.map((item) => item.value),
        iso_codes: data.map((item) => item.geo_code),
        missing_data_method: "interpolate",
      });
    },
    {
      refreshDeps: [data],
      onError: (error) => {
        console.error("Failed to fetch local moran index:", error);
      },
    }
  );

  const getOption: () => EChartsOption = useCallback(() => {
    if (!localMoranResults) return {};

    const values = localMoranResults.I;
    const min = Math.min(...values);

    const seriesData = zip(
      localMoranResults.I,
      localMoranResults.p_values,
      localMoranResults.z_scores,
      localMoranResults.type,
      data.map((item) => item.geo_code)
    )
      .map((item) => {
        const location = locData.find((loc) => loc.ISO_A2 === item[4]);
        if (location?.LABEL_X && location?.LABEL_Y) {
          return {
            name: item[4],
            value: [
              location.LABEL_X,
              location.LABEL_Y,
              item[0], // I值
              item[1], // p值
              item[2], // z分数
              item[3], // 聚类
              item[4], // geo_code
            ],
          };
        }
        return null;
      })
      .filter(Boolean);

    return {
      toolbox: {
        feature: {
          myTool: downLoadTool(echartsRef,"local-moran-index"),
          myFullscreen: {
            show: true,
            title: '全屏',
            icon: 'image://src/assets/fullscreen.svg',
            onclick: toggleFullscreen
          }
        },
      },
      // visualMap: {
      //   show: true,
      //   right: 20,
      //   type: "piecewise",
      //   min: 1,
      //   max: 4,
      //   inRange: {
      //     color: ['#FF4500', '#00FA9A', '#4B0082', '#FFD700']
      //   },
      //   pieces: [
      //     { min: 1, max: 1, label: "HH", color: "#FF4500" },
      //     { min: 2, max: 2, label: "LH", color: "#00FA9A" },
      //     { min: 3, max: 3, label: "LL", color: "#4B0082" },
      //     { min: 4, max: 4, label: "HL", color: "#FFD700" }
      //   ],
      //   dimension:6
      // },
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          return `${params.name}<br/>${t(
            "component.localMoran.tooltip.index"
          )}: ${params.value[2].toFixed(4)}<br/>${t(
            "component.localMoran.tooltip.pValue"
          )}: ${params.value[3].toFixed(4)}<br/>${t(
            "component.localMoran.tooltip.zScore"
          )}: ${params.value[4].toFixed(4)}<br/>${t(
            "component.localMoran.tooltip.cluster"
          )}: ${params.value[5] ? ['HH', 'LH', 'LL', 'HL'][params.value[5]] : ''}`;
        },
      },
      animation: true,
      series: [
        {
          name: t("component.localMoran.seriesName"),
          type: "scatter",
          coordinateSystem: "amap",
          data: seriesData,
          encode: {
            value: 2, // 使用I值作为视觉映射的值
          },
          symbolSize: (val) => {
            return (val[2] + Math.abs(min)) * 6;
          },

          itemStyle: {
            opacity: 1,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            color: (params: any) => {
              const colors = ["#FF4500", "#00FA9A ", "#4B0082", "#FFD700"];
              if (params.value[5]) {
                return colors[params.value[5]];
              } else {
                return "";
              }
            },
          },
        },
      ],
    };
  }, [data, echartsRef, localMoranResults, t, toggleFullscreen]);

  return (
    <div className="h-full" ref={cardRef}>
      <Spin spinning={loading} tip={t("component.localMoran.loading")} className="absolute"/>
      <div className="absolute top-2 left-2 z-10 opacity-0 hover:opacity-100 transition-opacity duration-3000">
        <Select
          style={{ width: 200, marginBottom: 16 }}
          value={selectedKeyword}
          options={moranData?.meta[index].keywords.map((kw) => ({
            label: kw,
            value: kw,
          }))}
          onChange={(value) => setSelectedKeyword(value)}
        />
      </div>
      <ReactECharts
        ref={echartsRef}
        autoResize={true}
        option={getOption()}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
};

export default LocalMoranIndex;

// eslint-disable-next-line react-refresh/only-export-components
export const registeredLocalMoranIndexComponent: RegisteredComponent<LocalMoranIndexProps> =
  {
    meta: {
      type: "LocalMoranIndex",
      name: "localMoran",
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
    component: LocalMoranIndex,
  };
