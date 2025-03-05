import { KeywordData, KeywordResponse, DefinitionData, DefinitionResponse, CategoryData, CategoryResponse } from '@/types/keywords';
import http from '@/utils/request';

// api接口 - 统一保存接口url路径
const api = {
  createKeyword: '/query/keywords/words/create',  // 创建关键词接口
  getKeywords: '/query/keywords/words/list',  // 获取关键词列表接口
  getKeyword: '/query/keywords/words/{keyword_id}',  // 获取单个关键词接口
  updateKeyword: '/query/keywords/words/{keyword_id}/update',  // 更新关键词接口
  deleteKeyword: '/query/keywords/words/{keyword_id}/delete',  // 删除关键词接口
  createDefinition: '/query/keywords/definitions/create',  // 创建定义接口
  getDefinition: '/query/keywords/definitions/{definition_id}',  // 获取单个定义接口
  updateDefinition: '/query/keywords/definitions/{definition_id}/update',  // 更新定义接口
  deleteDefinition: '/query/keywords/definitions/{definition_id}/delete',  // 删除定义接口
  createCategory: '/query/keywords/categories/create',  // 创建分类接口
  getCategory: '/query/keywords/categories/{category_id}',  // 获取单个分类接口
  updateCategory: '/query/keywords/categories/{category_id}/update',  // 更新分类接口
  deleteCategory: '/query/keywords/categories/{category_id}/delete',  // 删除分类接口
  getCategories: '/query/keywords/categories/list',  // 获取类别列表接口
};

/**
 * @description: 创建关键词
 * @param {KeywordData} data 关键词数据
 * @return 返回创建结果
 */
export function createKeyword(data: KeywordData) {
  return http.post<KeywordResponse>(api.createKeyword, data);
}

/**
 * @description: 获取关键词列表
 * @return 返回关键词列表
 */
export function getKeywords() {
  return http.get<KeywordResponse[]>(api.getKeywords);
}

/**
 * @description: 获取单个关键词
 * @param {number} keywordId 关键词ID
 * @return 返回关键词数据
 */
export function getKeyword(keywordId: number) {
  const url = api.getKeyword.replace('{keyword_id}', keywordId.toString());
  return http.get<KeywordResponse>(url);
}

/**
 * @description: 更新关键词
 * @param {number} keywordId 关键词ID
 * @param {KeywordData} data 关键词数据
 * @return 返回更新结果
 */
export function updateKeyword(keywordId: number, data: KeywordData) {
  const url = api.updateKeyword.replace('{keyword_id}', keywordId.toString());
  return http.put<KeywordResponse>(url, data);
}

/**
 * @description: 删除关键词
 * @param {number} keywordId 关键词ID
 * @return 返回删除结果
 */
export function deleteKeyword(keywordId: number) {
  const url = api.deleteKeyword.replace('{keyword_id}', keywordId.toString());
  return http.delete<{ message: string }>(url);
}

/**
 * @description: 创建定义
 * @param {DefinitionData} data 定义数据
 * @return 返回创建结果
 */
export function createDefinition(data: DefinitionData) {
  return http.post<DefinitionResponse>(api.createDefinition, data);
}

/**
 * @description: 获取单个定义
 * @param {number} definitionId 定义ID
 * @return 返回定义数据
 */
export function getDefinition(definitionId: number) {
  const url = api.getDefinition.replace('{definition_id}', definitionId.toString());
  return http.get<DefinitionResponse>(url);
}

/**
 * @description: 更新定义
 * @param {number} definitionId 定义ID
 * @param {DefinitionData} data 定义数据
 * @return 返回更新结果
 */
export function updateDefinition(definitionId: number, data: DefinitionData) {
  const url = api.updateDefinition.replace('{definition_id}', definitionId.toString());
  return http.put<DefinitionResponse>(url, data);
}

/**
 * @description: 删除定义
 * @param {number} definitionId 定义ID
 * @return 返回删除结果
 */
export function deleteDefinition(definitionId: number) {
  const url = api.deleteDefinition.replace('{definition_id}', definitionId.toString());
  return http.delete<{ message: string }>(url);
}

/**
 * @description: 创建分类
 * @param {CategoryData} data 分类数据
 * @return 返回创建结果
 */
export function createCategory(data: CategoryData) {
  return http.post<CategoryResponse>(api.createCategory, data);
}

/**
 * @description: 获取单个分类
 * @param {number} categoryId 分类ID
 * @return 返回分类数据
 */
export function getCategory(categoryId: number) {
  const url = api.getCategory.replace('{category_id}', categoryId.toString());
  return http.get<CategoryResponse>(url);
}

/**
 * @description: 更新分类
 * @param {number} categoryId 分类ID
 * @param {CategoryData} data 分类数据
 * @return 返回更新结果
 */
export function updateCategory(categoryId: number, data: CategoryData) {
  const url = api.updateCategory.replace('{category_id}', categoryId.toString());
  return http.put<CategoryResponse>(url, data);
}

/**
 * @description: 删除分类
 * @param {number} categoryId 分类ID
 * @return 返回删除结果
 */
export function deleteCategory(categoryId: number) {
  const url = api.deleteCategory.replace('{category_id}', categoryId.toString());
  return http.delete<{ message: string }>(url);
}

/**
 * @description: 获取分类列表
 * @return 返回分类列表
 */
export function getCategories() {
  return http.get<CategoryResponse[]>(api.getCategories);
}
