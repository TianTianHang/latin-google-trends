/**
 * 关键词数据
 */
export interface KeywordData {
  word: string;  // 关键词
  pronunciation: string; // 发音
  category_id: number;  // 分类ID
}

/**
 * 关键词响应
 */
export interface KeywordResponse {
  id: number;  // 关键词ID
  word: string;  // 关键词
  pronunciation: string; // 发音
  category_id: number;  // 分类ID
  created_at: string;  // 创建时间
  updated_at: string;  // 更新时间
  definitions: DefinitionResponse[];  // 定义列表
  category: CategoryResponse;  // 分类详情
}

/**
 * 定义数据
 */
export interface DefinitionData {
  word_id: number;  // 关键词ID
  definition: string;  // 定义内容
  is_primary: boolean;  // 是否为主定义
}

/**
 * 定义响应
 */
export interface DefinitionResponse {
  id: number;  // 定义ID
  word_id: number;  // 关键词ID
  definition: string;  // 定义内容
  is_primary: boolean;  // 是否为主定义
  created_at: string;  // 创建时间
  updated_at: string;  // 更新时间
}

/**
 * 分类数据
 */
export interface CategoryData {
  name: string;  // 分类名称
  description?: string;  // 分类描述
  parent_id?: number;  // 父分类ID
}

/**
 * 分类响应
 */
export interface CategoryResponse {
  id: number;  // 分类ID
  name: string;  // 分类名称
  description?: string;  // 分类描述
  parent_id?: number;  // 父分类ID
  created_at: string;  // 创建时间
  updated_at: string;  // 更新时间
  words: KeywordResponse[];  // 关键词列表
  children: CategoryResponse[];  // 子分类列表
}
