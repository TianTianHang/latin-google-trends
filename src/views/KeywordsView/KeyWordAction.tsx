import React from "react";
import { Button, Modal, Form, Space, message, Input, Select, Radio } from "antd";
import { useBoolean, useRequest } from "ahooks";
import { useTranslation } from "react-i18next";
import {
  createDefinition,
  deleteKeyword,
  getCategories,
  getKeyword,
  updateKeyword,
} from "@/api/keywords";
import { DefinitionData, KeywordUpdate } from "@/types/keywords";

interface KeywordActionProp {
  keyword_id: number;
  refesh: () => void;
}

export const KeywordAction: React.FC<KeywordActionProp> = ({
  keyword_id,
  refesh,
}) => {
  const { t } = useTranslation('views');
  // 初始化状态，比如是否显示编辑或添加表单等
  const [
    isEditVisible,
    { setTrue: showEditVisible, setFalse: hideEditConfirm },
  ] = useBoolean(false);
  const [
    isDefinitionVisible,
    { setTrue: showDefinitionVisible, setFalse: hideDefinitionConfirm },
  ] = useBoolean(false);
  const [
    isDeleteConfirmVisible,
    { setTrue: showDeleteConfirm, setFalse: hideDeleteConfirm },
  ] = useBoolean(false);

  const [keywordForm] = Form.useForm();
  const [definitionForm] = Form.useForm();

  const { data: categories, loading: categoriesLoading } = useRequest(
    getCategories,
    { pollingInterval: 3000 }
  );
  const { data: keyword, loading: keywordsLoading } = useRequest(getKeyword, {
    defaultParams: [keyword_id],
  });
  const handleDelete = () => {
    showDeleteConfirm();
  };

  const confirmDelete = async () => {
    // 实现删除逻辑
    console.log("Deleting keyword with id:", keyword_id);
    const msg = await deleteKeyword(keyword_id);
    message.success(t('keywords.message.deleteSuccess', { msg: msg.message }));
    refesh();
    hideDeleteConfirm();
  };

  const cancelDelete = () => {
    hideDeleteConfirm();
  };

  // 编辑操作处理函数（示例）
  const handleEdit = async (keyword: KeywordUpdate) => {
    const kw = await updateKeyword(keyword_id, keyword);
    message.success(t('keywords.message.updateSuccess', { id: kw.id }));
    refesh();
    hideEditConfirm();
  };

  // 添加操作处理函数
  const handleAddDefinition = async (value: DefinitionData) => {
    
    await createDefinition({...value,word_id:keyword_id});
    message.success(t('keywords.message.createDefinitionSuccess'))
    hideDefinitionConfirm();
  };

  return (
    <Space direction={"horizontal"}>
      {/* 删除按钮 */}
      <Button type="primary" danger onClick={handleDelete}>
        {t('keywords.button.delete')}
      </Button>

      {/* 确认删除对话框 */}
      <Modal
        title={t('keywords.modal.confirmDelete')}
        open={isDeleteConfirmVisible}
        onOk={confirmDelete}
        onCancel={cancelDelete}
      >
        <p>{t('keywords.message.confirmDelete')}</p>
      </Modal>

      {/* 编辑按钮 */}
      <Button type="primary" onClick={showEditVisible}>
        {t('keywords.button.edit')}
      </Button>

      {/* 根据 isEditVisible 显示编辑表单 */}
      <Modal
        title={t('keywords.modal.edit')}
        open={isEditVisible}
        onOk={() => keywordForm.submit()}
        onCancel={hideEditConfirm}
        loading={keywordsLoading}
      >
        <Form form={keywordForm} initialValues={keyword} onFinish={handleEdit}>
          {/* 编辑表单内容 */}
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

      {/* 添加按钮 */}
      <Button type="primary" onClick={showDefinitionVisible}>
        {t('keywords.button.add')}
      </Button>

      <Modal
        title={t('keywords.modal.definition')}
        open={isDefinitionVisible}
        onCancel={hideDefinitionConfirm}
        onOk={() => definitionForm.submit()}
      >
        <Form form={definitionForm} onFinish={handleAddDefinition}>
          <Form.Item
            label={t('keywords.form.definition')}
            name="definition"
            rules={[{ required: true, message: t('keywords.validation.definition') }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item label={t('keywords.form.isPrimary')} name="is_primary"  rules={[{ required: true, message: t('keywords.validation.select') }]}>
            <Radio.Group
            defaultValue={true}
              options={[
                { value: true, label: t('keywords.radio.yes') },
                { value: false, label: t('keywords.radio.no') },
                
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};
