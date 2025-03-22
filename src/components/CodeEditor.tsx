import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Card } from 'antd';

interface CodeEditorProps {
  language?: string;
  height?: number;
  value?: string;
  onChange?: (value: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language = 'javascript',
  height = 200,
  value = '',
  onChange,
}) => {
  const [code, setCode] = useState(value);

  const handleChange = (newValue?: string) => {
    const val = newValue || '';
    setCode(val);
    onChange?.(val);
  };

  return (
    <Card styles={{ body:{padding: 0} }}>
      <Editor
        height={height}
        language={language}
        value={code}
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