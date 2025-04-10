import React from 'react';
import { Card, Button, Space } from 'antd';
import { PlusOutlined, HistoryOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

const QuickAccess: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <Card title={t('homePage.quickAccess.title')}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          onClick={() => navigate('/data/subject/2')}
        >
          {t('homePage.quickAccess.newAnalysis')}
        </Button>
        <Button
          icon={<HistoryOutlined />}
          block
          onClick={() => navigate('/dashboard/default')}
        >
          {t('homePage.quickAccess.viewHistory')}
        </Button>
        <Button
          icon={<AppstoreOutlined />}
          block
          onClick={() => navigate('/tasks')}
        >
          {t('homePage.quickAccess.viewTasks')}
        </Button>
      </Space>
    </Card>
  );
};

export default QuickAccess;