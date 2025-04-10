import React from 'react';
import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

const IntroSection: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Card title={t('homePage.intro.title')}>
      <Typography>
        <Title level={5}>{t('homePage.intro.heading')}</Title>
        <Paragraph>
          {t('homePage.intro.description')}
        </Paragraph>
        <Paragraph>
          <ul>
            <li>{t('homePage.intro.features.geoAnalysis')}</li>
            <li>{t('homePage.intro.features.trendTracking')}</li>
            <li>{t('homePage.intro.features.zipfLaw')}</li>
            <li>{t('homePage.intro.features.dataExport')}</li>
          </ul>
        </Paragraph>
      </Typography>
    </Card>
  );
};

export default IntroSection;