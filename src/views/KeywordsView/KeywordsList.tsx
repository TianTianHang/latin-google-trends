import { useState, useEffect } from 'react';
import { Table, Input, Select } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { getCategories, getKeywords } from '@/api/keywords';

import type { CategoryResponse, KeywordResponse } from '@/types/keywords';

type Keyword = KeywordResponse;

const KeywordsList = () => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [filters, setFilters] = useState({
    name: '',
    category: '',
  });

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const columns: ColumnsType<Keyword> = [
    {
      title: '关键词',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '定义',
      dataIndex: 'definition',
      key: 'definition',
    },
  ];

  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const response = await getKeywords();
      setKeywords(response);
      setPagination({
        ...pagination,
        total: response.length,
      });
    } catch (error) {
      console.error('获取关键词失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, [pagination.current, filters]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    }));
  };

  const handleSearch = (value: string) => {
    setFilters({ ...filters, name: value });
  };

  const handleCategoryFilter = (value: string) => {
    setFilters({ ...filters, category: value });
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索关键词"
          onSearch={handleSearch}
          style={{ width: 200, marginRight: 8 }}
        />
        <Select
          placeholder="选择类别"
          onChange={handleCategoryFilter}
          style={{ width: 200 }}
          allowClear
        >
          {categories.map(category => (
            <Select.Option key={category.id} value={category.id}>
              {category.name}
            </Select.Option>
          ))}
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={keywords}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default KeywordsList;
