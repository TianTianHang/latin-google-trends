import {
  Col,
  Row,
  Card,
  Layout,
  Typography,
  Button,
  Slider,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import { Footer } from "antd/es/layout/layout";
import GlobalMoranIndex from "@/components/GlobalMoranIndex";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { RegionInterest, TimeInterest } from "@/types/interest";
import { SubjectDataMeta } from "@/types/subject";
import {
  PauseOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useShallow } from "zustand/shallow";
import LineChart from "@/components/Charts/LineChart";
import IconFontMap from "@/components/Map/IconFontMap";
const { Content } = Layout;
const { Title, Text } = Typography;

export default function DashboardView() {
  const { regionInterests, timeInterests, loading, subjectDatas } =
    useSubjectStore(
      useShallow((state) => ({
        regionInterests: state.regionInterests,
        timeInterests: state.timeInterests,
        loading: state.loading,
        subjectDatas: state.subjectDatas,
      }))
    );

  const { selectSubject, parseSubjectData } = useSubjectStore();

  const [step, setStep] = useState(0);
  const [index] = useState(0);
  const [isProgressVisible, setIsProgressVisible] = useState(false);
  const [intervalTime, setIntervalTime] = useState(1000); // 新增状态变量

  const [regionData, setRegionData] = useState<{
    interests: RegionInterest[];
    meta: SubjectDataMeta;
  }>({ interests: [], meta: {} as SubjectDataMeta });

  const [timeData, setTimeData] = useState<{
    interests: TimeInterest[];
    meta: SubjectDataMeta;
  }>({ interests: [], meta: {} as SubjectDataMeta });

  useEffect(() => {
    if (!isProgressVisible) return;
    const interval = setInterval(() => {
      setStep((prevStep) => prevStep + 1);
    }, intervalTime); // Adjust the interval as needed
    return () => clearInterval(interval);
  }, [isProgressVisible, intervalTime]); // 添加 intervalTime 依赖

  useEffect(() => {
    if (regionInterests.length === 0) return;
    setRegionData(regionInterests[step]);
  }, [regionInterests, step]);
  useEffect(() => {
   
    if (timeInterests.length === 0) return;
    setTimeData(timeInterests[index]);
  }, [timeInterests, index]);

  useEffect(() => {
    const init = async () => {
      await selectSubject(1);
    };
    init();
  }, []);
  useEffect(() => {
    if (loading) return;
    parseSubjectData(subjectDatas);
  }, [loading]);

  const handleSliderChange = (value: number) => {
    setStep(value);
  };

  const handlePlayPause = () => {
    setIsProgressVisible(!isProgressVisible);
  };

  return (
    <Layout className=" h-max bg-[#0a1949]">
      {/* 主要内容区域 */}
      <Content className="p-4 bg-[#0a1949]">
        {/*第一行*/}
        <Row gutter={[16, 16]}>
          {/* 左侧指标区 */}
          <Col span={6}>
            <Row gutter={[16, 16]} className="h-half">
              <Col span={24}>
                <Card className="h-[200px] bg-[#0a1949] border-[#1a335d]">
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <GlobalMoranIndex
                        currentStep={step}
                        data={
                          regionData.interests.length > 0
                            ? regionData.interests.map((interest) => ({
                                value: interest[
                                  regionData.meta.keywords?.[0]
                                ] as number,
                                geo_code: interest.geo_code,
                              }))
                            : []
                        }
                      />
                    </Col>

                    <Col span={12}></Col>
                  </Row>
                  <Row gutter={[16, 8]}>
                    <Col span={24}>{/* <TimeStatistic /> */}</Col>
                  </Row>
                </Card>
              </Col>
              <Col span={24}>
                <Card className="h-[300px] bg-[#0a1949] border-[#1a335d]">
                  {/* <TimeWordCloud /> */}
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
              <IconFontMap
                currentStep={step}
                data={regionData.interests}
                meta={regionData.meta}
              />
            </Card>
          </Col>
        </Row>
        <Row className="mt-4">
          {/*实现一个播放器组件*/}
          <Col span={24}>
            <Card className="bg-[#0a1949] border-[#1a335d]">
              <Row>
                <Col span={2}>
                  <Button
                    onClick={() => setStep(0)}
                    icon={<ReloadOutlined />}
                  />
                  <Button
                    onClick={handlePlayPause}
                    icon={
                      isProgressVisible ? (
                        <PauseOutlined />
                      ) : (
                        <PlayCircleOutlined />
                      )
                    }
                  />
                </Col>

                <Col span={16}>
                  <Slider
                    min={0}
                    max={regionInterests.length - 1}
                    value={step}
                    onChange={handleSliderChange}
                  />
                </Col>
                <Col span={4}>
                  <Text className="!text-white text-0.5xl">
                    {regionData.meta.timeframe_start &&
                    regionData.meta.timeframe_end
                      ? `${regionData.meta.timeframe_start}-${regionData.meta.timeframe_end}`
                      : ""}
                  </Text>
                </Col>
                <Col span={2}>
                  <Select
                    value={intervalTime}
                    onChange={(value) => setIntervalTime(value)}
                    className="w-full"
                  >
                    <Select.Option value={1000}>1 sec</Select.Option>
                    <Select.Option value={2000}>2 sec</Select.Option>
                    <Select.Option value={3000}>3 sec</Select.Option>
                    <Select.Option value={4000}>4 sec</Select.Option>
                  </Select>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        {/* 第四行 底部扩展区 用表格 展示data*/}
        <Row className="mt-4">
          <Col span={24}>
            <Card className="bg-[#0a1949] border-[#1a335d]">
              <Title level={5} className="!text-white !mb-4">
                趋势分析
              </Title>
              <LineChart currentStep={step}
                data={timeData.interests}
                meta={timeData.meta} />
            </Card>
          </Col>
        </Row>
      </Content>
      <Footer></Footer>
    </Layout>
  );
}
