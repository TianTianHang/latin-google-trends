import { loginDataType, registerDataType, userInfoType } from '@/types/user';
import http from '@/utils/request';
import qs from 'qs';
// api接口 - 此处用了统一保存接口url路径
const api = {
  login: '/user_management/token', // 用户登录接口
  register: '/user_management/register', // 用户注册接口
  userInfo: '/user_management/users/me', // 用户信息
};

/**
 * @description: 用户登录
 * @param {loginDataType} data 登录参数
 * @return 返回请求登录接口的结果
 */
export function login(data: loginDataType) {
  data.grant_type="password"
  return http.post<{ access_token: string, token_type:string }>(api.login, qs.stringify(data),{
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // 设置 Content-Type
    },
  });
}

/**
 * @description: 用户注册
 * @param {registerDataType} data 注册参数
 * @return 注册结果
 */
export function register(data: registerDataType) {
  return http.post<{id:number,username:string,role:string}>(api.register, data);
}

/**
 * @description: 获取用户信息
 * @return 用户信息
 */
export  function userInfo() {
  return http.get<userInfoType>(api.userInfo);
}