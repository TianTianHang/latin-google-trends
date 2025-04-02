import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import KeywordsList from './KeywordsList';

const KeywordsView = () => {
  const { t } = useTranslation('views');
  
  const items = [
    {
      key: '1',
      label: t('keywords.tabs.list'),
      children: <KeywordsList />,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default KeywordsView;
