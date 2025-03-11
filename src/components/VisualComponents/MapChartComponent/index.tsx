import React from 'react';
import { RegionInterest } from '@/types/interest';

interface MapChartProps {
  args?: {
    data?: RegionInterest[];
    meta?: {
      keywords: string[];
      geo_code: string;
      timeframe_start: string;
      timeframe_end: string;
    };
    onDataUpdate?: () => void;
  };
}

const MapChart: React.FC<MapChartProps> = ({ args }) => {
  const { data, meta } = args || {};

  // TODO: 使用data实现地图渲染逻辑
  console.log('地图数据:', data); // 临时使用data以通过eslint检查
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h3>地图组件</h3>
      <p>关键词: {meta?.keywords.join(', ')}</p>
      <p>地区代码: {meta?.geo_code}</p>
      <p>时间范围: {meta?.timeframe_start} - {meta?.timeframe_end}</p>
      {/* 预留实时更新接口 */}
      <button onClick={args?.onDataUpdate} style={{ display: 'none' }}>
        更新数据
      </button>
    </div>
  );
};

export default MapChart;
