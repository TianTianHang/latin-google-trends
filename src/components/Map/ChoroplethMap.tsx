import type {
  LarkMapProps,
  LayerPopupProps,
  PolygonLayerProps,
} from "@antv/larkmap";
import {
  CustomControl,
  FullscreenControl,
  LarkMap,
  LayerPopup,
  LegendRamp,
  MapThemeControl,
  PolygonLayer,
  useScene,
} from "@antv/larkmap";
import geojson from "@/components/Map/geojson.json";
import { useEffect, useState } from "react";
import { getRegionInterestByTime, queryRegionInterests } from "@/api/interest";
import { QueryParams } from "@/types/query";
import { Button, DatePicker, Input, Slider, Space, Spin, Switch } from "antd";
import dayjs from "dayjs";
import { LoadingOutlined } from "@ant-design/icons";
import { RegionInterestResponse } from "@/types/interest";
import { use } from "i18next";

const colors = [
  "#B8E1FF",
  "#7DAAFF",
  "#3D76DD",
  "#0047A5",
  "#001D70",
  "#000B3C",
  "#000522",
];
const labels = ["0", "30", "50", "70", "85", "95", "100"];

const config: LarkMapProps = {
  mapType: "Gaode",
  mapOptions: {
    style: "grey",
    center: [41.9028,  12.4964],
    zoom: 3,
    token: "d8a574c3b670908671f248c59844d9ee",
  },
};

const layerOptions: Omit<PolygonLayerProps, "source"> = {
  autoFit: true,
  shape: "fill",
  color: {
    field: "value",
    value: colors,
    scale: { type: "quantile" },
  },
  state: {
    active: true,
  },
  style: {
    opacity: 0.6,
  },
};

const items: LayerPopupProps["items"] = [
  {
    layer: "myPolygonLayer",
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
export interface ChoroplethMapProp {
  slider?: boolean;
  interval?: "day" | "month" | "year";
}
const ChoroplethMap = ({ slider, interval }: ChoroplethMapProp) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [options, setOptions] = useState(layerOptions);
  const [source, setSource] = useState({
    data: geojson,
    parser: { type: "geojson" },
  });
  const [data, setData] = useState<{
    [index: number]: RegionInterestResponse[];
  }>({});
  const [timeframe, setTimeframe] = useState(["2004-01-01", "2004-02-01"]);
  const [keyword, setKeyword] = useState<string>("new");
  const [loading, setLoding] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [timeSteps, setTimeSteps] = useState<dayjs.Dayjs[]>([]);

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
    let current = dayjs("2004-01-01");

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
        setData((prev) => {
          prev[i] = regionData;
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

          return prev;
        });
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
        setCurrentStep((prev) => (prev + 1) % timeSteps.length);
      }, 2000);
    }
    return () => clearInterval(intervalId);
  }, [autoPlay, timeSteps.length]);

  // 滑条更新数据
  useEffect(() => {
    if (!data[currentStep + 2]) {
      getSilderData(false);
    }
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
  }, [data, currentStep]);

  return (
    <Spin indicator={<LoadingOutlined spin />} size="large" spinning={loading}>
      <LarkMap {...config} style={{ height: "50vh" }}>
        <MapThemeControl position="bottomright"/>
        <PolygonLayer {...options} source={source} id="myPolygonLayer" />
        <LayerPopup
          closeButton={false}
          closeOnClick={false}
          anchor="bottom-left"
          trigger="hover"
          items={items}
        />
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
                  tipFormatter={(value) =>
                    timeSteps[value]?.format("YYYY-MM-DD")
                  }
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
export default ChoroplethMap;
