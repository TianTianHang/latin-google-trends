import { Col, Row, Card, Statistic, Progress, Layout, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import ChoroplethMap from "@/components/Map/ChoroplethMap"
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function DashboardView() {
  const [currentTime, setCurrentTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout className="h-screen bg-[#030d1f]">
      {/* 顶部标题栏 */}
      <Header className="bg-[#001529] flex items-center">
        <Row justify="space-between" className="w-full">
          <Col>
            <Title level={3} className="!text-white !mb-0">
              title
            </Title>
          </Col>
          <Col>
            <Text className="text-white">
              <ClockCircleOutlined className="mr-2" />
              {currentTime}
            </Text>
          </Col>
        </Row>
      </Header>

      {/* 主要内容区域 */}
      <Content className="p-4">
        <Row gutter={[16, 16]}>
          {/* 左侧指标区 */}
          <Col span={6}>
            <Row gutter={[16, 16]} className="h-full">
              <Col span={24}>
                <Card className="h-[200px] bg-[#0a1949] border-[#1a335d]">
                  <Statistic
                    title="title"
                    value={1128}
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <Progress percent={75} status="active" strokeColor="#13c2c2" />
                </Card>
              </Col>
              <Col span={24}>
                <Card className="h-[300px] bg-[#0a1949] border-[#1a335d]">
                  {/* 这里可以放置环形图或雷达图 */}
                  <Title level={5} className="!text-white">title</Title>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* 中央可视化区 */}
          <Col span={18}>
            <Row gutter={[16, 16]} className="h-full">
              {/* 顶部图表区 */}
              <Col span={24}>
                <Card className="h-[500px] bg-[#0a1949] border-[#1a335d]">
                  <Title level={5} className="!text-white">地图</Title>
                  {/* 这里放置ECharts主图表 */}
                  <ChoroplethMap slider interval='month'/>
                  
                </Card>
              </Col>

              {/* 底部指标区 */}
              <Col span={24}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Card className="bg-[#0a1949] border-[#1a335d]">
                      <Statistic
                        title="title"
                        value={2568}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card className="bg-[#0a1949] border-[#1a335d]">
                      <Statistic
                        title="title"
                        value={68.5}
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card className="bg-[#0a1949] border-[#1a335d]">
                      <Statistic
                        title="title"
                        value={288.5}
                        prefix="¥"
                        valueStyle={{ color: '#eb2f96' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* 底部扩展区 */}
        <Row className="mt-4">
          <Col span={24}>
            <Card className="bg-[#0a1949] border-[#1a335d]">
              <Title level={5} className="!text-white">实时交易数据</Title>
              {/* 这里放置滚动表格 */}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}