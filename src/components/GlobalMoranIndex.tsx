import React, { useEffect, useState } from "react";
import { Statistic, StatisticProps } from "antd";
import { calculateGlobalMoran } from "@/api/moran";
import CountUp from "react-countup";

interface DataItem {
  value: number;
  geo_code: string;
}

interface GlobalMoranIndexProps {
  currentStep: number;
  data: DataItem[];
}

const GlobalMoranIndex: React.FC<GlobalMoranIndexProps> = ({ currentStep, data }) => {
  const [globalMoranIndex, setGlobalMoranIndex] = useState<number | null>(null);

  useEffect(() => {
    if ( data.length === 0) return;
    const fetchGlobalMoranIndex = async () => {
      try {
        const result = await calculateGlobalMoran({
          data: data.map((item) => item.value),
          iso_codes: data.map((item) => item.geo_code),
          missing_data_method: "interpolate",
        });

        setGlobalMoranIndex(result.I);
      } catch (error) {
        console.error("Failed to fetch global moran index:", error);
      }
    };

    fetchGlobalMoranIndex();
  }, [currentStep, data]);

  const formatter: StatisticProps["formatter"] = (value) => (
    <CountUp
      end={value as number}
      decimals={4}
      duration={1}
    />
  );

  return (
    <Statistic
      title={<span className="text-white">全局莫兰指数</span>}
      value={globalMoranIndex || "null"}
      valueStyle={{ color: "white" }}
      formatter={formatter}
    />
  );
};

export default GlobalMoranIndex;
