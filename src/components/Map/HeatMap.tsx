import type {
  HeatmapLayerProps,
  LarkMapProps,
  LayerPopupProps,
  PointLayerProps,
} from "@antv/larkmap";
import {
  CustomControl,
  FullscreenControl,
  HeatmapLayer,
  LarkMap,
  LayerPopup,
  LegendRamp,
  MapThemeControl,
  PointLayer
} from "@antv/larkmap";
import loc_data from "@/components/Map/loc_data.json";
import { useEffect, useState } from "react";
import { getRegionInterestByTime, queryRegionInterests } from "@/api/interest";
import { QueryParams } from "@/types/query";
import { Button, DatePicker, Input, Slider, Space, Spin, Switch } from "antd";
import dayjs from "dayjs";
import { LoadingOutlined } from "@ant-design/icons";
import { useDashBoardStore } from "@/stores/useDashBoardStore";

const colors = [
  '#FF0000', // 红色，映射到 0
  '#FF6600', // 橙色，映射到 30
  '#FFCC00', // 黄色，映射到 50
  '#66FF66', // 浅绿色，映射到 70
  '#33CCFF', // 浅蓝色，映射到 85
  '#0000FF', // 蓝色，映射到 95
  '#800080', // 紫色，映射到 100
];
const labels = ["0", "30", "50", "70", "85", "95", "100"];

const config: LarkMapProps = {
  mapType: "Mapbox",
  mapOptions: {
    style: "mapbox://styles/mapbox/dark-v11",
    center: [41.9028, 12.4964],
    minZoom:1,
    maxZoom:8,
    zoom: 1,
    accessToken: "pk.eyJ1IjoidGlhbnRpYW4xIiwiYSI6ImNsY3g5enc2dTA3NHkzcG9kazl4c2wzYWIifQ.Ue4XzsBbeT2PAc-yPUjT5w",
    language:"en",
    worldview:"CN"
  },
  logoVisible: false,
};

const items: LayerPopupProps["items"] = [
  {
    layer: "myPointLayer",
    fields: [
      {
        field: "NAME_ZH",
        formatField: () => "country name",
      },
      {
        field: "ISO_A2",
        formatField: "ISO_A2",
      },
      {
        field: "value",
        formatField: () => "搜索指数",
        formatValue: (value) => (value ? value : "无"),
      },
    ],
  },
];

const { RangePicker } = DatePicker;

const timeFormat = "YYYY-MM-DD";
//组件开始
export interface HeatmapProp {
  slider?: boolean;
}
const HeatMap = ({ slider}: HeatmapProp) => {
  const { data, currentStep, timeSteps, setData, setCurrentStep, setTimeSteps,interval,startDate } = useDashBoardStore();

  const [heatOptions] = useState< Omit<HeatmapLayerProps, "source">>({
    autoFit: true,
    shape: 'heatmap' as const,
    size: {
      field: 'value',
      value:({value})=>value/50,
    },
    state: {
      active: true,
    },
    style: {
      intensity: 3,
      radius: 20,
      opacity: 1,
      rampColors: {
        colors: colors,
        positions:[0, 0.3, 0.5, 0.7, 0.85, 0.95, 1]
      },
    },
  });
  const [pointOptions] = useState< Omit<PointLayerProps, "source">>({
    autoFit: true,
    shape: 'circle',
    size: {
      value: () => {
        return 10
      },
    },
    state: {
      active: false,
    },
    color:"rgba(0, 0, 0, 0.1)",
    style: {
      opacity:  0.1,
    },
  });
  const [source, setSource] = useState({
    data: loc_data,
    parser: { type: "json", x:"LABEL_X", y:"LABEL_Y" },
  });

  const [timeframe, setTimeframe] = useState([startDate.format("YYYY-MM-DD"), startDate.add(1,"month").format("YYYY-MM-DD")]);
  const [keyword, setKeyword] = useState<string>("new");
  const [loading, setLoding] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const submit = async () => {
    setLoding(true);
    const queryParams: QueryParams = {
      filters: [
        { field: "keyword", op: "eq", value: keyword },
        {
          field: "timeframe_start",
          op: "eq",
          value: timeframe[0],
        },
        { field: "timeframe_end", op: "eq", value: timeframe[1] },
      ],
    };

    const data = await queryRegionInterests(queryParams);
    
    setSource((prev) => ({
      ...prev,
      transforms: [
        {
          type: "join",
          targetField: "ISO_A2",
          sourceField: "geo_code",
          data: data,
        },
      ],
    }));
    setLoding(false);
  };
  // 生成时间刻度
  const generateTimeSteps = () => {
    const steps: dayjs.Dayjs[] = [];
    let current = startDate;

    while (current.isBefore(dayjs())) {
      steps.push(current);
      current = current.add(1, interval);
    }
    setTimeSteps(steps);
  };
  const getSilderData = async (loading: boolean = true) => {
    setLoding(loading);
    for (let i = currentStep; i < currentStep + 2; i++) {
      if (!data[i]) {
        const regionData = await getRegionInterestByTime(
          keyword,
          timeSteps[i],
          timeSteps[i + 1]
        );
        setData(i, regionData);
        // 确保data加载后手动触发一次source更新
        if (i == 0) {
          setSource((prev) => {
            return {
              ...prev,
              transforms: [
                {
                  type: "join",
                  targetField: "ISO_A2",
                  sourceField: "geo_code",
                  data: regionData,
                },
              ],
            };
          });
        }
      }
    }
    setLoding(false);
  };
  //初始化
  useEffect(() => {
    if (slider) {
      generateTimeSteps();
    } else {
      submit();
    }
  }, []);
  useEffect(() => {
    if (timeSteps.length === 0) return;
    // 当timesteps有效时获取数据
    getSilderData();
  }, [timeSteps]);

  // 自动播放逻辑
  useEffect(() => {
    let intervalId: number | undefined;
    if (autoPlay && timeSteps.length > 0) {
      intervalId = setInterval(() => {
        setCurrentStep((currentStep + 1) % timeSteps.length);
      }, 2000);
    }
    return () => clearInterval(intervalId);
  }, [autoPlay, currentStep, setCurrentStep, timeSteps.length]);

  // 滑条更新数据
  useEffect(() => {
    if (!data[currentStep + 2] && timeSteps.length != 0) {
      getSilderData(false);
    }
    if (data[currentStep]) {
      setSource((prev) => ({
        ...prev,
        transforms: [
          {
            type: "join",
            targetField: "ISO_A2",
            sourceField: "geo_code",
            data: data[currentStep],
          },
        ],
      }));
    }
  }, [data, currentStep]);

  return (
    <Spin indicator={<LoadingOutlined spin />} size="large" spinning={loading}>
      <LarkMap {...config} style={{ height: "55vh" }}>
         <HeatmapLayer {...heatOptions} source={source}  />
        <PointLayer {...pointOptions} source={source} id="myPointLayer"/>
       
       
        <LayerPopup
          closeButton={false}
          closeOnClick={false}
          anchor="bottom-left"
          trigger="hover"
          items={items}
        />
        <MapThemeControl position="bottomright" />
        <FullscreenControl />
        <CustomControl position="bottomleft">
          <LegendRamp labels={labels} colors={colors} />
        </CustomControl>
        <CustomControl
          position="topleft"
          className="opacity-0 hover:opacity-100  transition-opacity duration-300"
        >
          <Space>
            {slider ? (
              <div style={{ width: 300 }}>
                <Slider
                  min={0}
                  max={timeSteps.length - 1}
                  value={currentStep}
                  onChange={(value) => {
                    setAutoPlay(false);
                    setCurrentStep(value);
                  }}
                  tooltip={{
                    formatter: (value) =>
                      timeSteps[value ? value : 0]?.format("YYYY-MM-DD"),
                  }}
                />
                <div>
                  {timeSteps[currentStep]?.format("YYYY-MM-DD")}
                  <Switch
                    checkedChildren="自动"
                    unCheckedChildren="手动"
                    checked={autoPlay}
                    onChange={(checked) => setAutoPlay(checked)}
                  />
                </div>
              </div>
            ) : (
              <>
                {" "}
                <RangePicker
                  format={timeFormat}
                  defaultValue={[dayjs("2004-01-01"), dayjs("2004-02-01")]}
                  minDate={dayjs("2004-01-01")}
                  maxDate={dayjs()}
                  onChange={(_, dateStrings) => {
                    if (dateStrings[0] && dateStrings[1]) {
                      setTimeframe(dateStrings);
                    }
                  }}
                />
                <Input
                  defaultValue={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                  }}
                />
                <Button type="primary" onClick={submit}>
                  OK
                </Button>
              </>
            )}
          </Space>
        </CustomControl>
      </LarkMap>
    </Spin>
  );
};
export default HeatMap;
