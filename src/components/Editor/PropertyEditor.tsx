import {
  ColorPicker,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Select,
  Space,
} from "antd";
import { useEditorStore } from "./store";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ComponentData, PropsType, Schema } from "./types";

interface PropertyEditorProps {
  componentId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: FormInstance<any>
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  componentId,
  form
}) => {
  const { components, registered, updateProps } =
    useEditorStore();

  // 初始化selectedComponent状态
  const [selectedComponent, setSelectedComponent] =
    useState<ComponentData<PropsType> | null>(null);

  // 初始化propSchema状态
  const [propSchema, setPropSchema] = useState<{
    [key: string]: Schema;
  } | null>(null);

  // 初始化initialValues状态
  const [initialValues, setInitialValues] = useState<PropsType>({});

  // 使用useEffect来更新状态
  useEffect(() => {
    // 更新selectedComponent
    const newSelectedComponent = components.find((c) => c.id === componentId);
    setSelectedComponent(newSelectedComponent ?? null);

    if (newSelectedComponent) {
      // 更新propSchema
      const newRegisteredComponent = registered.get(newSelectedComponent.type);
      setPropSchema(newRegisteredComponent?.meta?.propSchema ?? null);

      // 更新initialValues
      setInitialValues(newSelectedComponent.props || {});
    } else {
      setPropSchema(null);
      setInitialValues({});
    }
  }, [componentId, components, registered]);

  const renderFormControl = useCallback((type: string, config: Schema) => {
    switch (type) {
      case "text":
        return <Input placeholder={config.placeholder} />;
      case "number":
        return <InputNumber style={{ width: "100%" }} />;
      case "color":
        return <ColorPicker />;
      case "select":
        if (config.options) {
          return (
            <Select
              options={
                config.options instanceof Array
                  ? config.options
                  : config.options()
              }
              allowClear
              mode={config.mode}
            />
          );
        }
        break;
      default:
        return null;
    }
  }, []);

  const handleFinish = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (changedValues: Record<string, any>) => {
      updateProps(componentId, changedValues);
    },
    [componentId, updateProps]
  );

  const formItems = useMemo(() => {
    if (!propSchema) return null;
    return Object.entries(propSchema).map(([fieldName, config]) => (
      <Form.Item
        key={fieldName}
        name={fieldName}
        label={config.label || fieldName}
      >
        {renderFormControl(config.type, config)}
      </Form.Item>
    ));
  }, [propSchema, renderFormControl]);

  if (!selectedComponent) return null;

  return (
    <Space direction="vertical" style={{ width: 240 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
        preserve={false}
      >
        {formItems}
      </Form>
    </Space>
  );
};
