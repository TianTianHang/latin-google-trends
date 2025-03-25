import React, { useState } from "react";
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
        message.error("获取数据失败");
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
        message.error("获取用户角色失败");
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
        message.success("角色分配成功");
        fetchData();
      },
      onError: () => {
        message.error("角色分配失败");
      },
    }
  );

  const { run: createNewRole, loading: createLoading } = useRequest(
    createRole,
    {
      manual: true,
      onSuccess: () => {
        message.success("角色创建成功");
        setCreateModalVisible(false);
        form.resetFields();
        fetchData();
      },
      onError: () => {
        message.error("角色创建失败");
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
      title: "用户名",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: userInfoType) => (
        <Button type="link" onClick={() => handleUserSelect(record.id)}>
          管理角色
        </Button>
      ),
    },
  ];

  return (
    <Card title="用户角色管理">
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
              <Card title="当前角色" >
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
                title="角色分配"
                extra={
                  <Button
                    type="link"
                    onClick={() => setCreateModalVisible(true)}
                  >
                    创建新角色
                  </Button>
                }
              >
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="选择角色"
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
                  保存
                </Button>
              </Card>
            </Col>
          </Row>
        )}

        <Modal
          title="创建新角色"
          open={createModalVisible}
          onOk={handleCreateRole}
          confirmLoading={createLoading}
          onCancel={() => setCreateModalVisible(false)}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="角色名称"
              rules={[{ required: true, message: "请输入角色名称" }]}
            >
              <Input placeholder="请输入角色名称" />
            </Form.Item>
            <Form.Item name="description" label="角色描述">
              <Input.TextArea placeholder="请输入角色描述" />
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </Card>
  );
};

export default UserRoleManagementPage;
