import React, { useState, useEffect, useMemo } from 'react';
import { Button, Table, Modal, Form, Input, Select, Upload, message, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import PreviewModal from '@/components/Editor/PreviewModal';
import { UploadOutlined } from '@ant-design/icons';
import { useDataProviderStore } from '@/components/Editor/stores/dataProviderStore';
import type { DataSource } from '@/components/Editor/stores/dataProviderStore';

import MonacoEditor from '@monaco-editor/react';
import { render } from 'nprogress';

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
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm<DataSourceFormValues>();
  const [type, setType] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDataSource, setPreviewDataSource] = useState<DataSource>();
  // === 新增测试结果相关状态 ===
  const [testResultVisible, setTestResultVisible] = useState(false);
  const [testResultData, setTestResultData] = useState<any[]>([]);
  const [testResultColumns, setTestResultColumns] = useState<any[]>([]);

  const { dataSources: sourceMap } = useDataProviderStore();
  const dataSources = useMemo(() => Array.from(sourceMap.values()), [sourceMap]);

  const handleAddDataSource = () => {
    setIsModalVisible(true);
  };

  const handleSaveDataSource = async (values: DataSourceFormValues) => {
    try {
      let config: Record<string, unknown>;
      let fetchFn: (config:DataSource["config"]) => Promise<unknown>;

      switch (values.type) {
        case 'api': {
          const apiConfig = values.config as ApiConfig;
          config = {
            url: apiConfig.url,
            method: apiConfig.method,
            params: apiConfig.params,
            headers: apiConfig.headers,
            renderData: apiConfig.renderData
          };
          fetchFn = (config)=>(window as any).fetchApiData(config);
          break;
        }
        case 'csv':
        case 'excel':
          config = { file: values.config };
          fetchFn = values.type === 'csv'
            ?(config)=>(window as any).parseCsvData(config)
            : (config)=>(window as any).parseExcelData(config);
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
      useDataProviderStore.getState().loadDataSources();
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
                getValueFromEvent={v => v}
                valuePropName="value"
              >
                <div className="border border-gray-300 rounded-md">
                  <MonacoEditor
                    height="120px"
                    language="javascript"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                    onChange={(value) => {
                      form.setFieldValue(['config', 'renderData'], value);
                    }}
                  />
                </div>
              </Form.Item>
              {/* 新增测试按钮 */}
              <Form.Item>
                <Button
                  onClick={async () => {
                    try {
                      const values = await form.validateFields();
                      const apiConfig = values.config as ApiConfig;
                      let data = await (window as any).fetchApiData(apiConfig);
                      if (apiConfig.renderData) {
                        // eslint-disable-next-line no-new-func
                        const fn = new Function(`return ${apiConfig.renderData}`)();
                        data = fn(data);
                      }
                      // 只展示前10条数据
                      let arr = Array.isArray(data) ? data.slice(0, 10) : [data];
                      // 自动生成表头
                      const columns = arr.length > 0
                        ? Object.keys(arr[0]).map(key => ({
                            title: key,
                            dataIndex: key,
                            key,
                            render: (value: any) => {
                              if (value !== null && typeof value === 'object') {
                                const jsonStr = JSON.stringify(value, null, 2);
                                const maxLen = 10;
                                const isLong = jsonStr.length > maxLen;
                                const displayStr = isLong ? jsonStr.slice(0, maxLen) + '...' : jsonStr;
                                return (
                                  <span title={jsonStr}>
                                    <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, display: 'inline'}}>{displayStr}</pre>
                                  </span>
                                );
                              }
                              return String(value);
                            }
                          }))
                        : [];
                      setTestResultData(arr);
                      setTestResultColumns(columns);
                      setTestResultVisible(true);
                    } catch (err: any) {
                      message.error(
                        t("dataSource.message.testFailed") +
                        ": " +
                        (err?.message || String(err))
                      );
                    }
                  }}
                  type="dashed"
                  style={{ marginTop: 8 }}
                >
                  {t("dataSource.button.test")}
                </Button>
              </Form.Item>
            </>
          )}

          {(type === 'csv' || type === 'excel') && (
            <Form.Item
              label={t("dataSource.form.file")}
              name={['config', 'file']}
              getValueFromEvent={(e) => e.fileList?.[0]?.originFileObj}
              rules={[{ required: true, message: t("dataSource.form.validation.file") }]}
            >
              <Upload 
                accept={type === 'csv' ? '.csv' : '.xlsx,.xls'}
                action="" // 禁用上传
                beforeUpload={() => {
                  return false; // 阻止自动上传
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>{t("dataSource.button.upload")}</Button>
              </Upload>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* 新增：测试结果弹窗 */}
      <Modal
        title={t("dataSource.message.testSuccess")}
        open={testResultVisible}
        onCancel={() => setTestResultVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          dataSource={testResultData}
          columns={testResultColumns}
          rowKey={(record, idx) => (record.id ? record.id : idx?.toString())}
          pagination={false}
          scroll={{ x: true }}
          size="small"
        />
      </Modal>

      <PreviewModal
        visible={previewVisible}
        dataSource={previewDataSource}
        onCancel={() => setPreviewVisible(false)}
      />
    </div>
  );
};

export default DataSourceManagementPage;