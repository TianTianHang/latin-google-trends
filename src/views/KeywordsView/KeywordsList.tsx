import { useState } from 'react';
import { Table, Input, Select, Row, Col, Space } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import useRequest from 'ahooks/lib/useRequest';
import { useTranslation } from 'react-i18next';
import { getCategories, getKeywords } from '@/api/keywords';

import type { KeywordData, KeyWordQuery } from '@/types/keywords';
import KeywordsManagement from './KeywordsManagement';
import { KeywordAction } from './KeyWordAction';

type Keyword = KeywordData;

const KeywordsList = () => {
  const { t } = useTranslation('views');
  const [filters, setFilters] = useState({
    name: '',
    category_id: -1,
  });

  const { data: categoriesData, loading: categoriesLoading } = useRequest(getCategories,{pollingInterval:3000});

  const { data: keywordsData, loading: keywordsLoading, run,refresh } = useRequest(
    async (params) => {
      const response = await getKeywords(params);
      return response;
    },
    {
      defaultParams:[ { page: 1, page_size: 10 } as KeyWordQuery],
    }
  );

  const columns: ColumnsType<Keyword> = [
    {
      title: t('keywords.table.keyword'),
      dataIndex: 'word',
      key: 'word',
    },
    {
      title: t('keywords.table.category'),
      dataIndex: 'category',
      key: 'category',
      render:(value)=>value.name
    },
    {
      title: t('keywords.table.pronunciation'),
      dataIndex: 'pronunciation',
      key: 'pronunciation',
    },
    {
      title: t('keywords.table.definition'),
      dataIndex: 'definition',
      key: 'definition',
    },
    {
      title: t('keywords.table.actions'),
      dataIndex: 'id',
      render:(value)=><KeywordAction keyword_id={value} refesh={refresh}/>
    }
  ];

  const handleTableChange = (pagination: TablePaginationConfig) => {
    run({ page: pagination.current || 1, page_size: pagination.pageSize || 10 });
  };

  const handleSearch = (value: string) => {
    setFilters({ ...filters, name: value });
    run({ page: 1, page_size: 10, name: value });
  };

  const handleCategoryFilter = (value: number) => {
    setFilters({ ...filters, category_id: value });
    run({ page: 1, page_size: 10, category_id: value });
  };



  return (
    <div>
      <Row >
        <Col span={8}>
        <Space direction='horizontal'>
        <Input.Search
          placeholder={t('keywords.form.keyword')}
          onSearch={handleSearch}
          style={{ width: 200, marginRight: 8 }}
        />
        <Select
          placeholder={t('keywords.form.category')}
          onChange={handleCategoryFilter}
          style={{ width: 200 }}
          allowClear
          loading={categoriesLoading}
        >
          {categoriesData?.map(category => (
            <Select.Option key={category.id} value={category.id}>
              {category.name}
            </Select.Option>
          ))}
        </Select>
        </Space>
        
        </Col>
        <Col span={12}>
        <KeywordsManagement/>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={keywordsData?.items}
        rowKey="id"
        loading={keywordsLoading}
        pagination={{
          current: keywordsData?.page,
          pageSize: keywordsData?.page_size,
          total: keywordsData?.total,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default KeywordsList;



