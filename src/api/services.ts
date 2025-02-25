import { ServiceInstance } from "@/types/service";
import http from "@/utils/request";

// API 接口路径
const api = {
  services: "/_internal/services", // 获取所有服务实例的接口
};

/**
 * @description: 根据服务名获取所有服务实例
 * @return 返回服务实例列表
 */
export function getServices(service_name:string) {
  return http.get<{
    services:ServiceInstance[]
}>(api.services,{service_name:service_name});
}
