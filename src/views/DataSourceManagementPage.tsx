import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, Select, Upload, message, Space } from 'antd';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation("views");
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
        id: values.id || `ds_${Date.now()}`, // 生成唯一ID如果用户未提供
        type: values.type,
        config,
        fetch: fetchFn
      };

      await useDataProviderStore.getState().registerDataSource(newSource,true);
      setDataSources(prev => [...prev, newSource]);
      setIsModalVisible(false);
      message.success(t("dataSource.message.addSuccess"));
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('An unknown error occurred');
      }
      message.error(t("dataSource.message.addFailed"));
    }
  };

  const handleDeleteDataSource = (id: string) => {
    useDataProviderStore.getState().unregisterDataSource(id);
    setDataSources(prev => prev.filter(source => source.id !== id));
    message.success(t("dataSource.message.deleteSuccess"));
  };

  return (
    <div className="data-source-management">
      <div className="actions">
        <Button type="primary" onClick={handleAddDataSource}>
          {t("dataSource.button.add")}
        </Button>
      </div>

      <Table dataSource={dataSources.filter(d=>!d.id.startsWith("subject"))} rowKey="id">
        <Column title={t("dataSource.table.id")} dataIndex="id" />
        <Column title={t("dataSource.table.type")} dataIndex="type" />
        <Column
          title={t("dataSource.table.actions")}
          render={(_, record: DataSource) => (
            <Space>
              <Button danger onClick={() => handleDeleteDataSource(record.id)}>
                {t("dataSource.button.delete")}
              </Button>
              <Button onClick={() => {
                setPreviewDataSource(record);
                setPreviewVisible(true);
              }}>
                {t("dataSource.button.preview")}
              </Button>
            </Space>
          )}
        />
      </Table>

      <Modal
       title={t("dataSource.modal.addTitle")}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSaveDataSource}>
          <Form.Item
            label={t("dataSource.form.id")}
            name="id"
            rules={[{ required: true, message: t("dataSource.form.validation.id") }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t("dataSource.form.type")}
            name="type"
            rules={[{ required: true, message: t("dataSource.form.validation.type") }]}
          >
            <Select
            value={type}
            onChange={(value)=>setType(value)}
            >
              <Option value="api">{t("dataSource.select.api")}</Option>
              <Option value="csv">{t("dataSource.select.csv")}</Option>
              <Option value="excel">{t("dataSource.select.excel")}</Option>
            </Select>
          </Form.Item>

          {type === 'api' && (
            <>
              <Form.Item
                label={t("dataSource.form.apiUrl")}
                name={['config', 'url']}
                rules={[{ required: true, message: t("dataSource.form.validation.apiUrl") }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t("dataSource.form.httpMethod")}
                name={['config', 'method']}
                initialValue="GET"
              >
                <Select>
                  <Option value="GET">{t("dataSource.select.get")}</Option>
                  <Option value="POST">{t("dataSource.select.post")}</Option>
                  <Option value="PUT">{t("dataSource.select.put")}</Option>
                  <Option value="DELETE">{t("dataSource.select.delete")}</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={t("dataSource.form.headers")}
                name={['config', 'headers']}
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item
                label={t("dataSource.form.params")}
                name={['config', 'params']}
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              <Form.Item
                label={t("dataSource.form.dataTransform")}
                name={['config', 'renderData']}
                tooltip={t("dataSource.form.dataTransformTooltip")}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </>
          )}

          {(type === 'csv' || type === 'excel') && (
            <Form.Item
              label={t("dataSource.form.file")}
              name="config"
              valuePropName="file"
              getValueFromEvent={e => e.file}
              rules={[{ required: true, message: t("dataSource.form.validation.file") }]}
            >
              <Upload accept={type === 'csv' ? '.csv' : '.xlsx,.xls'}>
                <Button icon={<UploadOutlined />}>{t("dataSource.button.upload")}</Button>
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