import React, { useMemo, useState } from "react";

import { Card, Select, Space, Tag, Typography } from "antd";
import { useDataBinding } from "@/components/Editor/hooks/useDataBinding";
import { RegisteredComponent } from "@/components/Editor/stores/registeredComponentsStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { ListSubjectResponse, SubjectDataResponse } from "@/types/subject";
import { useRequest } from "ahooks";
import { getSubject } from "@/api/subject";

interface DataMetaProps {
  componentId: string;
  subjectId?: number;
  subjectDatas?: SubjectDataResponse[];
  index?: number; // 选择的subject data索引
  step?: number; // 在某个data中的第几个步骤
}

const DataMeta: React.FC<DataMetaProps> = ({
  componentId,
  subjectId,
  subjectDatas,
  index = 0,
  step = 0,
}) => {

  useDataBinding(`subject-${subjectId}`, componentId, "subjectDatas");
  const [dataType, setDataType] = useState("region");
  const filterSubjectDatas = useMemo(() => {
    return subjectDatas?.filter((sd) => sd.data_type == dataType);
  }, [dataType, subjectDatas]);

  const data = useMemo(() => {
    if (!filterSubjectDatas || filterSubjectDatas.length === 0) return null;
    if(filterSubjectDatas[index].data.length==0) return null;
    return filterSubjectDatas[index];
  }, [index, filterSubjectDatas]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, currentMeta] = useMemo(() => {
    if (!data) return [undefined, undefined];
    const currentData = data.data[step];
    const currentMeta = data.meta[step];
    return [currentData, currentMeta];
  }, [data, step]);
  const { data: subject, loading } = useRequest(
    () =>
      subjectId
        ? getSubject(subjectId)
        : Promise.resolve({} as ListSubjectResponse),
    { refreshDeps: [subjectId] }
  );
  return (
    <Card loading={loading} title={(
      <Space>
        <Typography.Text>{subject?.name?subject.name:"title"}</Typography.Text>
        <Select
          style={{ width: "100%" }}
          value={dataType}
          options={[
            { label: "time", value: "time" },
            { label: "region", value: "region" },
          ]}
          onChange={(value) => setDataType(value)}
        />
      </Space>
    )} className={`h-full`}>
      <Space direction="vertical">
        {/* 示例选择器 */}
       
        {currentMeta && (
          
          <Space direction={"vertical"}>
             <div>
              {currentMeta.geo_code == "" ? "World" : currentMeta.geo_code}
            </div>
            <Space wrap >
              {currentMeta.keywords?.map((keyword, i) => (
                <Tag key={i}>{keyword}</Tag>
              ))}
            </Space>
           
            <div>
              {currentMeta.timeframe_start} 至 {currentMeta.timeframe_end}
            </div>
           
          </Space>
        )}
      </Space>
    </Card>
  );
};

export default DataMeta;

// 注册组件
// eslint-disable-next-line react-refresh/only-export-components
export const registeredDataMetaComponent: RegisteredComponent<DataMetaProps> = {
  meta: {
    type: "DataMeta",
    name: "dataMeta",
    icon: <span>📋</span>,
    defaultProps: {
      index: 0,
      step: 0,
      componentId: "",
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
      },
    },
  },
  component: DataMeta,
};
