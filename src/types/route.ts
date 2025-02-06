import { LazyExoticComponent, ReactNode } from "react";
import { RouteObject } from "react-router-dom";
export interface Meta{
    hidden?:boolean
    title?:string
    icon?:ReactNode
    requiresAuth:boolean,
    allowedRoles?:string[],
    permissionKey?:string,
    breadcrumb?: boolean; // 可选：单独控制是否显示在面包屑
}
export type RouteType = RouteObject & {
    name?:string
    children?: RouteType[]
    meta?:Meta
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component?:LazyExoticComponent<any>
}