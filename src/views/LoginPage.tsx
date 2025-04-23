import { Button, Form, Input, message, Tabs, TabsProps } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "@/stores/user";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface LoginForm {
  username: string;
  password: string;
}

interface RegisterForm extends LoginForm {
  confirmPassword: string;
  email: string;
  full_name: string;
  phone: string;
}

export default function LoginPage() {
  const { t } = useTranslation("views");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useUserStore();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "login");

  const onFinishLogin = async (values: LoginForm) => {
    try {
      await login(values);
      navigate("/home");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const onFinishRegister = async (values: RegisterForm) => {
    try {
      await register(values);
      message.success(t("login.message.registerSuccess"));
      setActiveTab("login");
    } catch (error) {
      console.error("Register failed:", error);
    }
  };
  const onGuestLogin = async () => {
    try {
      await login({ username: "guest", password: "" });
      navigate("/home");
    } catch (error) {
      message.error(t("login.message.guestLoginFailed") || "Guest login failed");
    }
  };
  const items: TabsProps["items"] = [
    {
      key: "login",
      label: t("login.tab.login"),
      children: (
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinishLogin}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: t("login.form.validation.username") }]}
          >
            <Input prefix={<UserOutlined />} placeholder={t("login.form.username")} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: t("login.form.validation.password") },
              { min: 8, message: t("login.form.validation.passwordLength") },
              { pattern: /[A-Z]/, message: t("login.form.validation.passwordUppercase") },
              { pattern: /[0-9]/, message: t("login.form.validation.passwordNumber") },
              { pattern: /[^A-Za-z0-9]/, message: t("login.form.validation.passwordSpecial") }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t("login.form.password")} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t("login.button.login")}
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="default" block onClick={onGuestLogin}>
              {t("login.button.guest") || "游客登录"}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "register",
      label: t("login.tab.register"),
      children: (
        <Form name="register" onFinish={onFinishRegister}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: t("login.form.validation.username") }]}
          >
            <Input prefix={<UserOutlined />} placeholder= {t("login.form.username")} />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: t("login.form.validation.email") },
              { type: "email", message: t("login.form.validation.emailFormat") }
            ]}
          >
            <Input placeholder={t("login.form.email")} />
          </Form.Item>

          <Form.Item
            name="full_name"
            rules={[{ required: true, message: t("login.form.validation.fullName") }]}
          >
            <Input placeholder={t("login.form.fullName")} />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: t("login.form.validation.phone") },
              { pattern: /^[0-9]{11}$/, message: t("login.form.validation.phoneFormat") }
            ]}
          >
            <Input placeholder={t("login.form.phone")} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: t("login.form.validation.password") },
              { min: 8, message: t("login.form.validation.passwordLength") },
              { pattern: /[A-Z]/, message: t("login.form.validation.passwordUppercase") },
              { pattern: /[0-9]/, message: t("login.form.validation.passwordNumber") },
              { pattern: /[^A-Za-z0-9]/, message: t("login.form.validation.passwordSpecial") }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t("login.form.password")} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: t("login.form.validation.confirmPassword") },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t("login.form.validation.passwordMismatch")));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t("login.form.confirmPassword")} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t("login.button.register")}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];
  return (
    <div style={{ maxWidth: 300, margin: "100px auto" }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        items={items}
      />
    </div>
  );
}
