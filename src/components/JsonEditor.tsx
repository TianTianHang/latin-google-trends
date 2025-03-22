import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Card } from 'antd';

interface JsonEditorProps {
  height?: number;
  value?: string;
  onChange?: (value: string) => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  height = 200,
  value = '',
  onChange,
}) => {
  const [json, setJson] = useState(value);

  const handleChange = (newValue?: string) => {
    const val = newValue || '';
    setJson(val);
    onChange?.(val);
  };

  return (
    <Card styles={{ body:{padding: 0} }}>
      <Editor
        height={height}
        language="json"
        value={json}
        onChange={handleChange}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </Card>
  );
};