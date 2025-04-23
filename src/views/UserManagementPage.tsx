import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  Button,
  message,
  Card,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  Tag,
} from "antd";
import { useRequest } from "ahooks";
import { getAllUsers, updateUser } from "@/api/user";
import { userInfoType } from "@/types/user";
import { EditOutlined, UserOutlined } from "@ant-design/icons";

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<userInfoType[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<userInfoType | null>(null);
  const [form] = Form.useForm();
  const { t } = useTranslation("views");

  const { run: fetchUsers, loading: fetchLoading } = useRequest(getAllUsers, {
    manual: false,
    onSuccess: (usersRes) => {
      setUsers(usersRes);
    },
    onError: () => {
      message.error(t("userManagement.message.fetchUsersFailed"));
    },
  });

  const handleEditUser = (user: userInfoType) => {
    setSelectedUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      is_active: user.is_active,
    });
    setEditModalVisible(true);
  };

  const handleUpdateUser = () => {
    form.validateFields().then((values) => {
      // 这里添加更新用户信息的API调用
      updateUser(selectedUser!.id, values);
      message.success(t("userManagement.message.updateSuccess"));
      setEditModalVisible(false);
      form.resetFields();
      fetchUsers();
    });
  };

  const columns = [
    {
      title: t("userManagement.table.username"),
      dataIndex: "username",
      key: "username",
    },
    {
      title: t("userManagement.table.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("userManagement.table.fullName"),
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: t("userManagement.table.phone"),
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: t("userManagement.table.status"),
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive
            ? t("userManagement.status.active")
            : t("userManagement.status.inactive")}
        </Tag>
      ),
    },
    {
      title: t("userManagement.table.action"),
      key: "action",
      render: (_: unknown, record: userInfoType) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            {t("userManagement.button.edit")}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <UserOutlined />
          {t("userManagement.title")}
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={fetchLoading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) =>
              t("userManagement.pagination.total", { total: total }),
          }}
        />

        <Modal
          title={t("userManagement.modal.editUser")}
          open={editModalVisible}
          onOk={handleUpdateUser}
          onCancel={() => setEditModalVisible(false)}
        >
          <Form form={form} layout="vertical">
            {/* <Form.Item
              name="username"
              label={t("userManagement.form.username")}
              rules={[{ required: true, message: t("userManagement.form.validation.usernameRequired") }]}
            >
              <Input disabled />
            </Form.Item> */}
            <Form.Item
              name="email"
              label={t("userManagement.form.email")}
              rules={[
                { required: true, message: t("userManagement.form.validation.emailRequired") },
                { type: "email", message: t("userManagement.form.validation.emailInvalid") },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="full_name"
              label={t("userManagement.form.fullName")}
              rules={[{ required: true, message: t("userManagement.form.validation.fullNameRequired") }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label={t("userManagement.form.phone")}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="is_active"
              label={t("userManagement.form.status")}
              valuePropName="checked"
            >
              <Switch
                checkedChildren={t("userManagement.status.active")}
                unCheckedChildren={t("userManagement.status.inactive")}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </Card>
  );
};

export default UserManagementPage;