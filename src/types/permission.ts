

export interface PermissionCreate {
  service_name: string;
  path: string;
  required_permission: string;
}

export interface PermissionUpdate {
  path:string;
  required_permission: string;
}

export interface VerifyPermission {
  service_name: string;
  path: string;
}

export interface RoutePermission {
  service_name:string;
  path: string;
  required_permission: string[];
}

export interface ServicePermissionsResponse {
  service_name: string;
  permissions: RoutePermission[];
}