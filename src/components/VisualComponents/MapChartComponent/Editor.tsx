import React from 'react';
import { Form, Input } from 'antd';

interface MapChartArgs {
  title?: string;
  description?: string;
}

interface MapChartEditorProps {
  args: MapChartArgs;
  onChange: (args: MapChartArgs) => void;
}

const MapChartEditor: React.FC<MapChartEditorProps> = ({ args, onChange }) => {
  const handleChange = (changedValues: Partial<MapChartArgs>) => {
    onChange({ ...args, ...changedValues });
  };

  return (
    <Form
      layout="vertical"
      initialValues={args}
      onValuesChange={handleChange}
    >
      <Form.Item label="地图标题" name="title">
        <Input placeholder="请输入地图标题" />
      </Form.Item>
      <Form.Item label="地图描述" name="description">
        <Input.TextArea placeholder="请输入地图描述" />
      </Form.Item>
      {/* TODO: 添加更多配置项 */}
    </Form>
  );
};

export default MapChartEditor;
