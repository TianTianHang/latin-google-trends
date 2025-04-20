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
  // 将fetch函数转为字符串
  const sendData = {
    ...data,
    fetch: data.fetch ? data.fetch.toString() : undefined,
  };
  return http.post<DataSource>(api.create, sendData);
};

/**
 * 获取数据源列表
 */
export const listDataSources = async () => {
  const res = await http.get<DataSource[]>(api.list);
  // 将fetch字符串转为函数
  return res.map(ds => ({
    ...ds,
    fetch: typeof ds.fetch === 'string'
      ? new Function(`return (${ds.fetch})`)()
      : ds.fetch,
  }));
};

/**
 * 获取单个数据源
 */
export const getDataSource = async (id: string) => {
  const ds = await http.get<DataSource>(api.get.replace('{id}', id));
  return {
    ...ds,
    fetch: typeof ds.fetch === 'string'
      ? new Function(`return (${ds.fetch})`)()
      : ds.fetch,
  };
};

/**
 * 更新数据源
 */
export const updateDataSource = (id: string, data: Partial<DataSource>) => {
  // 更新时也要处理fetch
  const sendData = {
    ...data,
    fetch: data.fetch && typeof data.fetch === 'function'
      ? data.fetch.toString()
      : data.fetch,
  };
  return http.put<DataSource>(api.update.replace('{id}', id), sendData);
};

/**
 * 删除数据源
 */
export const deleteDataSource = (id: string) => {
  return http.delete(api.delete.replace('{id}', id));
};