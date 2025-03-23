import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, Select, Upload, message, Space } from 'antd';
import PreviewModal from '@/components/Editor/PreviewModal';
import { UploadOutlined } from '@ant-design/icons';
import { useDataProviderStore } from '@/components/Editor/stores/dataProviderStore';
import type { DataSource } from '@/components/Editor/stores/dataProviderStore';
import { fetchApiData, parseCsvData, parseExcelData } from '@/utils/dataSourceUtils';

const { Column } = Table;
const { Option } = Select;

interface ApiConfig {
  url: string;
  method?: string;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  /**
   * 数据转换函数配置
   */
  renderData?: string;
}

interface DataSourceFormValues {
  id: string;
  type: 'api' | 'csv' | 'excel';
  config: ApiConfig | File;
}

const DataSourceManagementPage: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm<DataSourceFormValues>();
  const [type, setType] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDataSource, setPreviewDataSource] = useState<DataSource>();
  useEffect(() => {
    const store = useDataProviderStore.getState();
    const sources = Array.from(store.dataSources.values());
    setDataSources(sources);
  }, []);

  const handleAddDataSource = () => {
    setIsModalVisible(true);
  };

  const handleSaveDataSource = async (values: DataSourceFormValues) => {
    try {
      let config: Record<string, unknown>;
      let fetchFn: () => Promise<unknown>;

      switch (values.type) {
        case 'api': {
          const apiConfig = values.config as ApiConfig;
          config = {
            url: apiConfig.url,
            method: apiConfig.method,
            params: apiConfig.params,
            headers: apiConfig.headers
          };
          fetchFn = async () => fetchApiData(apiConfig);
          break;
        }
        case 'csv':
        case 'excel':
          config = { file: values.config };
          fetchFn = values.type === 'csv'
            ? async () => parseCsvData(config)
            : async () => parseExcelData(config);
          break;
        default:
          throw new Error('Unsupported data source type');
      }

      const newSource: DataSource = {
        id: values.id,
        type: values.type,
        config,
        fetch: fetchFn
      };

      useDataProviderStore.getState().registerDataSource(newSource);
      setDataSources(prev => [...prev, newSource]);
      setIsModalVisible(false);
      message.success('Data source added successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('An unknown error occurred');
      }
      message.error('Failed to add data source');
    }
  };

  const handleDeleteDataSource = (id: string) => {
    useDataProviderStore.getState().unregisterDataSource(id);
    setDataSources(prev => prev.filter(source => source.id !== id));
    message.success('Data source deleted successfully');
  };

  return (
    <div className="data-source-management">
      <div className="actions">
        <Button type="primary" onClick={handleAddDataSource}>
          Add Data Source
        </Button>
      </div>

      <Table dataSource={dataSources} rowKey="id">
        <Column title="ID" dataIndex="id" />
        <Column title="Type" dataIndex="type" />
        <Column
          title="Actions"
          render={(_, record: DataSource) => (
            <Space>
              <Button danger onClick={() => handleDeleteDataSource(record.id)}>
                Delete
              </Button>
              <Button onClick={() => {
                setPreviewDataSource(record);
                setPreviewVisible(true);
              }}>
                预览
              </Button>
            </Space>
          )}
        />
      </Table>

      <Modal
        title="Add Data Source"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSaveDataSource}>
          <Form.Item
            label="ID"
            name="id"
            rules={[{ required: true, message: 'Please input data source ID' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: 'Please select data source type' }]}
          >
            <Select
            value={type}
            onChange={(value)=>setType(value)}
            >
              <Option value="api">API</Option>
              <Option value="csv">CSV</Option>
              <Option value="excel">Excel</Option>
            </Select>
          </Form.Item>

          {type === 'api' && (
            <>
              <Form.Item
                label="API URL"
                name={['config', 'url']}
                rules={[{ required: true, message: 'Please input API URL' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="HTTP Method"
                name={['config', 'method']}
                initialValue="GET"
              >
                <Select>
                  <Option value="GET">GET</Option>
                  <Option value="POST">POST</Option>
                  <Option value="PUT">PUT</Option>
                  <Option value="DELETE">DELETE</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Headers"
                name={['config', 'headers']}
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item
                label="Parameters"
                name={['config', 'params']}
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item
                label="数据转换函数"
                name={['config', 'renderData']}
                tooltip="请输入JavaScript函数体，如：data => data.map(item => ({...item, newField: item.value * 2}))"
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </>
          )}

          {(type === 'csv' || type === 'excel') && (
            <Form.Item
              label="File"
              name="config"
              valuePropName="file"
              getValueFromEvent={e => e.file}
              rules={[{ required: true, message: 'Please upload a file' }]}
            >
              <Upload accept={type === 'csv' ? '.csv' : '.xlsx,.xls'}>
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </Form.Item>
          )}
        </Form>
      </Modal>

      <PreviewModal
        visible={previewVisible}
        dataSource={previewDataSource}
        onCancel={() => setPreviewVisible(false)}
        renderData={
          previewDataSource?.type === 'api' &&
          previewDataSource.config.renderData
            ? new Function(`return ${previewDataSource.config.renderData}`)()
            : undefined
        }
      />
    </div>
  );
};

export default DataSourceManagementPage;