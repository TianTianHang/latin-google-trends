import React, { Key, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Tag,
  Card,
} from "antd";
import { useRequest } from "ahooks";
import {
  listPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "@/api/permission";
import type { RoutePermission } from "@/types/permission";

const PermissionManagementPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editingPath, setEditingPath] = useState<string | null>(null);

  const { data: permissions = [], run: fetchPermissions,loading } = useRequest(
    listPermissions,
    {
      onError: () => message.error("获取权限列表失败"),
    }
  );

  const { run: create } = useRequest(createPermission, {
    manual: true,
    onSuccess: () => {
      message.success("创建成功");
      fetchPermissions();
      setIsModalVisible(false);
    },
    onError: () => message.error("创建失败"),
  });

  const { run: update } = useRequest(updatePermission, {
    manual: true,
    onSuccess: () => {
      message.success("更新成功");
      fetchPermissions();
      setIsModalVisible(false);
    },
    onError: () => message.error("更新失败"),
  });

  const { run: remove } = useRequest(deletePermission, {
    manual: true,
    onSuccess: () => {
      message.success("删除成功");
      fetchPermissions();
    },
    onError: () => message.error("删除失败"),
  });

  const handleCreate = () => {
    form.resetFields();
    setEditingService(null);
    setEditingPath(null);
    setIsModalVisible(true);
  };

  const handleEdit = (
    service: string,
    path: string,
    requiredPermissions: string[]
  ) => {
    form.setFieldsValue({
      service_name: service,
      path,
      required_permission: requiredPermissions.join(","),
    });
    setEditingService(service);
    setEditingPath(path);
    setIsModalVisible(true);
  };

  const handleDelete = (service: string, path: string) => {
    remove(service, path);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const permissionData = {
        ...values,
      };

      if (editingService && editingPath) {
        update(editingService, {
          path:editingPath,
          required_permission: permissionData.required_permission,
        });
      } else {
        create(permissionData);
      }
    } catch {
      message.error("表单验证失败");
    }
  };

  const columns = [
    {
      title: "服务名称",
      dataIndex: "service_name",
      key: "service_name",
      filters: permissions.map(p => ({
        text: p.service_name,
        value: p.service_name,
      })),
      onFilter: (value: boolean | Key, record: RoutePermission) =>
        typeof value === 'boolean' ? true : record.service_name===(value.toString()),
    },
    {
      title: "路径",
      dataIndex: "path",
      key: "path",
    },
    {
      title: "所需权限",
      dataIndex: "required_permission",
      key: "required_permission",
      render: (_: unknown, record: RoutePermission) => (
        <div>
          {record.required_permission.map((p, i) => (
            <Tag key={i} color="blue">
              {p}
            </Tag>
          ))}
        </div>
      ),
      filters: Array.from(
        new Set(permissions.flatMap(p => p.required_permission))
      ).map(p => ({
        text: p,
        value: p,
      })),
      onFilter: (value: boolean | Key, record: RoutePermission) =>
        typeof value === 'boolean' ? true : record.required_permission.includes(value.toString()),
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: RoutePermission) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() =>
              handleEdit(record.service_name, record.path, record.required_permission)
            }
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.service_name, record.path)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="权限管理">
      <Button
        type="primary"
        onClick={handleCreate}
        style={{ marginBottom: 16 }}
      >
        新增权限
      </Button>
      <Table columns={columns} dataSource={permissions} rowKey="service_name" loading={loading} />
      <Modal
        title={editingService ? "编辑权限" : "新增权限"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="service_name"
            label="服务名称"
            rules={[{ required: true, message: "请输入服务名称" }]}
          >
            <Input disabled={!!editingService} />
          </Form.Item>
          <Form.Item
            name="path"
            label="路径"
            rules={[{ required: true, message: "请输入路径" }]}
          >
            <Input disabled={!!editingPath} />
          </Form.Item>
          <Form.Item
            name="required_permission"
            label="所需权限(多个权限用逗号分隔)"
            rules={[{ required: true, message: "请输入所需权限" }]}
          >
            <Input placeholder="例如: admin,user" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PermissionManagementPage;
