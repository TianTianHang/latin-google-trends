import React, { useEffect, useMemo, useState } from "react";
import { Line, LineConfig } from "@ant-design/plots";
import {
  fillMissingValuesAndTrim,
} from "@/utils/interest";
import { LoadingOutlined } from "@ant-design/icons";
import { Progress, Spin, Switch } from "antd";
import { fitModel, getFitProgress } from "@/api/cfc";
import { TimeInterest } from "@/types/interest";
import { SubjectDataMeta } from "@/types/subject";

interface ChartData {
  time: string;
  value: number;
  geo_code: string;
  keyword: string;
  timespans: number;
}

interface LineChartProps {
  data: TimeInterest[];
  meta: SubjectDataMeta;
  currentStep: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, meta }) => {
  const [loading] = useState(false);
  const [fit, setFit] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFitting, setIsFitting] = useState(false);

  const [fitData, setFitData] = useState<ChartData[]>([]);
  const originalData = useMemo(() => {
    if (!meta || data.length === 0) return [];
    return meta.keywords.flatMap((kw) =>
      data.map((d, i) => ({
        time: d["time [UTC]"],
        value: d[kw],
        keyword: kw,
        geo_code: meta.geo_code || "world",
        timespans: i,
      }))
    );
  }, [data, meta]);

  useEffect(() => {
    if (!meta || originalData.length == 0) return;
    if (!fit) return;
    const fit_ = async () => {
      const fitData: ChartData[] = [];
      for (const kw of meta.keywords) {
        fitData.push(...await generateFitData(kw))
      }
      setFitData(fitData);
    };
    fit_();
  }, [originalData, fit]);

  const generateFitData = async (kw: string): Promise<ChartData[]> => {
    setIsFitting(true);
    try {
      const data = originalData.filter((d) => d.keyword === kw);
      const fillValues = fillMissingValuesAndTrim(
        data.map((d) => d.value),
        "linear"
      );

      if (!fillValues) {
        throw new Error("插值失败");
      }

      const { task_id, result } = await fitModel({
        timespans: data.map((d) => d.timespans),
        values: fillValues,
      });

      if (result) {
        return originalData.map((d, index) => ({
          time: d.time,
          value: result?.values[index] || 0,
          keyword: `${d.keyword}-fit`,
          geo_code: d.geo_code,
          timespans: d.timespans,
        }));
      }
      const pollProgress = async (): Promise<ChartData[]> => {
        const data = await getFitProgress(task_id);
        console.log(data);
        if (data.status === "completed") {
          setIsFitting(false);
          setProgress(100);
          return originalData.map((d, index) => ({
            time: d.time,
            value: data.result?.values[index] || 0,
            keyword: `${d.keyword}-fit`,
            geo_code: d.geo_code,
            timespans: d.timespans,
          }));
        } else if (data.status === "processing") {
          setProgress(data.progress || 0);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          return pollProgress();
        }
        return [];
      };

      return await pollProgress();
    } catch (err) {
      console.error("Failed to generate fit data:", err);
      return [];
    } finally {
      setIsFitting(false);
    }
  };

  const config: LineConfig = useMemo(
    () => ({
      data: [...originalData, ...fitData],
      xField: "time",
      yField: "value",
      seriesField: "keyword",
      colorField: "keyword",
      height: 300,
      axis: {
        x: {
          visible: true,
          title: "Time",

          titleSpacing: 2,
          titleFontFamily: "Times New Roman",
          labelFontSize: 10,

          labelFontFamily: "Times New Roman",
          labelAutoRotate: true,

          labelFilter: (_: unknown, index: number) => index % 10 === 0,
        },
        y: {
          visible: true,
          title: "GT Index",

          titleSpacing: 15,
          titleFontFamily: "Times New Roman",
          ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        },
      },
      slider: {
        x: {
          sparklineType: "line",
          values: [0, 0.3],
          showLabel: false,
          style: {},
        },
      },
      legend: {
        color: {
          itemLabelFontSize: 10,
          itemLabelFontFamily: "Times New Roman",
        },
      },
      tooltip: {
        title: "timeframe",
        items: [{ channel: "y" }],
      },
      animate: {
        enter: { type: "growInX" },
        update: { type: "growInX" },
      },
      style: {
        lineWidth: 2,
        lineDash: (data: ChartData[]) => {
          const mark = data[0].geo_code.split("-")[1];
          if (mark && mark === "fit") return [4, 4];
        },
      },
      theme: "classicDark", //or 'academy',
    }),
    [fitData, originalData]
  );

  return (
    <Spin indicator={<LoadingOutlined spin />} size="large" spinning={loading}>
      <div className="relative">
        <Line {...config} />
        <div className="absolute top-2 right-2 z-10 opacity-0 hover:opacity-100 transition-opacity duration-200">
          <Switch
            checked={fit}
            onChange={(checked) => setFit(checked)}
            checkedChildren="Fit"
            unCheckedChildren="Fit"
            style={{ marginLeft: 8 }}
          />
        </div>
      </div>
      {isFitting && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1/2">
          <Progress percent={progress} status="active" />
        </div>
      )}
    </Spin>
  );
};

export default LineChart;
