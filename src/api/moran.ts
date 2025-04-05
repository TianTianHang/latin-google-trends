import { GlobalMoranParams, GlobalMoranResult, LocalMoranParams, LocalMoranResult } from '@/types/moran';
import http from '@/utils/request';
const api = {
  local: '/query/moran/local', // 局部莫兰
  global: '/query/moran/global', // 全局莫兰
};
/**
 * 计算全局莫兰指数
 * @param params 请求参数
 * @returns 全局莫兰指数计算结果
 */
export const calculateGlobalMoran = (params: GlobalMoranParams) => {
  return http.post<GlobalMoranResult>(api.global, params);
};

/**
 * 计算局部莫兰指数
 * @param params 请求参数
 * @returns 局部莫兰指数计算结果数组
 */
export const calculateLocalMoran = (params: LocalMoranParams) => {
  return http.post<LocalMoranResult>(api.local, params);
};
