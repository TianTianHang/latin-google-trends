import { useDataBinding } from "@/components/Editor/hooks/useDataBinding";
import { RegisteredComponent } from "@/components/Editor/stores/registeredComponentsStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { SubjectDataResponse } from "@/types/subject";
import {
  PauseOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Select, Slider, Typography } from "antd";
import { useBoolean, useInterval, useMemoizedFn } from "ahooks";
import { useMemo, useState } from "react";
import { useComponentsStore } from "@/components/Editor/stores";
const { Text } = Typography;
interface PlayerControlBarProp {
  subjectId?: number;
  componentId: string;
  subjectDatas?: SubjectDataResponse[];
  index: number;
  step: number;
}

export const PlayerControlBar: React.FC<PlayerControlBarProp> = ({
  subjectId,
  componentId,
  index=0,
  step=0,
  subjectDatas,
}) => {
  useDataBinding(`subject-${subjectId}`, componentId, "subjectDatas");
  const {updateProps}=useComponentsStore()
  const filterSubjectDatas = useMemo(() => {
    return subjectDatas?.filter((sd) => sd.data_type == "region");
  }, [subjectDatas]);

  const data = useMemo(() => {
    if (!filterSubjectDatas || filterSubjectDatas.length === 0) return null;

    return filterSubjectDatas[index];
  }, [index, filterSubjectDatas]);
  const [intervalTime, setIntervalTime] = useState(1000);
  const [isPlaying, { toggle: togglePlay }] = useBoolean(false);

  useInterval(
    () => {
      if(data?.data.length){
          updateProps(componentId,{step:(step + 1) % data?.data?.length});
      }else{
        togglePlay();
      }
    },
    isPlaying ? intervalTime : undefined
  );

  const handlePlayPause = useMemoizedFn(() => {
    togglePlay();
  });

  const handleSliderChange = useMemoizedFn((value: number) => {
    updateProps(componentId,{step:value});
    if (isPlaying) {
      togglePlay(); // 拖动Slider时停止播放
    }
  });

  return (
    <div className="mt-4">
      <Card>
        <Row>
          <Col span={2}>
            <Button
              onClick={() => updateProps(componentId,{step:0})}
              icon={<ReloadOutlined />}
              style={{ marginBottom: "8px" }}
            />
            <Button
              onClick={handlePlayPause}
              icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
            />
          </Col>

          <Col span={16}>
            <Slider
              min={0}
              max={data?.data?.length?data?.data?.length-1:0}
              value={step}
              onChange={handleSliderChange}
            />
          </Col>

          <Col span={4}>
            <Text className="!text-black text-0.5xl">
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
// eslint-disable-next-line react-refresh/only-export-components
export const registeredSliderBarComponent: RegisteredComponent<PlayerControlBarProp> =
  {
    meta: {
      type: "PlayerControlBar",
      name: "playerControlBar",
      icon: <span>🖼️</span>,
      defaultProps: {
        index: 0,
        step: 0,
        componentId: ""
      },
      propSchema: {
        subjectId: {
          type: "select",
          label: "Subject Id",
          placeholder: "Enter Subject Id",
          options: async () => {
            const subjects = useSubjectStore.getState().allSubjects;
            return subjects.map((s) => ({
              label: `${s.subject_id}-${s.name}-${s.data_num}`,
              value: s.subject_id,
            }));
          },
        },
        step: {
          type: "number",
          label: "Step",
          placeholder: "Enter Step",
        }
      },
    },
    component: PlayerControlBar,
  };
