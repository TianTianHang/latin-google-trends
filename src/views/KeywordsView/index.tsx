 import { Tabs } from 'antd';
import KeywordsList from './KeywordsList';

const KeywordsView = () => {
  const items = [
    {
      key: '1',
      label: '关键词列表',
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
