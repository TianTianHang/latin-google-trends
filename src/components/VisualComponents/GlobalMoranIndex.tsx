import React, { useEffect, useMemo, useState } from "react";
import { Card, Select, Space, Statistic, StatisticProps } from "antd";
import { calculateGlobalMoran } from "@/api/moran";
import CountUp from "react-countup";
import { RegionInterest } from "@/types/interest";
import { SubjectDataMeta } from "@/types/subject";
import { RegisteredComponent } from "../Editor/types";

interface DataItem {
  value: number;
  geo_code: string;
}

interface GlobalMoranIndexProps {
  regionInterests: { interests: RegionInterest[]; meta: SubjectDataMeta }[];
}

const GlobalMoranIndex: React.FC<GlobalMoranIndexProps> = ({
  regionInterests,
}) => {
  const [globalMoranIndex, setGlobalMoranIndex] = useState<number | null>(null);
  const [keyword, setKeyword] = useState<string | null>(null);
  const data: DataItem[] = useMemo(() => {
    if (!keyword) return [];
    return regionInterests[0].interests.map((i) => ({
      value: i[keyword],
      geo_code: i.geo_code,
    }));
  }, [regionInterests, keyword]);
  useEffect(() => {
    if (data.length === 0) return;
    const fetchGlobalMoranIndex = async () => {
      try {
        const result = await calculateGlobalMoran({
          data: data.map((item) => item.value),
          iso_codes: data.map((item) => item.geo_code),
          missing_data_method: "interpolate",
        });

        setGlobalMoranIndex(result.I);
      } catch (error) {
        console.error("Failed to fetch global moran index:", error);
      }
    };

    fetchGlobalMoranIndex();
  }, [data]);

  const formatter: StatisticProps["formatter"] = (value) => (
    <CountUp end={value as number} decimals={4} duration={1} />
  );

  return (
    <Card className="h-full">
      <Space direction={'vertical'} >
        <Select
        style={{width:"100%"}}
          value={keyword}
          options={regionInterests[0].meta.keywords.map((kw) => ({
            label: kw,
            value: kw,
          }))}
          onChange={(value) => setKeyword(value)}
        />
        <Statistic
          title={<span>全局莫兰指数</span>}
          value={globalMoranIndex || "null"}
          formatter={formatter}
        />
      </Space>
    </Card>
  );
};

export default GlobalMoranIndex;
// 注册组件
export const registeredGlobalMoranIndexComponent: RegisteredComponent<GlobalMoranIndexProps> =
  {
    meta: {
      type: "analysis",
      name: "全局 Moran's I 组件",
      icon: <span>📊</span>,
      defaultProps: {
        regionInterests: [{
          interests:[],meta:{
            keywords: [],
            geo_code: "",
            timeframe_start: "",
            timeframe_end: ""
          }
        }]
      },
      defaultLayout: {
        x: 0,
        y: 0,
        w: 2,
        h: 2,
      },
      propSchema: {
        regionInterests: {
          type: "select",
          label: "Region Interests",
          placeholder: "Enter region interests",
        },
      },
    },
    component: GlobalMoranIndex,
  };
