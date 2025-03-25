import { 
  PermissionCreate, 
  PermissionUpdate, 
  RoutePermission,  
} from '@/types/permission';
import http from '@/utils/request';

const api = {
  list: '/permission/permissions/list',
  create: '/permission/permissions/create',
  update: '/permission/permissions/{service_name}/update',
  delete: '/permission/permissions/{service_name}/delete'
};

export async function listPermissions() {
  return http.get<RoutePermission[]>(api.list);
}

export async function createPermission(data: PermissionCreate) {
  return http.post<{ message: string }>(api.create, data);
}

export async function updatePermission(
  service_name: string,
  data: PermissionUpdate
) {
  const url = api.update
    .replace('{service_name}', service_name)
  return http.put<{ message: string }>(url, data);
}

export async function deletePermission(service_name: string, path: string) {
  const url = api.delete
    .replace('{service_name}', service_name)
  return http.delete<{ message: string }>(url,{path});
}