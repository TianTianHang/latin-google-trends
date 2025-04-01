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
import { useTranslation } from "react-i18next";
import {
  listPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "@/api/permission";
import type { RoutePermission } from "@/types/permission";

const PermissionManagementPage: React.FC = () => {
  const { t } = useTranslation("views");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editingPath, setEditingPath] = useState<string | null>(null);

  const { data: permissions = [], run: fetchPermissions,loading } = useRequest(
    listPermissions,
    {
      onError: () => message.error(t("permission.message.fetchFailed")),
    }
  );

  const { run: create } = useRequest(createPermission, {
    manual: true,
    onSuccess: () => {
      message.success(t("permission.message.createSuccess"));
      fetchPermissions();
      setIsModalVisible(false);
    },
    onError: () => message.error(t("permission.message.createFailed")),
  });

  const { run: update } = useRequest(updatePermission, {
    manual: true,
    onSuccess: () => {
      message.success(t("permission.message.updateSuccess"));
      fetchPermissions();
      setIsModalVisible(false);
    },
    onError: () => message.error(t("permission.message.updateFailed")),
  });

  const { run: remove } = useRequest(deletePermission, {
    manual: true,
    onSuccess: () => {
      message.success(t("permission.message.deleteSuccess"));
      fetchPermissions();
    },
    onError: () => message.error(t("permission.message.deleteFailed")),
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
      message.error(t("permission.message.validationFailed"));
    }
  };

  const columns = [
    {
      title: t("permission.table.serviceName"),
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
      title: t("permission.table.path"),
      dataIndex: "path",
      key: "path",
    },
    {
      title: t("permission.table.requiredPermission"),
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
      title: t("permission.table.action"),
      key: "action",
      render: (_: unknown, record: RoutePermission) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() =>
              handleEdit(record.service_name, record.path, record.required_permission)
            }
          >
            {t("permission.button.edit")}
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.service_name, record.path)}
          >
            {t("permission.button.delete")}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title={t("permission.title")}>
      <Button
        type="primary"
        onClick={handleCreate}
        style={{ marginBottom: 16 }}
      >
        {t("permission.button.add")}
      </Button>
      <Table columns={columns} dataSource={permissions} rowKey="service_name" loading={loading} />
      <Modal
        title={editingService ? t("permission.modal.editTitle") : t("permission.modal.addTitle")}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="service_name"
            label={t("permission.form.serviceName")}
            rules={[{ required: true, message: t("permission.form.validation.serviceName") }]}
          >
            <Input disabled={!!editingService} />
          </Form.Item>
          <Form.Item
            name="path"
            label={t("permission.form.path")}
            rules={[{ required: true, message: t("permission.form.validation.path") }]}
          >
            <Input disabled={!!editingPath} />
          </Form.Item>
          <Form.Item
            name="required_permission"
            label={t("permission.form.requiredPermission")}
            rules={[{ required: true, message: t("permission.form.validation.requiredPermission") }]}
          >
            <Input placeholder={t("permission.form.placeholder")} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PermissionManagementPage;
