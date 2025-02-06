import { login, userInfo } from '@/api/user';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * 用户信息store类型
 */
export interface usersStoreType {
  token: string;
  roles: string[];
  username:string
  setToken(value: string): void;
  getInfo:()=>Promise<void>
  resetToken:()=>void
  login: (values: { username: string; password: string }) => Promise<void>;
}

export const useUserStore = create<usersStoreType>()(
  persist(
    (set) => ({
      token: '', // 登录token
      roles: [], // 权限角色
      username:'',     
      // 设置token
      setToken: (value: string) => set({ token: value }),
      /** 获取用户详情 */
      getInfo:async () => {
        const data= await userInfo()
        set({username:data.username})
        set({roles: data.role ? [data.role] : ['DEFAULTROLE']})
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
      }
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