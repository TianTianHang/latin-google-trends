import { ColorPicker, Form, Input, InputNumber, Modal, Select } from "antd";
import { useEditorStore } from "./store";

interface PropertyEditorProps {
  componentId: string;
  visible: boolean;
  onClose: ()=>void;
}
export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  componentId,visible,onClose
}) => {
  const { components, registered, updateProps } = useEditorStore();
  const selectedComponent = components.find((c) => c.id === componentId);
  const [form]=Form.useForm()
  if (!selectedComponent) return null;
  const registeredComponent = registered.get(selectedComponent.type);
  const propSchema = registeredComponent?.meta.propSchema;

  if (!propSchema) return null;
  const renderFormControl = (
    type: string,
    config: {
      type: "text" | "number" | "color" | "select";
      label?: string;
      placeholder?:string;
      options?: Array<{
        label: string;
        value: unknown;
      }>;
    }
  ) => {
    switch (type) {
      case "text":
        return <Input placeholder={config.placeholder} />;
      case "number":
        return <InputNumber style={{ width: "100%" }} />;
      case "color":
        return <ColorPicker />;
      case "select":
        return <Select options={config.options} />;
      default:
        return null;
    }
  };
  return (
    <Modal 
    open={visible}
    onCancel={()=>{
      onClose();
    }}
    onOk={()=>{
      form.submit();
      onClose();
    }}
    >
    <Form
      form={form}
      layout="vertical"
      onFinish={(changedValues) => {
        // 合并变更值到现有props
        updateProps(componentId, {
          ...selectedComponent.props,
          ...changedValues,
        });
      }}
      initialValues={selectedComponent.props}
    >
      {Object.entries(propSchema).map(([fieldName, config]) => (
        <Form.Item
          key={fieldName}
          name={fieldName}
          label={config.label || fieldName}
        >
          {renderFormControl(config.type, config)}
        </Form.Item>
      ))}
    </Form>
    </Modal>
  );
};
