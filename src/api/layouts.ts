import { LayoutResponse, SaveData } from "@/types/layouts";
import http from "@/utils/request";

const api = {
    save: '/query/layouts/save',  // 保存接口
    list: '/query/layouts/list',  // 获取所有存档接口
    delete: '/query/layouts/delete'  // 删除存档接口
  };


export const saveLayout=(data:SaveData)=>{
    return http.post<LayoutResponse>(api.save,data)
}
export const listLayouts=()=>{
    return http.get<LayoutResponse[]>(api.list)
}
export const deleteLayout=(id:string)=>{
    return http.delete(api.delete,id)
}