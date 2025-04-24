import React, { useMemo, useState } from "react";
import { useRequest } from "ahooks";
import { Card, Select, Space, Statistic, StatisticProps } from "antd";
import { calculateGlobalMoran } from "@/api/moran";
import CountUp from "react-countup";
import { RegionInterest } from "@/types/interest";
import { SubjectDataResponse } from "@/types/subject";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { RegisteredComponent } from "@/components/Editor/stores/registeredComponentsStore";
import { useDataBinding } from "@/components/Editor/hooks/useDataBinding";
import { useTranslation } from "react-i18next";

interface DataItem {
  value: number;
  geo_code: string;
}

interface GlobalMoranIndexProps {
  componentId: string;
  subjectId?: number;
  subjectDatas?: SubjectDataResponse[];
  index:number; // x选择的subject data
  step:number; // 在某个data中的第几个
}

const GlobalMoranIndex: React.FC<GlobalMoranIndexProps> = ({
  componentId,
  subjectId,
  subjectDatas,
  index=0,
  step=0
}) => {
  const { t } = useTranslation("visualComponents");
  useDataBinding(`subject-${subjectId}`, componentId, "subjectDatas");
  const [selectedKeyword, setSelectedKeyword] = useState<string>();
  const filterSubjectDatas = useMemo(() => {
    return subjectDatas?.filter((sd) => sd.data_type == "region");
  }, [subjectDatas]);

  const moranData = useMemo(() => {
    if (!filterSubjectDatas || filterSubjectDatas.length === 0) return null;
    if(filterSubjectDatas[index].data.length==0) return null;
    return filterSubjectDatas[index];
  }, [index, filterSubjectDatas]);

  const data: DataItem[] = useMemo(() => {
    if (moranData) {
      const metaItem = moranData.meta[step];
      // 只处理选中的keyword
      const keyword = selectedKeyword || metaItem.keywords[0];
      if (
        moranData.data instanceof Array &&
        moranData.data[step] instanceof Array
      ) {
        // 提取 RegionInterest 数据
        const regionInterestData = moranData.data[step] as RegionInterest[];
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
  }, [moranData, selectedKeyword, step]);
  const { data: globalMoranIndex, loading, error } = useRequest(
    async () => {
      if (data.length === 0) return null;
      return await calculateGlobalMoran({
        data: data.map((item) => item.value),
        iso_codes: data.map((item) => item.geo_code),
        missing_data_method: "interpolate",
      });
    },
    {
      refreshDeps: [data],
      onError: (error) => {
        console.error("Failed to fetch global moran index:", error);
      },
      cacheKey: "globalMoranIndex",
    }
  );
  
  


  const formatter: StatisticProps["formatter"] = (value) => (
    <CountUp 
      end={value as number} 
      decimals={4} 
      // @ts-ignore - duration是实际可用的属性，类型定义需要更新
      duration={1}
    />
  );

  return (
    <Card className="h-full">
      <Space direction={"vertical"}>
        <Select
          style={{ width: "100%" }}
          defaultValue={moranData?.meta[index].keywords[0]}
          value={selectedKeyword}
          options={moranData?.meta[index].keywords.map((kw: string) => ({
            label: kw,
            value: kw,
          }))}
          onChange={(value) => setSelectedKeyword(value)}
        />
        <Statistic
          title={<span>{t("component.globalMoran.title")}</span>}
          value={loading ? "Loading..." : error ? "Error" : globalMoranIndex?.I || "null"}
          formatter={formatter}
        />
      </Space>
    </Card>
  );
};

export default GlobalMoranIndex;
// 注册组件
// eslint-disable-next-line react-refresh/only-export-components
export const registeredGlobalMoranIndexComponent: RegisteredComponent<GlobalMoranIndexProps> =
  {
    meta: {
      type: "GlobalMoranIndex",
      name: "globalMoran",
      icon: <span>📊</span>,
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
    component: GlobalMoranIndex,
  };
