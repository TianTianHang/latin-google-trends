

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface loginDataType {
  grant_type?: string;
  password?: string;
  username: string;
}

export interface registerDataType {
  password: string;
  username: string;
  roles?: RoleResponse[];
}

export interface userInfoType {
  id: number;
  username: string;
  roles: RoleResponse[];
}

export interface RoleResponse {
  id: number;
  name: string;
  description: string;
  is_default: boolean;
}

export interface RoleCreateRequest {
  name: string;
  description: string;
  is_default?: boolean;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  role?: UserRole;
}

export interface UserRoleAssignRequest {
  role_ids: number[];
}

export interface UserResponse {
  id: number;
  username: string;
  role: UserRole;
  roles: RoleResponse[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface TokenValidationResponse {
  id: number;
  username: string;
  role: string;
}