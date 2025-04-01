import React, { useState } from 'react';
import { Form, Input, Button, message, Typography, Divider, Row, Col } from 'antd';
import { useUserStore } from '@/stores/user';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const ProfilePage: React.FC = () => {
  const { t } = useTranslation("views");
  const { username, changePassword } = useUserStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error(t("profile.message.passwordMismatch"));
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      message.success(t("profile.message.changeSuccess"));
      form.resetFields();
    } catch  {
      message.error(t("profile.message.changeFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Title level={4} style={{ marginBottom: 16 }}>
            <UserOutlined style={{ marginRight: 8 }} />
            {t("profile.title.userInfo")}
          </Title>
          <div style={{ 
            background: '#fafafa',
            padding: 16,
            borderRadius: 4
          }}>
            <p style={{ margin: 0 }}>{t("profile.userInfo.username")}{username}</p>
          </div>
        </Col>

        <Col span={24}>
          <Divider />
          <Title level={4} style={{ marginBottom: 16 }}>
            <LockOutlined style={{ marginRight: 8 }} />
            {t("profile.button.changePassword")}
          </Title>
          <Form
            form={form}
            name="change_password"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              label={t("profile.form.oldPassword")}
              name="oldPassword"
              rules={[{ required: true, message: t("profile.form.validation.oldPassword") }]}
            >
              <Input.Password 
                placeholder={t("profile.form.placeholder.oldPassword")}
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item
              label={t("profile.form.newPassword")}
              name="newPassword"
              rules={[
                { required: true, message: t("profile.form.validation.newPassword") },
                { min: 6, message: t("profile.form.validation.passwordLength") }
              ]}
            >
              <Input.Password 
                placeholder={t("profile.form.placeholder.newPassword")}
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item
              label={t("profile.form.confirmPassword")}
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: t("profile.form.validation.confirmPassword") },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t("profile.form.validation.passwordMismatch")));
                  },
                }),
              ]}
            >
              <Input.Password 
                placeholder={t("profile.form.placeholder.confirmPassword")}
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                style={{ width: '100%' }}
              >
                {t("profile.button.changePassword")}
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;