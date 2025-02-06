import Plot from "react-plotly.js";
import React, { useEffect, useMemo, useState } from "react";
import { getInterestByRegion } from "@/api/googleTrends";
import { TrendsByRegion } from "@/types/google-trends";
import { getCountryCoordinates } from "@/utils/countries";
import { TimeSeriesData } from "@/types/data";
import { Input } from "antd";

// 预定义时间范围数组
const timeRanges = [
  "2004-01-01 2005-01-01",
  "2005-01-01 2006-01-01",
  "2006-01-01 2007-01-01",
  // 添加更多时间段...
];
const MapDensityHeatmap: React.FC = () => {
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [timeSeriesData, setTimeSeriesData] = useState<
    TimeSeriesData<TrendsByRegion[]>[]
  >([]);
  const [loading, setLoading] = useState(true);

  const keyword = "latin(language)";
  // 根据当前时间索引获取数据
  useEffect(() => {
      const loadData = async () => {
      const dateRange = timeRanges[currentTimeIndex];

      // 如果已有缓存数据则跳过请求
      if (timeSeriesData[currentTimeIndex]) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data: rawData } = await getInterestByRegion({
          q: keyword,
          date: dateRange,
        });

        // 处理地理编码和数值转换
        const processedData = rawData.data
          .map((item) => {
            const coordinates = getCountryCoordinates(item.geoCode);
            const intensity =
              Number(item[keyword as keyof TrendsByRegion]) || 0;
            return coordinates ? { ...item, coordinates, intensity } : null;
          })
          .filter(Boolean) as TrendsByRegion[];

        // 更新对应时间点的数据缓存
        setTimeSeriesData((prev) => {
          const newData = [...prev];
          newData[currentTimeIndex] = { time: dateRange, data: processedData };
          return newData;
        });
      } catch (error) {
        console.error("数据加载失败:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentTimeIndex,timeSeriesData]); // 依赖当前时间索引
  // 准备热力图数据
  const plotData = useMemo(() => {
    const currentData = timeSeriesData[currentTimeIndex]?.data || [];
    return [
      {
        type: "densitymapbox",
        lat: currentData
          .map((d) => d.coordinates?.lat)
          .filter(Boolean) as number[],
        lon: currentData
          .map((d) => d.coordinates?.lon)
          .filter(Boolean) as number[],
        z: currentData.map((d) => d.intensity),
        radius: 20,
        colorscale: "Viridis",
        opacity: 0.6,
      } as Plotly.Data,
    ];
  }, [currentTimeIndex, timeSeriesData]);

  // 地图布局配置
  const layout = useMemo<Partial<Plotly.Layout>>(
    () => ({
      mapbox: {
        style: "dark",
        center: { lat: 39.9042, lon: 116.4074 },
        zoom: 3,
        accesstoken:"pk.eyJ1IjoidGlhbnRpYW4xIiwiYSI6ImNsY3g5enc2dTA3NHkzcG9kazl4c2wzYWIifQ.Ue4XzsBbeT2PAc-yPUjT5w",
      },
      title: `热力图 - ${timeRanges[currentTimeIndex]}`,
      width: 1280,
      height: 720,
    }),
    [currentTimeIndex]
  );
  return (
    <div>
      {loading ? <div>数据加载中...</div> : null}
      {timeSeriesData[currentTimeIndex]?.data ? (
        <>
          <Plot
            data={plotData}
            layout={layout}
          />

          {timeRanges.length > 1 && (
            <Input
              type="range"
              min="0"
              max={timeRanges.length - 1}
              value={currentTimeIndex}
              onChange={(e) => setCurrentTimeIndex(Number(e.target.value))}
              style={{ width: "80%", margin: "20px auto" }}
            />
          )}
        </>
      ) : (
        <div>无有效数据</div>
      )}
    </div>
  );
};
export default MapDensityHeatmap;
