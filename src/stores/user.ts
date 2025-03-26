import { changePassword, login, register, userInfo } from '@/api/user';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * 用户信息store类型
 */
export interface usersStoreType {
  token: string;
  roles: string[];
  username:string
  id: number;
  setToken(value: string): void;
  getInfo:()=>Promise<void>
  resetToken:()=>void
  login: (values: { username: string; password: string }) => Promise<void>;
  register: (values: { username: string; password: string }) => Promise<void>;
  changePassword: (values: { oldPassword: string; newPassword: string }) => Promise<void>;
}

export const useUserStore = create<usersStoreType>()(
  persist(
    (set) => ({
      token: '', // 登录token
      roles: [], // 权限角色
      username:'',  
      id: 0, // 用户ID   
      // 设置token
      setToken: (value: string) => set({ token: value }),
      /** 获取用户详情 */
      getInfo:async () => {
        const data= await userInfo()
        set({ 
          username: data.username, 
          roles: data.roles.map(role=>role.name) || ['DEFAULTROLE'],
          id: data.id 
        })
      },
      /** 重置 Token */
      resetToken:() => {
        localStorage.removeItem('userStorage');
        set({roles:[],token:''})
      },
      /** 登录 */
      login: async (values: { username: string; password: string }) => {
        // 这里调用登录API
        const { access_token } = await login(values);
        set({ token: access_token });
        await useUserStore.getState().getInfo();
      },
      register: async (values: { username: string; password: string }) => {
        await register(values);
      },
      /** 修改密码 */
      changePassword: async (values: { oldPassword: string; newPassword: string }) => {
        await changePassword({
          old_password: values.oldPassword,
          new_password: values.newPassword
        });
      },
    }),
   
    {
      // 进行持久化存储
      name: 'userStorage', // 本地存储的名称
      storage: createJSONStorage(() => localStorage), // 保存的位置
    }
  )
);
export const getToken=()=>{
  return useUserStore.getState().token;
}
export const getRoles=()=>{
  return useUserStore.getState().roles;
}
