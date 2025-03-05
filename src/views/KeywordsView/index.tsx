 import { Tabs } from 'antd';
import KeywordsList from './KeywordsList';
import KeywordsManagement from './KeywordsManagement';

const KeywordsView = () => {
  const items = [
    {
      key: '1',
      label: '关键词列表',
      children: <KeywordsList />,
    },
    {
      key: '2',
      label: '关键词管理',
      children: <KeywordsManagement />,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default KeywordsView;
