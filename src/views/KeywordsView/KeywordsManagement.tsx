import React, { useState } from "react";
import { Button, Form, Input, Modal, Select, message } from "antd";
import { useRequest } from "ahooks";
import {
  createKeyword,
  getCategories,
  createCategory,
} from "@/api/keywords";
import type {
  KeywordResponse,
  CategoryResponse,
  DefinitionResponse,
} from "@/types/keywords";

interface ModalState {
  keyword: { visible: boolean; data: KeywordResponse | null };
  category: { visible: boolean; data: CategoryResponse | null };
 
}

const KeywordsManagement: React.FC = () => {
  const [modalState, setModalState] = useState<ModalState>({
    keyword: { visible: false, data: null },
    category: { visible: false, data: null },
  
  });

  const [keywordForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
 

  const { data: categories, loading: categoriesLoading } =
    useRequest(getCategories,{pollingInterval: 3000,});

  const handleOpenModal = (
    type: keyof ModalState,
    data: KeywordResponse | CategoryResponse | DefinitionResponse | null = null
  ) => {
    setModalState((prev) => ({
      ...prev,
      [type]: { visible: true, data },
    }));
  };

  const handleCloseModal = (type: keyof ModalState) => {
    setModalState((prev) => ({
      ...prev,
      [type]: { visible: false, data: null },
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (type: keyof ModalState, values: any) => {
    try {
      await {
        keyword: createKeyword,
        category: createCategory,
      }[type](values);
      message.success(
        `${
          type === "keyword" ? "关键词" : type === "category" ? "分类" : "定义"
        }创建成功`
      );

      handleCloseModal(type);
    } catch {
      message.error("操作失败");
    }
  };

  return (
    <div>
      {/* 按钮组 */}
      <div style={{ marginBottom: 16 }}>
        <Button onClick={() => handleOpenModal("keyword")} type="primary">
          添加关键词
        </Button>
        <Button
          onClick={() => handleOpenModal("category")}
          style={{ marginLeft: 8 }}
        >
          添加分类
        </Button>
      </div>

      {/* 关键词管理模态框 */}
      <Modal
        title={`${modalState.keyword.data ? "编辑" : "添加"}关键词`}
        open={modalState.keyword.visible}
        onCancel={() => handleCloseModal("keyword")}
        onOk={() => keywordForm.submit()}
      >
        <Form
          form={keywordForm}
          onFinish={(values) => handleSubmit("keyword", values)}
        >
          {/* 表单项根据需要添加 */}

          <Form.Item
            label="关键词"
            name="word"
            rules={[{ required: true, message: "请输入关键词" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="分类"
            name="category_id"
            rules={[{ required: false, message: "请选择分类" }]}
          >
            <Select loading={categoriesLoading}>
            <Select.Option key={0} value={null}>
                  {"无"}
                </Select.Option>
              {categories?.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="发音"
            name="pronunciation"
            rules={[{ required: true, message: "请输入发音" }]}
          >
            <Input />
          </Form.Item>
          
        </Form>
      </Modal>

      {/* 分类管理模态框 */}
      <Modal
        title={`${modalState.category.data ? "编辑" : "添加"}分类`}
        open={modalState.category.visible}
        onCancel={() => handleCloseModal("category")}
        onOk={() => {categoryForm.submit()}}
      >
        <Form
          form={categoryForm}
          onFinish={(values) => handleSubmit("category", values)}
        >
          {/* 表单项根据需要添加 */}
          <Form.Item
            label="分类名称"
            name="name"
            rules={[{ required: true, message: "请输入分类名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: "请输入分类名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="父分类"
            name="parent_id"
            rules={[{ required: false, message: "请选择父分类" }]}
          >
            <Select loading={categoriesLoading}>
            <Select.Option key={0} value={null}>
                  {"无"}
                </Select.Option>
              {categories?.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      
    </div>
  );
};

export default KeywordsManagement;
