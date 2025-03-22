import React from "react";
import { Button, Modal, Form, Space, message, Input, Select, Radio } from "antd";
import { useBoolean, useRequest } from "ahooks";
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
    message.success(`删除成功 msg: ${msg.message}`);
    refesh();
    hideDeleteConfirm();
  };

  const cancelDelete = () => {
    hideDeleteConfirm();
  };

  // 编辑操作处理函数（示例）
  const handleEdit = async (keyword: KeywordUpdate) => {
    const kw = await updateKeyword(keyword_id, keyword);
    message.success(`${kw.id} 更新成功`);
    refesh();
    hideEditConfirm();
  };

  // 添加操作处理函数
  const handleAddDefinition = async (value: DefinitionData) => {
    
    await createDefinition({...value,word_id:keyword_id});
    message.success(`定义创建成功`)
    hideDefinitionConfirm();
  };

  return (
    <Space direction={"horizontal"}>
      {/* 删除按钮 */}
      <Button type="primary" danger onClick={handleDelete}>
        删除
      </Button>

      {/* 确认删除对话框 */}
      <Modal
        title="确认删除"
        open={isDeleteConfirmVisible}
        onOk={confirmDelete}
        onCancel={cancelDelete}
      >
        <p>确定要删除此关键词吗？</p>
      </Modal>

      {/* 编辑按钮 */}
      <Button type="primary" onClick={showEditVisible}>
        编辑
      </Button>

      {/* 根据 isEditVisible 显示编辑表单 */}
      <Modal
        title="编辑"
        open={isEditVisible}
        onOk={() => keywordForm.submit()}
        onCancel={hideEditConfirm}
        loading={keywordsLoading}
      >
        <Form form={keywordForm} initialValues={keyword} onFinish={handleEdit}>
          {/* 编辑表单内容 */}
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

      {/* 添加按钮 */}
      <Button type="primary" onClick={showDefinitionVisible}>
        添加
      </Button>

      <Modal
        title={`定义`}
        open={isDefinitionVisible}
        onCancel={hideDefinitionConfirm}
        onOk={() => definitionForm.submit()}
      >
        <Form form={definitionForm} onFinish={handleAddDefinition}>
          <Form.Item
            label="定义"
            name="definition"
            rules={[{ required: true, message: "请输入定义" }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="是否为主定义" name="is_primary"  rules={[{ required: true, message: "请选择" }]}>
            <Radio.Group
            defaultValue={true}
              options={[
                { value: true, label: "是" },
                { value: false, label: "否" },
                
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};
