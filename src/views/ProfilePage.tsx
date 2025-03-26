import React, { useState } from 'react';
import { Form, Input, Button, message, Typography, Divider, Row, Col } from 'antd';
import { useUserStore } from '@/stores/user';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ProfilePage: React.FC = () => {
  const { username, changePassword } = useUserStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的新密码不一致');
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      message.success('密码修改成功');
      form.resetFields();
    } catch  {
      message.error('密码修改失败');
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
            用户信息
          </Title>
          <div style={{ 
            background: '#fafafa',
            padding: 16,
            borderRadius: 4
          }}>
            <p style={{ margin: 0 }}>用户名: {username}</p>
          </div>
        </Col>

        <Col span={24}>
          <Divider />
          <Title level={4} style={{ marginBottom: 16 }}>
            <LockOutlined style={{ marginRight: 8 }} />
            修改密码
          </Title>
          <Form
            form={form}
            name="change_password"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              label="旧密码"
              name="oldPassword"
              rules={[{ required: true, message: '请输入旧密码' }]}
            >
              <Input.Password 
                placeholder="请输入当前密码" 
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码长度不能少于6位' }
              ]}
            >
              <Input.Password 
                placeholder="请输入新密码" 
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的新密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password 
                placeholder="请再次输入新密码" 
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
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;