import { KeywordData, DefinitionResponse } from '@/types/keywords';
import { useState } from 'react';
import { Card, Button, Tabs, message } from 'antd';
import { SoundOutlined } from '@ant-design/icons';

interface KeywordDetailProps {
  keyword: KeywordData;
}

export default function KeywordDetail({ keyword }: KeywordDetailProps) {
  const [activeDefinition, setActiveDefinition] = useState<DefinitionResponse | null>(
    keyword.definitions.find(def => def.is_primary) || keyword.definitions[0]
  );

  const handlePlayPronunciation = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(keyword.word);
      utterance.lang = 'la'; // 拉丁语
      speechSynthesis.speak(utterance);
    } else {
      message.warning('您的浏览器不支持语音合成功能');
    }
  };

  return (
    <div className="keyword-detail">
      <Card title={keyword.word} className="keyword-card">
        <div className="pronunciation-section">
          <span>发音: {keyword.pronunciation}</span>
          <Button 
            type="text" 
            icon={<SoundOutlined />} 
            onClick={handlePlayPronunciation}
          />
        </div>
      </Card>

      <div className="definitions-section">
        <Tabs
          activeKey={activeDefinition?.id.toString()}
          onChange={(key) => {
            const def = keyword.definitions.find(d => d.id.toString() === key);
            if (def) setActiveDefinition(def);
          }}
          items={keyword.definitions.map(def => ({
            key: def.id.toString(),
            label: def.is_primary ? '主定义' : `定义 ${def.id}`,
            children: <p>{def.definition}</p>,
          }))}
        />
      </div>
    </div>
  );
}