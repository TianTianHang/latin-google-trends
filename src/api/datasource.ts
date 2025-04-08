import { DataSource } from '@/components/Editor/stores/dataProviderStore';
import http from '@/utils/request';

const api = {
  create: '/query/datasources/create',
  list: '/query/datasources/list',
  get: '/query/datasources/{id}',
  update: '/query/datasources/{id}/update',
  delete: '/query/datasources/{id}/delete'
};

/**
 * 创建数据源
 */
export const createDataSource = (data: DataSource) => {
  return http.post<DataSource>(api.create, data);
};

/**
 * 获取数据源列表
 */
export const listDataSources = () => {
  return http.get<DataSource[]>(api.list);
};

/**
 * 获取单个数据源
 */
export const getDataSource = (id: string) => {
  return http.get<DataSource>(api.get.replace('{id}', id));
};

/**
 * 更新数据源
 */
export const updateDataSource = (id: string, data: Partial<DataSource>) => {
  return http.put<DataSource>(api.update.replace('{id}', id), data);
};

/**
 * 删除数据源
 */
export const deleteDataSource = (id: string) => {
  return http.delete(api.delete.replace('{id}', id));
};