import {
  ColorPicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
} from "antd";
import { useEditorStore } from "./store";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RegionInterest, TimeInterest } from "@/types/interest";
import { SubjectDataMeta } from "@/types/subject";

import { getSubjectData } from "@/api/subject";
import { Schema } from "./types";

interface PropertyEditorProps {
  componentId: string;
  visible: boolean;
  onClose: () => void;
}
export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  componentId,
  visible,
  onClose,
}) => {
  const { components, registered, updateProps } = useEditorStore();
  const { fetchAllSubjects, allSubjects, parseSubjectData } = useSubjectStore();
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [isInterest,setIsInterest]=useState(false);
  const selectedComponent = useMemo(
    () => components.find((c) => c.id === componentId),
    [componentId, components]
  );

  const initialValues = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newChangedValues: Record<string, any> = {};
    const props = { ...selectedComponent?.props };
    // 遍历变更值
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        const value = props[key];
        // 检查键名是否为 timeInterests 或 regionInterests
        if (key === "timeInterests") {
          newChangedValues[key] = Array.isArray(value)?value.map(i=>JSON.stringify(i)):JSON.stringify(value);
          setIsInterest(true);
        } else if (key === "regionInterests") {
          
          newChangedValues[key] = Array.isArray(value)?value.map(i=>JSON.stringify(i)):JSON.stringify(value);
          setIsInterest(true);
        } else {
          newChangedValues[key] = value;
        }
      }
    }
    return newChangedValues;
  }, [selectedComponent?.props]);
  const [form] = Form.useForm();
  const [timeInterests, setTimeInterests] = useState<
    { interests: TimeInterest[]; meta: SubjectDataMeta }[]
  >([]);
  const [regionInterests, setRegionInterests] = useState<
    { interests: RegionInterest[]; meta: SubjectDataMeta }[]
  >([]);
  useEffect(() => {
    const init = async () => {
      await fetchAllSubjects();
    };
    if (allSubjects.length != 0) return;
    init();
  }, []);

  const renderFormControl = useCallback(
    (
      type: string,
      config: Schema
    ) => {
      switch (type) {
        case "text":
          return <Input placeholder={config.placeholder} />;
        case "number":
          return <InputNumber style={{ width: "100%" }} />;
        case "color":
          return <ColorPicker />;
        case "select":
          if (config.label == "Time Interests") {
            return (
              <Select
                mode={config.mode}
                options={timeInterests.map((i) => ({
                  label: `${i.meta.keywords.join(",")} ${
                    i.meta.geo_code ? i.meta.geo_code : "World"
                  } ${i.meta.timeframe_start}-${i.meta.timeframe_end}`,
                  value: JSON.stringify(i),
                }))}
              />
            );
          } else if (config.label == "Region Interests") {
            return (
              <Select
                mode={config.mode}
                options={regionInterests.map((i) => ({
                  label: `${i.meta.keywords.join(",")} ${
                    i.meta.geo_code ? i.meta.geo_code : "World"
                  } ${i.meta.timeframe_start}-${i.meta.timeframe_end}`,
                  value: JSON.stringify(i),
                }))}
              />
            );
          }
          return <Select options={config.options} />;
        default:
          return null;
      }
    },
    [timeInterests, regionInterests] // 将 timeInterests 和 regionInterests 作为依赖项
  );
  if (!selectedComponent) return null;
  const registeredComponent = registered.get(selectedComponent.type);
  const propSchema = registeredComponent?.meta.propSchema;

  

  return (
    <Modal
      open={visible}
      onCancel={() => {
        onClose();
      }}
      onOk={() => {
        form.submit();
        onClose();
      }}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: 240 }}>
        {isInterest&&(
          <Select
          options={allSubjects.map((s) => ({
            label: s.name,
            value: s.subject_id,
          }))}
          value={selectedValue}
          onChange={(value) => {
            setSelectedValue(value);
            getSubjectData(value).then((subjectDatas) => {
              const { timeInterests, regionInterests } =
                parseSubjectData(subjectDatas);
              setTimeInterests(timeInterests);
              setRegionInterests(regionInterests);
            });
          }}
        />
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={(changedValues) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newChangedValues: Record<string, any> = {};

            // 遍历变更值
            for (const key in changedValues) {
              if (Object.prototype.hasOwnProperty.call(changedValues, key)) {
                const value = changedValues[key];
                // 检查键名是否为 timeInterests 或 regionInterests
                if (key === "timeInterests") {
                  if(Array.isArray(value)){
                    newChangedValues[key] = value.map(i=>JSON.parse(i))
                  }else{
                    newChangedValues[key] = [JSON.parse(value)];
                  }
                  
                } else if (key === "regionInterests") {
                  if(Array.isArray(value)){
                    newChangedValues[key] = value.map(i=>JSON.parse(i))
                  }else{
                    newChangedValues[key] = [JSON.parse(value)];
                  }
                } else {
                  newChangedValues[key] = value;
                }
              }
            }

            // 合并变更值到现有props
            updateProps(componentId, {
              ...newChangedValues,
            });
          }}
          initialValues={initialValues}
        >
          {propSchema&&Object.entries(propSchema).map(([fieldName, config]) => (
            <Form.Item
              key={fieldName}
              name={fieldName}
              label={config.label || fieldName}
            >
              {renderFormControl(config.type, config)}
            </Form.Item>
          ))}
        </Form>
      </Space>
    </Modal>
  );
};
