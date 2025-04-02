import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { Card } from "antd";
import { TimeInterest } from "@/types/interest";
import { SubjectDataMeta } from "@/types/subject";
import { RegisteredComponent } from "../Editor/stores/registeredComponentsStore";

interface ZipfLawProps {
  timeInterests: {
    interests: TimeInterest[];
    meta: SubjectDataMeta;
  }[];
}

const ZipfLaw: React.FC<ZipfLawProps> = ({ timeInterests }) => {
  const [time, setTime] = useState<null | string>(null);

const echartsRef = useRef<InstanceType<typeof ReactECharts>>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || !echartsRef.current) return;
    const echartsInstance = echartsRef.current.getEchartsInstance();
    const resizeObserver = new ResizeObserver(() => {
      echartsInstance.resize({
        width: cardRef.current?.offsetWidth,
        height: cardRef.current?.offsetHeight,
      });
    });

    resizeObserver.observe(cardRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [cardRef.current,echartsRef.current]);

  useEffect(() => {
    if (timeInterests.length == 0) return;
    setTime(timeInterests[0]?.interests[0]?.time_utc);
  }, [timeInterests]);
  const keywordFrequencies = useMemo(() => {
    if (!time) return [];
    const i = timeInterests[0].interests.filter((i) => i.time_utc == time)[0];
    const data = timeInterests[0].meta.keywords.map((kw) => {
      return { keyword: kw, frequency: i[kw] as number };
    });
    return data;
  }, [timeInterests]);
  // 按频率降序排序
  const sortedData = keywordFrequencies.sort(
    (a, b) => b.frequency - a.frequency
  );

  // 准备echarts数据
  const xData = sortedData.map((_, index) => index + 1);
  const yData = sortedData.map((item) => item.frequency);

  const option: EChartsOption = {
    title: {
      text: "Zipf定律可视化",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        console.log(params);
        const data = sortedData[params[0].dataIndex];
        return `排名: ${params[0].data[0]}<br/>关键词: ${data.keyword}<br/>频率: ${data.frequency}`;
      },
    },
    xAxis: {
      type: "log",
      name: "排名",
      nameLocation: "middle",
      nameGap: 30,
      logBase: 10,
    },
    yAxis: {
      type: "log",
      name: "频率",
      nameLocation: "middle",
      nameGap: 30,
      logBase: 10,
    },
    series: [
      {
        data: yData.map((y, index) => [xData[index], y]),
        type: "scatter",
        symbolSize: 8,
      },
      {
        type: "line",
        data: xData.map((x) => [x, yData[0] / x]),
        smooth: true,
        lineStyle: {
          color: "#ff7f50",
          width: 2,
          type: "dashed",
        },
        name: "Zipf定律预期",
      },
    ],
  };

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
    type: "analysis",
    name: "Zipf定律可视化",
    icon: <span>📈</span>,
    defaultProps: {
      timeInterests: [],
    },
    propSchema: {
      timeInterests: {
        type: "select", // 或者根据实际需求选择合适的类型
        label: "Time Interests",
        placeholder: "Enter time interests",
      },
    },
  },
  component: ZipfLaw,
};
