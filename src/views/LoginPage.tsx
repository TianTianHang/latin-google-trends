import { Button, Form, Input, message, Tabs } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/user';
import { useState } from 'react';

interface LoginForm {
  username: string;
  password: string;
}

interface RegisterForm extends LoginForm {
  confirmPassword: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useUserStore();
  const [activeTab, setActiveTab] = useState('login');

  const onFinishLogin = async (values: LoginForm) => {
    try {
      await login(values);
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const onFinishRegister = async (values: RegisterForm) => {
    try {
      await register(values);
      message.success('注册成功，请登录');
      setActiveTab('login');
    } catch (error) {
      console.error('Register failed:', error);
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: '100px auto' }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
        <Tabs.TabPane tab="登录" key="login">
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinishLogin}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                登录
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane tab="注册" key="register">
          <Form
            name="register"
            onFinish={onFinishRegister}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                注册
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
