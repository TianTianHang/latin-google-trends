import React, { useState } from "react";
import { Button, Form, Input, Modal, Select, message } from "antd";
import { useRequest } from "ahooks";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation('views');
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
        t(`keywords.message.${type}CreateSuccess`)
      );

      handleCloseModal(type);
    } catch {
      message.error(t('keywords.message.operationFailed'));
    }
  };

  return (
    <div>
      {/* 按钮组 */}
      <div style={{ marginBottom: 16 }}>
        <Button onClick={() => handleOpenModal("keyword")} type="primary">
          {t('keywords.button.addKeyword')}
        </Button>
        <Button
          onClick={() => handleOpenModal("category")}
          style={{ marginLeft: 8 }}
        >
          {t('keywords.button.addCategory')}
        </Button>
      </div>

      {/* 关键词管理模态框 */}
      <Modal
        title={modalState.keyword.data ? t('keywords.modal.editKeyword') : t('keywords.modal.addKeyword')}
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
            label={t('keywords.form.keyword')}
            name="word"
            rules={[{ required: true, message: t('keywords.validation.keyword') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('keywords.form.category')}
            name="category_id"
            rules={[{ required: false, message: t('keywords.validation.category') }]}
          >
            <Select loading={categoriesLoading}>
            <Select.Option key={0} value={null}>
                  {t('keywords.text.none')}
                </Select.Option>
              {categories?.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={t('keywords.form.pronunciation')}
            name="pronunciation"
            rules={[{ required: true, message: t('keywords.validation.pronunciation') }]}
          >
            <Input />
          </Form.Item>
          
        </Form>
      </Modal>

      {/* 分类管理模态框 */}
      <Modal
        title={modalState.category.data ? t('keywords.modal.editCategory') : t('keywords.modal.addCategory')}
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
            label={t('keywords.form.categoryName')}
            name="name"
            rules={[{ required: true, message: t('keywords.validation.categoryName') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('keywords.form.description')}
            name="description"
            rules={[{ required: true, message: t('keywords.validation.description') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t('keywords.form.parentCategory')}
            name="parent_id"
            rules={[{ required: false, message: t('keywords.validation.parentCategory') }]}
          >
            <Select loading={categoriesLoading}>
            <Select.Option key={0} value={null}>
                  {t('keywords.text.none')}
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
