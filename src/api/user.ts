import {
  loginDataType,
  registerDataType,
  userInfoType,
  RoleCreateRequest,
  RoleResponse,
  UserRoleAssignRequest,
  UserResponse
} from '@/types/user';
import http from '@/utils/request';
import qs from 'qs';
// api接口 - 此处用了统一保存接口url路径
const api = {
  login: '/user_management/token', // 用户登录接口
  register: '/user_management/register', // 用户注册接口
  userInfo: '/user_management/users/me', // 用户信息
  createRole: '/user_management/roles/create', // 创建角色
  getAllRoles: '/user_management/roles/list', // 获取所有角色
  assignRoles: '/user_management/users/{userId}/roles/assign', // 分配角色
  getUserRoles: '/user_management/users/{userId}/roles/list', // 获取用户角色
  getAllUsers: '/user_management/users/list' //获取所有用户
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
 * @description: 创建角色
 * @param {RoleCreateRequest} data 角色信息
 * @return 创建的角色信息
 */
export function createRole(data: RoleCreateRequest) {
  return http.post<RoleResponse>(api.createRole, data);
}

/**
 * @description: 获取所有角色
 * @return 角色列表
 */
export function getAllRoles() {
  return http.get<RoleResponse[]>(api.getAllRoles);
}

/**
 * @description: 为用户分配角色
 * @param {number} userId 用户ID
 * @param {UserRoleAssignRequest} data 角色ID列表
 * @return 更新后的用户信息
 */
export function assignRoles(userId: number, data: UserRoleAssignRequest) {
  return http.post<UserResponse>(
    api.assignRoles.replace('{userId}', userId.toString()),
    data
  );
}

/**
 * @description: 获取用户角色列表
 * @param {number} userId 用户ID
 * @return 用户角色列表
 */
export function getUserRoles(userId: number) {
  return http.get<RoleResponse[]>(
    api.getUserRoles.replace('{userId}', userId.toString())
  );
}

/**
 * @description: 用户注册
 * @param {registerDataType} data 注册参数
 * @return 注册结果
 */
export function register(data: registerDataType) {
  return http.post<UserResponse>(api.register, data);
}

/**
 * @description: 获取用户信息
 * @return 用户信息
 */
export  function userInfo() {
  return http.get<userInfoType>(api.userInfo);
}
/**
 * @description: 获取所有用户信息
 * @return 所有用户信息
 */
export function getAllUsers(){
  return http.get<userInfoType[]>(api.getAllUsers);
}