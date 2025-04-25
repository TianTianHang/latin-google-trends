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
export const createDataSource = async (data: DataSource) => {  // 添加async 
  let processedFile= null; 
  if (data.type === 'csv' || data.type === 'excel') {
    //@ts-ignore
    const file = data.config.file.file  as File;
    processedFile = {
        name: file.name,
        type: file.type,
        data: Array.from(new Uint8Array(await file.arrayBuffer())) // 修复Buffer使用
    };
  }

  const sendData = {
    ...data,
    config: {...data.config,file:JSON.stringify(processedFile)},
    fetch: data.fetch?.toString()
  };
  return http.post<DataSource>(api.create, sendData);
};

// 修改获取方法
export const listDataSources = async () => {
  const res = await http.get<DataSource[]>(api.list);
  return res.map(ds => {
    const config = ds.config;
    
    if (ds.type === 'csv' || ds.type === 'excel') {
      const file =JSON.parse(config.file as string);
      console.log(file);
      config.file = new File(
        [new Uint8Array(file.data)],
        file.name,
        { type: file.type }
      );
    }

    return {
      ...ds,
      config,
      fetch: typeof ds.fetch === 'string' 
        ? new Function(`return (${ds.fetch})`)()
        : ds.fetch,
    };
  });
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