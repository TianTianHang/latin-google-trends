import { Row, Col, Space, } from 'antd';
import IntroSection from './components/HomePage/IntroSection';
import Updates from './components/HomePage/Updates';
import QuickAccess from './components/HomePage/QuickAccess';
import GlobalStatistic from './components/HomePage/GlobalStatistic';

export default function HomePage() {


  return (
    <div className="home-page">
      <Row gutter={[16, 16]}>
       

        {/* 左侧区域 */}
        <Col xs={24} md={16} >
          <IntroSection />
          <Updates />
        </Col>

        {/* 右侧快速入口 */}
        <Col xs={24} md={8}>
        <Space direction={"vertical"} size={100}>
            <QuickAccess />
          <GlobalStatistic/>
        </Space>
        
        </Col>
      </Row>
    </div>
  );
}
