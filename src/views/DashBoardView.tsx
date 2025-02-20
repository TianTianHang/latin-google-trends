import {
  Col,
  Row,
  Card,
  Layout,
  Typography,
  DatePicker,
  Select,
  Input,
} from "antd";
import { useMemo } from "react";
import { Footer } from "antd/es/layout/layout";
import { useDashBoardStore } from "@/stores/useDashBoardStore";
import dayjs from "dayjs";
const { Option } = Select;
import LineChart from "@/components/Charts/LineChart";
import HeatMap from "@/components/Map/HeatMap";
import TimeWordCloud from "@/components/TimeWordCloud";
import GlobalMoranIndex from "@/components/GlobalMoranIndex";
import TimeStatistic from "@/components/TimeStatistic";
import usePermission from '@/hooks/usePermission';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function DashboardView() {
  const {
    startDate,
    interval,
    selectedGeos,
    keyword,
    setStartDate,
    setInterval,
    setSelectedGeos,
    setKeyword,
  } = useDashBoardStore();
  
  return (
    <Layout className=" h-max bg-[#0a1949]">
      {/* 主要内容区域 */}
      <Content className="p-4 bg-[#0a1949]">
        {/* 参数配置面板 */}
        <Row className="mb-4">
          <Col span={24}>
            <Card className="bg-[#0a1949] border-[#1a335d]">
              <Title level={5} className="!text-white !mb-4">
                参数配置
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Text className="text-white">开始日期</Text>
                  <DatePicker
                    value={startDate}
                    onChange={(date) =>
                      setStartDate(date ? dayjs(date) : dayjs())
                    }
                    style={{ width: "100%" }}
                    allowClear={false}
                  />
                </Col>
                <Col span={6}>
                  <Text className="text-white">时间间隔</Text>
                  <Select
                    value={interval}
                    onChange={setInterval}
                    style={{ width: "100%" }}
                  >
                    <Option value="day">天</Option>
                    <Option value="month">月</Option>
                    <Option value="year">年</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <Text className="text-white">地理编码</Text>
                  <Select
                    mode="multiple"
                    value={selectedGeos}
                    onChange={setSelectedGeos}
                    style={{ width: "100%" }}
                    placeholder="请选择地理编码"
                  >
                    <Option value="IT">意大利</Option>
                    <Option value="FR">法国</Option>
                    <Option value="ES">西班牙</Option>
                    <Option value="DE">德国</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <Text className="text-white">关键词</Text>
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="请输入关键词"
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/*第一行*/}
        <Row gutter={[16, 16]}>
          {/* 左侧指标区 */}
          <Col span={6}>
            <Row gutter={[16, 16]} className="h-half">
              <Col span={24}>
                <Card className="h-[200px] bg-[#0a1949] border-[#1a335d]">
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <GlobalMoranIndex />
                    </Col>
                    <Col span={12}></Col>
                  </Row>
                  <Row gutter={[16, 8]}>
                    <Col span={24}>
                      {/* <TimeStatistic /> */}
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={24}>
                <Card className="h-[300px] bg-[#0a1949] border-[#1a335d]">
                  <TimeWordCloud />
                </Card>
              </Col>
            </Row>
          </Col>

          {/* 中央可视化区 */}
          <Col span={18}>
            <Card className="h-[518px] bg-[#0a1949] border-[#1a335d]">
              <Title level={5} className="!text-white !mb-4">
                地理分布
              </Title>
              {useMemo(
                () => (
                  <HeatMap slider />
                ),
                []
              )}
            </Card>
          </Col>
        </Row>

        {/* 第三行 底部扩展区 用表格 展示data*/}
        <Row className="mt-4">
          <Col span={24}>
            <Card className="bg-[#0a1949] border-[#1a335d]">
              <Title level={5} className="!text-white !mb-4">
                趋势分析
              </Title>
              {useMemo(
                () => (
                  <LineChart />
                ),
                []
              )}
            </Card>
          </Col>
        </Row>
      </Content>
      <Footer></Footer>
    </Layout>
    );
  }