import { KeywordData, DefinitionResponse } from '@/types/keywords';
import { useState } from 'react';
import { Card, Button, Tabs, message } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next'; // 新增

interface KeywordDetailProps {
  keyword: KeywordData;
}

export default function KeywordDetail({ keyword }: KeywordDetailProps) {
  const { t } = useTranslation("views"); // 新增
  const [activeDefinition, setActiveDefinition] = useState<DefinitionResponse | null>(
    keyword.definitions.find(def => def.is_primary) || keyword.definitions[0]
  );

  const handlePlayPronunciation = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(keyword.word);
      utterance.lang = 'la'; // 拉丁语
      speechSynthesis.speak(utterance);
    } else {
      message.warning(t("keywords.detail.speechNotSupported")); // 国际化
    }
  };

  return (
    <div className="keyword-detail">
      <Card title={keyword.word} className="keyword-card">
        <div className="pronunciation-section">
          <span>{t("keywords.detail.pronunciation")}: {keyword.pronunciation}</span>
          <Button 
            type="text" 
            icon={<SoundOutlined />} 
            onClick={handlePlayPronunciation}
            title={t("keywords.detail.playPronunciation")} // 国际化
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
            label: def.is_primary ? t("keywords.detail.primaryDefinition") : t("keywords.detail.definitionWithId", { id: def.id }),
            children: <p>{def.definition}</p>,
          }))}
        />
      </div>
    </div>
  );
}