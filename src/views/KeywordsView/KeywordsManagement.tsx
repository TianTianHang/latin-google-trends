import { useState, useEffect } from 'react';
import { Button, Form, Input, Modal, Select, message } from 'antd';
import { 
  createKeyword,
  updateKeyword,
  createCategory,
  updateCategory,
  createDefinition,
  updateDefinition,
  getCategories
} from '@/api/keywords';
import type { KeywordResponse, CategoryResponse, DefinitionResponse, KeywordData, CategoryData } from '@/types/keywords';

const KeywordsManagement = () => {
  const [keywordForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [definitionForm] = Form.useForm();
  const [isKeywordModalVisible, setIsKeywordModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isDefinitionModalVisible, setIsDefinitionModalVisible] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<DefinitionResponse | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleKeywordSubmit = async (values: KeywordData) => {
    try {
      if (selectedKeyword) {
        await updateKeyword(selectedKeyword.id, { ...values });
        message.success('关键词更新成功');
      } else {
        await createKeyword({ ...values });
        message.success('关键词创建成功');
      }
      setIsKeywordModalVisible(false);
    } catch {
      message.error('操作失败');
    }
  };

  const handleCategorySubmit = async (values: CategoryData) => {
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, values);
        message.success('分类更新成功');
      } else {
        await createCategory(values);
        message.success('分类创建成功');
      }
      setIsCategoryModalVisible(false);
    } catch {
      message.error('操作失败');
    }
  };

  const handleDefinitionSubmit = async (values: { wordId: string; definition: string }) => {
    try {
      if (selectedDefinition) {
        await updateDefinition(selectedDefinition.id, { ...values, wordId: selectedDefinition.wordId });
        message.success('定义更新成功');
      } else {
        await createDefinition({ ...values, wordId: '' });
        message.success('定义创建成功');
      }
      setIsDefinitionModalVisible(false);
    } catch {
      message.error('操作失败');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          onClick={() => {
            setSelectedKeyword(null);
            setIsKeywordModalVisible(true);
          }}
        >
          添加关键词
        </Button>
        <Button 
          style={{ marginLeft: 8 }}
          onClick={() => {
            setSelectedCategory(null);
            setIsCategoryModalVisible(true);
          }}
        >
          添加分类
        </Button>
        <Button 
          style={{ marginLeft: 8 }}
          onClick={() => {
            setSelectedDefinition(null);
            setIsDefinitionModalVisible(true);
          }}
        >
          添加定义
        </Button>
      </div>

      {/* 关键词管理 */}
      <Modal
        title={selectedKeyword ? '编辑关键词' : '添加关键词'}
        open={isKeywordModalVisible}
        onCancel={() => setIsKeywordModalVisible(false)}
        onOk={() => keywordForm.submit()}
      >
        <Form
          form={keywordForm}
          onFinish={handleKeywordSubmit}
          initialValues={selectedKeyword || {}}
        >
          <Form.Item
            label="关键词"
            name="word"
            rules={[{ required: true, message: '请输入关键词' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select>
              {categories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="发音"
            name="pronunciation"
            rules={[{ required: true, message: '请输入发音' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="定义"
            name="definition"
            rules={[{ required: true, message: '请输入定义' }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      {/* 分类管理 */}
      <Modal
        title={selectedCategory ? '编辑分类' : '添加分类'}
        open={isCategoryModalVisible}
        onCancel={() => setIsCategoryModalVisible(false)}
        onOk={() => categoryForm.submit()}
      >
        <Form
          form={categoryForm}
          onFinish={handleCategorySubmit}
          initialValues={selectedCategory || {}}
        >
          <Form.Item
            label="分类名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* 定义管理 */}
      <Modal
        title={selectedDefinition ? '编辑定义' : '添加定义'}
        open={isDefinitionModalVisible}
        onCancel={() => setIsDefinitionModalVisible(false)}
        onOk={() => definitionForm.submit()}
      >
        <Form
          form={definitionForm}
          onFinish={handleDefinitionSubmit}
          initialValues={selectedDefinition || {}}
        >
          <Form.Item
            label="关键词ID"
            name="wordId"
            rules={[{ required: true, message: '请输入关键词ID' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="定义"
            name="definition"
            rules={[{ required: true, message: '请输入定义' }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KeywordsManagement;
