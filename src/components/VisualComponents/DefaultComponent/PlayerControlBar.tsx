import { RegisteredComponent } from "@/components/Editor/types";
import { useSubjectData } from "@/hooks/useSubjectData";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { RegionInterest } from "@/types/interest";
import {
  PauseOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Select, Slider, Typography } from "antd";
import { useEffect, useState } from "react";
const { Text } = Typography;
interface PlayerControlBarProp {
  subjectDataId?: number;
  index: number;
  onChange?: () => void;
}

export const PlayerControlBar: React.FC<PlayerControlBarProp> = ({
  subjectDataId,
  index,
  onChange,
}) => {
  const data = useSubjectData(subjectDataId);
  const regionInterests = data?.data as Array<RegionInterest>[];
  const [isProgressVisible, setIsProgressVisible] = useState(false);
  const [intervalTime, setIntervalTime] = useState(1000);
  const [step, setStep] = useState(index);
  useEffect(() => {
    let intervalId: number;
    if (isProgressVisible) {
      intervalId = setInterval(() => {
        setStep((prevStep) => (prevStep + 1) % regionInterests.length);
      }, intervalTime);
    }
    return () => clearInterval(intervalId);
  }, [intervalTime, isProgressVisible, regionInterests?.length]);

  const handlePlayPause = () => {
    setIsProgressVisible(!isProgressVisible);
  };

  const handleSliderChange = (value: number) => {
    setStep(value);
    setIsProgressVisible(false); // 拖动Slider时停止播放
  };

  return (
    <div className="mt-4">
      <Card>
        <Row>
          <Col span={2}>
            <Button
              onClick={() => setStep(0)}
              icon={<ReloadOutlined />}
              style={{ marginBottom: "8px" }}
            />
            <Button
              onClick={handlePlayPause}
              icon={
                isProgressVisible ? <PauseOutlined /> : <PlayCircleOutlined />
              }
            />
          </Col>

          <Col span={16}>
            <Slider
              min={0}
              max={regionInterests?.length - 1}
              value={step}
              onChange={handleSliderChange}
            />
          </Col>

          <Col span={4}>
            <Text className="!text-white text-0.5xl">
              {data?.meta[step].timeframe_start &&
              data?.meta[step].timeframe_end
                ? `${data?.meta[step].timeframe_start}-${data?.meta[step].timeframe_end}`
                : ""}
            </Text>
          </Col>

          <Col span={2}>
            <Select
              value={intervalTime}
              onChange={(value) => setIntervalTime(value)}
              className="w-full"
              size="small"
            >
              <Select.Option value={1000}>1 sec</Select.Option>
              <Select.Option value={2000}>2 sec</Select.Option>
              <Select.Option value={3000}>3 sec</Select.Option>
              <Select.Option value={4000}>4 sec</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

// 注册组件
export const registeredSliderBarComponent: RegisteredComponent<PlayerControlBarProp> =
  {
    meta: {
      type: "PlayerControlBar",
      name: "控制播放条组件",
      icon: <span>🖼️</span>,
      defaultProps: {
        index: 0,
      },
      propSchema: {
        subjectDataId: {
          type: "select", // 或者根据实际需求选择合适的类型
          label: "Subject Data Id",
          placeholder: "Enter Subject Data Id",
          options: () => {
            return useSubjectStore
              .getState()
              .subjectDatas.filter((s) => s.data_type == "region")
              .map((s) => ({
                label: `${s.data_type}-${s.timestamp}-${s.id}`,
                value: s.id,
              }));
          },
        },
      },
    },
    component: PlayerControlBar,
  };
