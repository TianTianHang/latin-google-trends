import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { Card, ColorPickerProps, GetProp } from "antd";
import { useTranslation } from "react-i18next";
import { RegisteredComponent } from "../Editor/stores/registeredComponentsStore";
import { SubjectDataResponse } from "@/types/subject";
import { useDataBinding } from "../Editor/hooks/useDataBinding";
import { TimeInterest } from "@/types/interest";
import { useAutoResizeChart } from "./hooks/useAutoResizeChart";
import { useSubjectStore } from "@/stores/useSubjectStore";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Color = Extract<GetProp<ColorPickerProps, 'value'>, string | { cleared: any }>;
interface ZipfLawProps {
  componentId: string;
  subjectId?: number;
  subjectDatas?: SubjectDataResponse[];
  index: number; // x选择的subject data
  step: number; // 在某个data中的第几个
  lineColor:string | Color;
}

const ZipfLaw: React.FC<ZipfLawProps> = ({
  componentId,
  subjectId,
  subjectDatas,
  index,
  step,
  lineColor="#ff0000"
}) => {
  const { cardRef, echartsRef } = useAutoResizeChart();
  const { t } = useTranslation("visualComponents");
  useDataBinding(`subject-${subjectId}`, componentId, "subjectDatas");
  const filterSubjectDatas = useMemo(() => {
    return subjectDatas?.filter((sd) => sd.data_type == "time");
  }, [subjectDatas]);
  const data = useMemo(() => {
    if (!filterSubjectDatas || filterSubjectDatas.length === 0) return null;

    return filterSubjectDatas[index];
  }, [index, filterSubjectDatas]);

  const option = useMemo<EChartsOption>(() => {
    if (!data) return {};

    // 获取当前步骤的数据和元数据
    const currentData = data.data[step] as TimeInterest[];
    const currentMeta = data.meta[step];

    // 计算词频总和
    const totalFrequency = currentData.reduce((sum, item) => {
      return sum + currentMeta.keywords.reduce((sum, kw) => sum + item[kw], 0);
    }, 0);

    // 准备Zipf定律数据
    const zipfData = currentMeta.keywords
      .map((keyword) => {
        const frequency = currentData.reduce(
          (sum, item) => sum + item[keyword],
          0
        );
        const relativeFrequency = frequency / totalFrequency;
        return {
          name: keyword,
          frequency: relativeFrequency,
        };
      })
      .sort((a, b) => b.frequency - a.frequency);

    // 计算Zipf定律参数
    const logFrequencies = zipfData.map((item) => Math.log(item.frequency));
    const logRanks = zipfData.map((item, index) => Math.log(index + 1));

    // 最小二乘法拟合Zipf曲线 (f(r) = C / r^s)
    const n = zipfData.length;
    const sumLogRank = logRanks.reduce((sum, val) => sum + val, 0);
    const sumLogFreq = logFrequencies.reduce((sum, val) => sum + val, 0);
    const sumLogRankLogFreq = logRanks.reduce(
      (sum, val, i) => sum + val * logFrequencies[i],
      0
    );
    const sumLogRankSquared = logRanks.reduce((sum, val) => sum + val * val, 0);

    const slope =
      (n * sumLogRankLogFreq - sumLogRank * sumLogFreq) /
      (n * sumLogRankSquared - sumLogRank * sumLogRank);
    const intercept = (sumLogFreq - slope * sumLogRank) / n;

    const C = Math.exp(intercept);
    const s = -slope;

    // 生成理论曲线数据
    const theoreticalData = zipfData.map((item, index) => ({
      name: item.name,
      value: [index, C / Math.pow(index + 1, s)],
    }));

    // 计算RMSE
    let sumSquaredError = 0;
    zipfData.forEach((item, index) => {
      const actual = item.frequency;
      const predicted = C / Math.pow(index + 1, s);
      sumSquaredError += Math.pow(actual - predicted, 2);
    });
    const rmse = Math.sqrt(sumSquaredError / zipfData.length);

    return {
      title: {
        text: `${t("component.zipfLaw.title", {
          timeframe: `${currentMeta.timeframe_start} ${currentMeta.timeframe_end}`,
        })}\nRMSE: ${rmse.toFixed(6)}`,
        left: "center",
      },
      tooltip: {
        trigger: "item",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          console.log(params);
          return `${t("component.zipfLaw.tooltip.word")}: ${
            params.data.name
          }<br/>
                 ${t("component.zipfLaw.tooltip.rank")}: ${
            params.data.value[0] + 1
          }<br/>
                 ${t(
                   "component.zipfLaw.tooltip.frequency"
                 )}: ${params.data.value[1].toFixed(6)}`;
        },
      },
      xAxis: {
        type: "value",
        name: t("component.zipfLaw.xAxis"),
        nameLocation: "middle",
        nameGap: 30,
      },
      yAxis: {
        type: "log",
        name: t("component.zipfLaw.yAxis"),
        nameLocation: "middle",
        nameGap: 30,
      },
      series: [
        {
          type: "scatter",
          symbolSize: 10,
          data: zipfData.map((item, index) => ({
            name: item.name,
            value: [index, item.frequency],
          })),
          label: {
            show: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) => params.data.name,
            position: "top",
          },
          emphasis: {
            label: {
              show: true,
            },
          },
          name:t("component.zipfLaw.legend.actual"),
        },
        {
          type: "line",
          data: theoreticalData,
          smooth: true,
          lineStyle: {
            color: typeof lineColor === 'string' ? lineColor : lineColor.toCssString(),
            width: 2,
          },
          showSymbol: false,
          name: t("component.zipfLaw.legend.theory"),
        },
      ],
      legend: {
        right: "10%",
        top:"15%",
        data: [
         {name:t("component.zipfLaw.legend.actual")},{name:t("component.zipfLaw.legend.theory")}
        ],
      },
    };
  }, [data, lineColor, step, t]);

  return (
    <Card className="w-full h-full" ref={cardRef}>
      <ReactECharts
        ref={echartsRef}
        option={option}
        style={{ height: "100%", width: "100%" }}
        autoResize={false}
        
      />
    </Card>
  );
};

export default ZipfLaw;

// 注册组件
// eslint-disable-next-line react-refresh/only-export-components
export const registeredZipfLawComponent: RegisteredComponent<ZipfLawProps> = {
  meta: {
    type: "ZipfLaw",
    name: "zipfLaw",
    icon: <span>📈</span>,
    defaultProps: {
      componentId: "",
      index: 0,
      step: 0,
      lineColor: "#ff0000"
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
      lineColor:{
        type: "color"
      }
    },
  },
  component: ZipfLaw,
};
