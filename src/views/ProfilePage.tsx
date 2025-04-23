import React, { useState } from 'react';
import { Form, Input, Button, message, Typography, Divider, Row, Col } from 'antd';
import { useUserStore } from '@/stores/user';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import usePermission from '@/hooks/usePermission';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';

const { Title } = Typography;

const ProfilePage: React.FC = () => {
  const { t } = useTranslation("views");
  const { 
    username, 
    email,
    fullName,
    phone,
    isActive,
    createdAt,
    lastLogin,
    changePassword,
    resetToken 
  } = useUserStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { hasPermission } = usePermission();
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
    } catch {
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
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <p style={{ margin: 0 }}>
                  <UserOutlined style={{ marginRight: 8 }} />
                  {t("profile.userInfo.username")}: {username}
                </p>
              </Col>
              <Col span={24}>
                <p style={{ margin: 0 }}>
                  <MailOutlined style={{ marginRight: 8 }} />
                  {t("profile.userInfo.email")}: {email}
                </p>
              </Col>
              <Col span={24}>
                <p style={{ margin: 0 }}>
                  <UserOutlined style={{ marginRight: 8 }} />
                  {t("profile.userInfo.fullName")}: {fullName}
                </p>
              </Col>
              <Col span={24}>
                <p style={{ margin: 0 }}>
                  <PhoneOutlined style={{ marginRight: 8 }} />
                  {t("profile.userInfo.phone")}: {phone}
                </p>
              </Col>
              {/* <Col span={24}>
                <p style={{ margin: 0 }}>
                  {t("profile.userInfo.status")}: {isActive ? t("profile.userInfo.active") : t("profile.userInfo.inactive")}
                </p>
              </Col> */}
              <Col span={24}>
                <p style={{ margin: 0 }}>
                  {t("profile.userInfo.createdAt")}: {createdAt ? dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </p>
              </Col>
              <Col span={24}>
                <p style={{ margin: 0 }}>
                  {t("profile.userInfo.lastLogin")}: {lastLogin ? dayjs(lastLogin).format('YYYY-MM-DD HH:mm:ss') : t("profile.userInfo.never")}
                </p>
              </Col>
            </Row>
          </div>
        </Col>
        {hasPermission(["admin","user"]) ? (
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
                  { min: 8, message: t("login.form.validation.passwordLength") },
                  { pattern: /[A-Z]/, message: t("login.form.validation.passwordUppercase") },
                  { pattern: /[0-9]/, message: t("login.form.validation.passwordNumber") },
                  { pattern: /[^A-Za-z0-9]/, message: t("login.form.validation.passwordSpecial") }
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
        ):(
          <Col span={24}>
            <Divider />
            <Title level={4} style={{ marginBottom: 16 }}>
              <UserOutlined style={{ marginRight: 8 }} />
              {t("profile.title.registerPrompt")}
            </Title>
            <div style={{
              background: '#fafafa',
              padding: 16,
              borderRadius: 4
            }}>
              <p style={{ marginBottom: 16 }}>{t("profile.message.registerPrompt")}</p>
              <Button 
                type="primary" 
                onClick={() => {
                  resetToken();
                  navigate({pathname: '/login', search: '?tab=register'})}}
              >
                {t("profile.button.registerNow")}
              </Button>
            </div>
          </Col>
        )}

      </Row>
    </div>
  );
};

export default ProfilePage;