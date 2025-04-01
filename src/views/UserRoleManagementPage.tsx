import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  Button,
  Select,
  message,
  Card,
  Space,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Tag,
  Spin,
} from "antd";
import { useRequest } from "ahooks";
import {
  getAllUsers,
  getAllRoles,
  assignRoles,
  getUserRoles,
  createRole,
} from "@/api/user";
import { userInfoType, RoleResponse } from "@/types/user";

const UserRoleManagementPage: React.FC = () => {
  const [users, setUsers] = useState<userInfoType[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation("views");

  const { run: fetchData, loading: fetchLoading } = useRequest(
    async () => {
      const [usersRes, rolesRes] = await Promise.all([
        getAllUsers(),
        getAllRoles(),
      ]);
      return { usersRes, rolesRes };
    },
    {
      manual: false,
      onSuccess: ({ usersRes, rolesRes }) => {
        setUsers(usersRes);
        setRoles(rolesRes);
      },
      onError: () => {
        message.error(t("userRole.message.fetchDataFailed"));
      },
    }
  );

  const { run: fetchUserRoles, loading: userRoleLoading } = useRequest(
    getUserRoles,
    {
      manual: true,
      onSuccess: (userRoles) => {
        setSelectedRoles(userRoles.map((role) => role.id));
      },
      onError: () => {
        message.error(t("userRole.message.fetchUserRolesFailed"));
      },
    }
  );

  const handleUserSelect = (userId: number) => {
    setSelectedUser(userId);
    fetchUserRoles(userId);
  };

  const handleRoleChange = (value: number[]) => {
    setSelectedRoles(value);
  };

  const { run: assignUserRoles, loading: assignLoading } = useRequest(
    assignRoles,
    {
      manual: true,
      onSuccess: () => {
        message.success(t("userRole.message.assignRolesSuccess"));
        fetchData();
      },
      onError: () => {
        message.error(t("userRole.message.assignRolesFailed"));
      },
    }
  );

  const { run: createNewRole, loading: createLoading } = useRequest(
    createRole,
    {
      manual: true,
      onSuccess: () => {
        message.success(t("userRole.message.createRoleSuccess"));
        setCreateModalVisible(false);
        form.resetFields();
        fetchData();
      },
      onError: () => {
        message.error(t("userRole.message.createRoleFailed"));
      },
    }
  );

  const handleCreateRole = () => {
    form.validateFields().then((values) => {
      createNewRole(values);
    });
  };

  const handleAssignRoles = () => {
    if (!selectedUser) return;
    assignUserRoles(selectedUser, { role_ids: selectedRoles });
  };

  const columns = [
    {
      title: t("userRole.table.username"),
      dataIndex: "username",
      key: "username",
    },
    {
      title: t("userRole.table.action"),
      key: "action",
      render: (_: unknown, record: userInfoType) => (
        <Button type="link" onClick={() => handleUserSelect(record.id)}>
          {t("userRole.button.manageRoles")}
        </Button>
      ),
    },
  ];

  return (
    <Card title={t("userRole.title.userRoleManagement")}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={fetchLoading}
          pagination={false}
        />

        {selectedUser && (
          <Row gutter={16}>
            <Col span={12}>
              <Card title={t("userRole.title.currentRoles")}>
                {userRoleLoading ? (
                  <Spin />
                ) : (
                  selectedRoles.map((roleId) => {
                    const role = roles.find((r) => r.id === roleId);
                    return role ? (
                      <Tag color="blue" key={role.id}>
                        {role.name}
                      </Tag>
                    ) : null;
                  })
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title={t("userRole.title.roleAssignment")}
                extra={
                  <Button
                    type="link"
                    onClick={() => setCreateModalVisible(true)}
                  >
                    {t("userRole.button.createNewRole")}
                  </Button>
                }
              >
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder={t("userRole.placeholder.selectRoles")}
                  value={selectedRoles}
                  onChange={handleRoleChange}
                  loading={fetchLoading}
                >
                  {roles.map((role) => (
                    <Select.Option key={role.id} value={role.id}>
                      {role.name}
                    </Select.Option>
                  ))}
                </Select>
                <Button
                  type="primary"
                  onClick={handleAssignRoles}
                  loading={assignLoading}
                  style={{ marginTop: 16 }}
                >
                  {t("userRole.button.save")}
                </Button>
              </Card>
            </Col>
          </Row>
        )}

        <Modal
          title={t("userRole.title.createNewRole")}
          open={createModalVisible}
          onOk={handleCreateRole}
          confirmLoading={createLoading}
          onCancel={() => setCreateModalVisible(false)}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label={t("userRole.form.roleName")}
              rules={[{ required: true, message: t("userRole.message.roleNameRequired") }]}
            >
              <Input placeholder={t("userRole.placeholder.enterRoleName")} />
            </Form.Item>
            <Form.Item name="description" label={t("userRole.form.roleDescription")}>
              <Input.TextArea placeholder={t("userRole.placeholder.enterRoleDescription")} />
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </Card>
  );
};

export default UserRoleManagementPage;
