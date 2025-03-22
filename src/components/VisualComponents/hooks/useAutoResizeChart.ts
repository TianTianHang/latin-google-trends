import { useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { useSize } from "ahooks";
export const useAutoResizeChart = () => {
  const echartsRef = useRef<InstanceType<typeof ReactECharts>>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const size = useSize(cardRef);
  useEffect(() => {
    if (!echartsRef.current) return;
    const echartsInstance = echartsRef.current.getEchartsInstance();

    echartsInstance.resize({
      width: size?.width,
      height: size?.height,
    });
  }, [size]);

  return { cardRef, echartsRef };
};
