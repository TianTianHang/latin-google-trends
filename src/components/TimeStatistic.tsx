import { useDashBoardStore } from "@/stores/useDashBoardStore";
import { Statistic } from "antd";
import { useEffect, useState } from "react";

const TimeStatistic = () => {
    const { currentStep,timeSteps } = useDashBoardStore();
    const [timeframe,setTimeframe] = useState<[string,string]>(["",""]);
    useEffect(()=>{
        setTimeframe([timeSteps[currentStep].format("YYYY-MM-DD"),timeSteps[currentStep+1].format("YYYY-MM-DD")]);
    },[currentStep])
    
  return (
    <Statistic
      title={<span className="text-white">当前时间</span>}
      value={`${timeframe[0]} ${timeframe[1]}`}
      valueStyle={{ color: "white",  }}
    />
  );
};
export default TimeStatistic;