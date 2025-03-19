import React, { useEffect, useMemo, useState } from "react";
import { Card, Select, Space, Statistic, StatisticProps } from "antd";
import { calculateGlobalMoran } from "@/api/moran";
import CountUp from "react-countup";
import { RegionInterest } from "@/types/interest";
import { SubjectDataMeta } from "@/types/subject";
import { RegisteredComponent } from "../../Editor/types";
import { useSubjectStore } from "@/stores/useSubjectStore";

interface DataItem {
  value: number;
  geo_code: string;
}

interface GlobalMoranIndexProps {
  subjectDataId: number;
}

const GlobalMoranIndex: React.FC<GlobalMoranIndexProps> = ({
  subjectDataId,
}) => {
  const [globalMoranIndex, setGlobalMoranIndex] = useState<number | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string>();
  const [index, _setIndex] = useState(0);
  const { subjectDatas } = useSubjectStore();

  const moranData = useMemo(() => {
    const subject = subjectDatas.find((s) => s.id == subjectDataId);
    return subject ? subject : null;
  }, [subjectDataId, subjectDatas]);

  const data: DataItem[] = useMemo(() => {
    if (moranData) {
      const metaItem = moranData.meta[index];
      // 只处理选中的keyword
      const keyword = selectedKeyword || metaItem.keywords[0];
      if (
        moranData.data instanceof Array &&
        moranData.data[index] instanceof Array
      ) {
        // 提取 RegionInterest 数据
        const regionInterestData = moranData.data[index] as RegionInterest[];
        return regionInterestData.map((i) => ({
          value: i[keyword],
          geo_code: i.geo_code,
        }));
      } else {
        return [];
      }
    } else {
      return [];
    }
  }, [index, moranData, selectedKeyword]);

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
      <Space direction={"vertical"}>
        <Select
          style={{ width: "100%" }}
          defaultValue={moranData?.meta[index].keywords[0]}
          value={selectedKeyword}
          options={moranData?.meta[index].keywords.map((kw) => ({
            label: kw,
            value: kw,
          }))}
          onChange={(value) => setSelectedKeyword(value)}
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
      type: "GlobalMoranIndex",
      name: "全局 Moran's I 组件",
      icon: <span>📊</span>,
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
    component: GlobalMoranIndex,
  };
