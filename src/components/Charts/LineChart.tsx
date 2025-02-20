import React, { useEffect, useMemo, useState } from "react";
import { Line, LineConfig } from "@ant-design/plots";
import { getRegionInterestByGeoCode } from "@/api/interest";
import dayjs from "dayjs";
import {
  fillMissingValuesAndTrim,
  generateTimeRangeAndValues,
  generateTimespans,
} from "@/utils/interest";
import { LoadingOutlined } from "@ant-design/icons";
import { Progress, Spin, Switch } from "antd";
import { fitModel, getFitProgress } from "@/api/cfc";
import { useDashBoardStore } from "@/stores/useDashBoardStore";


interface ChartData {
  timeframe: string;
  value: number;
  geo_code: string;
  timespans: number;
}

const LineChart: React.FC = () => {
  const {
    startDate,
    interval,
    geoData,
    keyword,
    selectedGeos,
    fitCodes,
    setGeoData,
  } = useDashBoardStore();
  const [loading, setLoading] = useState(false);
  const [fit, setFit] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFitting, setIsFitting] = useState(false);
  const [fitData, setFitData] = useState<ChartData[]>([]);
  const endDate = useMemo(() => dayjs(), []);

  const init = async () => {
    setLoading(true);
    try {
      const data = await getRegionInterestByGeoCode(
        selectedGeos,
        keyword,
        startDate,
        endDate
      );
      setGeoData(data);
    } catch (error) {
      console.error("Failed to fetch region interest:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, [selectedGeos, keyword]);

  const originalData = useMemo(() => {
    if (!geoData || Object.keys(geoData).length === 0) return [];
    const allData: ChartData[] = [];
    for (const geo_code in geoData) {
      const { time_range, values } = generateTimeRangeAndValues(
        geoData[geo_code],
        startDate,
        endDate,
        interval
      );
      time_range.forEach((timeframe, index) => {
        allData.push({
          timeframe,
          value: values[index] !== null ? values[index]! : 0,
          geo_code: geo_code,
          timespans: generateTimespans(
            timeframe.split(" - ")[0],
            startDate,
            interval
          ),
        });
      });
    }
    return allData;
  }, [geoData, interval, startDate, endDate]);

  const generateFitData = async (geo_code: string): Promise<ChartData[]> => {
    setIsFitting(true);
    try {
      const data = originalData.filter((d) => d.geo_code === geo_code);
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
          timeframe: d.timeframe,
          value: result?.values[index] || 0,
          geo_code: `${d.geo_code}-fit`,
          timespans: d.timespans,
        }));
      }
      const pollProgress = async (): Promise<ChartData[]> => {
        const data = await getFitProgress(task_id);
        if (data.status === "completed") {
          setIsFitting(false);
          setProgress(100);
          return originalData.map((d, index) => ({
            timeframe: d.timeframe,
            value: data.result?.values[index] || 0,
            geo_code: `${d.geo_code}-fit`,
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

  useEffect(() => {
    const fetchFitData = async () => {
      if (originalData.length === 0 || !fit) {
        setFitData([]);
        return;
      }

      const results = await Promise.all(
        fitCodes.map((code) => generateFitData(code))
      );
      setFitData(results.flat().filter(Boolean));
    };

    fetchFitData();
  }, [originalData, fitCodes, fit]);

  const formatTimeframe = (
    timeframe: string,
    interval: "day" | "month" | "year"
  ): string => {
    const [startDate, endDate] = timeframe.split(" - ");
    const startDayjs = dayjs(startDate);
    const endDayjs = dayjs(endDate);

    switch (interval) {
      case "day":
        return startDayjs.format("MM/DD");
      case "month":
        return startDayjs.format("MMM YYYY");
      case "year":
        return startDayjs.format("YYYY");
      default:
        return `${startDayjs.format("MM/DD")} - ${endDayjs.format("MM/DD")}`;
    }
  };

  const config: LineConfig = useMemo(
    () => ({
      data: [...originalData, ...fitData],
      xField: "timeframe",
      yField: "value",
      seriesField: "geo_code",
      colorField: "geo_code",
      height: 300,
      axis: {
        x: {
          visible: true,
          title: "Time",

          titleSpacing: 2,
          titleFontFamily: "Times New Roman",
          labelFormatter: (v: string) => formatTimeframe(v, interval),
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
          showLabel:false,
          style: {
          },
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
        lineDash: (data:ChartData[]) => {
          const mark=data[0].geo_code.split("-")[1]
          if ( mark&&mark=== 'fit') return [4, 4];
        },
      },
      theme: "classicDark"//or 'academy',
    }),
    [fitData, interval, originalData]
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
