import React from 'react';
import { RegionInterest } from '@/types/interest';
import { SubjectDataMeta } from '@/types/subject';
import { Card } from 'antd';
import ReactECharts from "echarts-for-react";

interface MapChartProps {
  regionInterests: { interests: RegionInterest[]; meta: SubjectDataMeta }[];

}

const MapChart: React.FC<MapChartProps> = ({ regionInterests }) => {
  return (
    <Card className="w-full h-full" ref={cardRef}>
      <ReactECharts
        ref={echartsRef}
        autoResize={false}
        notMerge
        option={option}
        opts={{ renderer: "canvas" }}
      />
    </Card>
  );
};

export default MapChart;
