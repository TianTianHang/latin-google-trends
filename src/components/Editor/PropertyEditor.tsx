import {
  ColorPicker,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Space,
  Switch,
  DatePicker,
  Slider,
} from "antd";
import { AsyncSelect } from "../AsyncSelect";
import { CodeEditor } from "@/components/CodeEditor";
import { JsonEditor } from "@/components/JsonEditor";
import { useCallback, useEffect, useMemo } from "react";
import { useRequest } from "ahooks";
import {
  useComponentsStore,
  useRegisteredComponentsStore,
  useInterlinkedStore,
} from "./stores";
import { Schema } from "./stores/registeredComponentsStore";

interface PropertyEditorProps {
  componentId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: FormInstance<any>;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  componentId,
  form,
}) => {
  const { components, updateProps } = useComponentsStore();
  const { registered } = useRegisteredComponentsStore();
  const { getInterlinkedComponents } = useInterlinkedStore();

  // 使用useRequest管理组件数据
  const {
    data: selectedComponent,
    run: updateSelectedComponent,
    loading: componentLoading,
    error: componentError,
  } = useRequest(
    async () => {
      const component = components.find((c) => c.id === componentId);
      if (!component) return null;

      // 获取联动组件
      const linkedComponents = getInterlinkedComponents(componentId);

      return {
        ...component,
        linkedComponents,
        // 添加联动属性
        linkedProps: linkedComponents.reduce((acc, link) => {
          link.props.forEach((prop) => {
            acc[prop] = components.find((c) => c.id === link.targetId)?.props[
              prop
            ];
          });
          return acc;
        }, {} as Record<string, unknown>),
      };
    },
    {
      refreshDeps: [componentId, components],
      manual: true,
      cacheKey: `component-${componentId}`,
      debounceWait: 300,
    }
  );

  // 使用useRequest管理schema数据
  const { data: propSchema } = useRequest(
    async () => {
      if (!selectedComponent) return null;
      const registeredComponent = registered.get(selectedComponent.type);
      return registeredComponent?.meta?.propSchema ?? null;
    },
    {
      refreshDeps: [selectedComponent, registered],
    }
  );

  // 初始化表单值
  const initialValues = useMemo(() => {
    return selectedComponent?.props || {};
  }, [selectedComponent]);

  // 当组件变化时自动更新
  useEffect(() => {
    updateSelectedComponent();
  }, [componentId, components, updateSelectedComponent]);

  // 表单控件渲染
  const renderFormControl = useCallback((type: string, config: Schema) => {
    switch (type) {
      case "text":
        return <Input placeholder={config.placeholder} />;
      case "number":
        return (
          <InputNumber
            style={{ width: "100%" }}
            min={config.min}
            max={config.max}
            step={config.step}
          />
        );
      case "slider":
        return (
          <Slider
            min={config.min}
            max={config.max}
            step={config.step || 1}
          />
        );
      case "color":
        return <ColorPicker />;
      case "select":
        if (config.options) {
          return (
            <AsyncSelect
              showSearch
              filterOption={(input, option) =>
                ((option?.label ?? "") as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={config.options}
              allowClear
              mode={config.mode}
              tagRender={config.tagRender}
            />
          );
        }
        break;
      case "boolean":
        return <Switch />;
      case "date":
        return (
          <DatePicker
            style={{ width: "100%" }}
            format={config.format || "YYYY-MM-DD"}
          />
        );
      case "range":
        return (
          <Slider
            range
            min={config.min}
            max={config.max}
            step={config.step || 1}
          />
        );
      case "json":
        return <JsonEditor height={config.height || 200} />;
      case "code":
        return (
          <CodeEditor
            language={config.language || "javascript"}
            height={config.height || 200}
          />
        );
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

  // 处理加载状态
  if (componentLoading) {
    return <div>加载中...</div>;
  }

  // 处理错误状态
  if (componentError) {
    return <div>加载组件失败，请重试</div>;
  }

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
