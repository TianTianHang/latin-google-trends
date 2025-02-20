import React, { useEffect, useState } from "react";
import { useDashBoardStore } from "@/stores/useDashBoardStore";
import { Statistic, StatisticProps } from "antd";
import { calculateGlobalMoran } from "@/api/moran";
import CountUp from "react-countup";

const GlobalMoranIndex: React.FC = () => {
  const { currentStep, data } = useDashBoardStore();
  const [globalMoranIndex, setGlobalMoranIndex] = useState<number | null>(null);
  useEffect(() => {
    const fetchGlobalMoranIndex = async () => {
  
      try {
        const result = await calculateGlobalMoran({
          data: data[currentStep].map((item) => item.value),
          iso_codes: data[currentStep].map((item) => item.geo_code),
          missing_data_method: "interpolate",
        });

        setGlobalMoranIndex(result.I);
       
      } catch (error) {
        console.error("Failed to fetch global moran index:", error);
      }
    };

    fetchGlobalMoranIndex();
  }, [currentStep]);
  const formatter: StatisticProps["formatter"] = (value) => (
    <CountUp
      end={value as number}
      decimals={4} // 保留两位小数
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
