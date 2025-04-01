import React from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { useGlobalStore } from '@/stores/global';

const { Option } = Select;

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useGlobalStore();

  const changeLanguage = (value: string) => {
    i18n.changeLanguage(value);
    setLanguage(value);
  };

  return (
    <Select value={language} style={{ width: 120 }} onChange={changeLanguage}>
      <Option value="zh">中文</Option>
      <Option value="en">English</Option>
    </Select>
  );
};

export default LanguageSwitcher;
