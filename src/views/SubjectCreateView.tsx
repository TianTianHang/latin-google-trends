

import { Form, Input, Button, Space, Card, message, Typography, Select, DatePicker } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { createSubject } from '@/api/subject';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '@/stores/user';
import type { RealtimeTask, HistoricalTask } from '@/types/subject';

const { Option } = Select;

interface FormValues {
  parameters: Array<RealtimeTask | HistoricalTask>;
}

const SubjectCreatePage = () => {
  const [form] = Form.useForm<FormValues>();
  const { t } = useTranslation();
  const {id} = useUserStore();
  
  const onFinish = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        user_id: id.toString(),
      };

      const { subject_id } = await createSubject(payload);
      message.success(t('subject.createSuccess', { subject_id }));
      form.resetFields();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(t('subject.createFailed', { error: error.message }));
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { data?: { detail?: string } } };
        message.error(t('subject.createFailed', { error: err.response?.data?.detail || 'Unknown error' }));
      } else {
        message.error(t('subject.createFailed', { error: 'Unknown error' }));
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card
        title={
          <Typography.Title level={3} className="mb-0">
            {t('subject.createTitle')}
          </Typography.Title>
        }
        extra={
          <Typography.Text type="secondary">
            {t('subject.createSubTitle')}
          </Typography.Text>
        }
        className="mb-6"
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.List name="parameters">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  align="baseline"
                  className="flex items-start mb-4"
                  direction="vertical"
                  style={{ width: '100%' }}
                >
                  <Form.Item
                    {...restField}
                    name={[name, 'type']}
                    label={t('subject.taskType')}
                    rules={[{ required: true, message: t('subject.taskTypeRequired') }]}
                  >
                    <Select placeholder={t('subject.selectTaskType')}>
                      <Option value="realtime">{t('subject.realtimeTask')}</Option>
                      <Option value="historical">{t('subject.historicalTask')}</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'data_type']}
                    label={t('subject.dataType')}
                    rules={[{ required: true, message: t('subject.dataTypeRequired') }]}
                  >
                    <Input placeholder={t('subject.enterDataType')} />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'keywords']}
                    label={t('subject.keywords')}
                    rules={[{ required: true, message: t('subject.keywordsRequired') }]}
                  >
                    <Select mode="tags" placeholder={t('subject.enterKeywords')} />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'geo_code']}
                    label={t('subject.geoCode')}
                    rules={[{ required: true, message: t('subject.geoCodeRequired') }]}
                  >
                    <Input placeholder={t('subject.enterGeoCode')} />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'start_date']}
                    label={t('subject.startDate')}
                    rules={[{ required: true, message: t('subject.startDateRequired') }]}
                  >
                    <DatePicker showTime style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, curValues) =>
                      prevValues.parameters?.[name]?.type !== curValues.parameters?.[name]?.type
                    }
                  >
                    {({ getFieldValue }) =>
                      getFieldValue(['parameters', name, 'type']) === 'realtime' ? (
                        <>
                          <Form.Item
                            {...restField}
                            name={[name, 'duration']}
                            label={t('subject.duration')}
                            rules={[{ required: true, message: t('subject.durationRequired') }]}
                          >
                            <Input type="number" placeholder={t('subject.enterDuration')} />
                          </Form.Item>
                        </>
                      ) : (
                        <>
                          <Form.Item
                            {...restField}
                            name={[name, 'end_date']}
                            label={t('subject.endDate')}
                            rules={[{ required: true, message: t('subject.endDateRequired') }]}
                          >
                            <DatePicker showTime style={{ width: '100%' }} />
                          </Form.Item>
                        </>
                      )
                    }
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'interval']}
                    label={t('subject.interval')}
                  >
                    <Input placeholder={t('subject.enterInterval')} />
                  </Form.Item>

                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    className="text-red-500 text-lg hover:text-red-700"
                  />
                </Space>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  className="mt-2"
                >
                  {t('subject.addParam')}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-32 h-10 text-lg"
          >
            {t('subject.submit')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SubjectCreatePage;
