import MapDensityHeatmap from '@/components/MapDensityHeatmap';
import { Card } from 'antd';

export default function HomePage() {
  return (
    <div className="home-page">
      <Card title="欢迎使用 Google Trends 数据可视化系统">
        <MapDensityHeatmap/>
      </Card>
    </div>
  );
}
