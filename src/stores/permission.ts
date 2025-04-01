
import { RouteType } from '@/types/route';
import { create } from 'zustand';
import { constantRoutes, asyncRoutes } from "@/router"
export const hasPermission = (roles: string[], route: RouteType) => {
  const routeRoles = route?.meta?.allowedRoles
  return routeRoles ? roles.some((role) => routeRoles.includes(role)) : true
}
const filterAsyncRoutes = (routes: RouteType[], roles: string[]) => {
  const res: RouteType[] = []
  routes.forEach((route) => {
    const tempRoute = { ...route }
    if (hasPermission(roles, tempRoute)) {
      if (tempRoute.children) {
        tempRoute.children = filterAsyncRoutes(tempRoute.children, roles)
      }
      res.push(tempRoute)
    }
  })
  return res
}
interface PermissionStore{
  routes:RouteType[];
  dynamicRoutes:RouteType[];
  setRoutes:(roles: string[])=>void;
  addRoutes:(newRoutes: RouteType[], roles: string[])=>void;
}
export const usePermissionStore = create<PermissionStore>((set) => ({
  routes:[],
  dynamicRoutes:[],
  setRoutes:(roles: string[]) => {
    const accessedRoutes =filterAsyncRoutes(asyncRoutes, roles)
    
    set({
      routes: [...constantRoutes, ...accessedRoutes],
      dynamicRoutes: accessedRoutes,
    });
  },
  addRoutes:(newRoutes: RouteType[], roles: string[]) => {
    const mergedRoutes = [...asyncRoutes, ...newRoutes];
    const accessedRoutes = filterAsyncRoutes(mergedRoutes, roles);
    
    set({
      routes: [...constantRoutes, ...accessedRoutes],
      dynamicRoutes: accessedRoutes,
    });
  }
}));

