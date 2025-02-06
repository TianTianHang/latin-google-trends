/* eslint-disable react-refresh/only-export-components */
import { RouteType } from "@/types/route";
import {
  forwardRef,
  lazy,
  Suspense,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useRoutes } from "react-router-dom";
/** 常驻路由 */
export const constantRoutes: RouteType[] = [
  {
    path: "/login",
    component: lazy(() => import("@/views/LoginPage")),
  },
  {
    path: "/",
    component: lazy(() => import("@/layout")),
    meta: {
      requiresAuth: false,
      breadcrumb: false,
    },
    children: [
      {
        path: "/home",
        component: lazy(() => import("@/views/HomePage")),
        name: "home",
        meta: {
          title: "主页",
          requiresAuth: false,
        },
      },
    ],
  },
  {
    path: "*",
    component: lazy(() => import("@/views/error/NotFound")),
  },
];
export const asyncRoutes: RouteType[] = [
  {
    path: "/tasks",
    component: lazy(() => import("@/views/TaskManagementPage.tsx")),
    meta: {
      requiresAuth: true,
      breadcrumb: true,
      allowedRoles: ["admin"],
      title:"任务管理"
    },
  },
];
// 路由处理方式
const generateRouter = (routers: RouteType[]) => {
  return routers.map((item: RouteType) => {
    if (item.children) {
      item.children = generateRouter(item.children);
    }
    item.element = (
      <Suspense fallback={""}>
        {/* 把懒加载的异步路由变成组件装载进去 */}
        {item.component && <item.component />}
      </Suspense>
    );
    return item;
  });
};
export const AppRouter = forwardRef((props, ref) => {
  // 合并静态路由和动态路由
  const [dynamicRoutes, setDynamicRoutes] = useState<RouteType[]>([]);

  // 修改合并函数
  const allRoutes = useMemo(() => {
    // 找到常驻路由中路径为"/"的路由
    const rootRoute = constantRoutes.find((route) => route.path === "/");
    if (rootRoute && rootRoute.children) {
      // 筛选出尚未存在的动态路由
      const existingPaths = new Set(rootRoute.children.map(child => child.path));
      const newRoutes = dynamicRoutes.filter(route => !existingPaths.has(route.path));
  
      // 将筛选后的动态路由合并到"/"的children中
      rootRoute.children.push(...newRoutes);
    }

    return constantRoutes;
  }, [dynamicRoutes]);

  // 暴露给外部使用的添加路由方法
  const addRoutes = (newRoutes: RouteType[]) => {
    setDynamicRoutes((prev) => [...prev, ...newRoutes]);
  };
  // 通过 ref 暴露方法
  useImperativeHandle(ref, () => ({
    addRoutes,
  }));

  return useRoutes(generateRouter(allRoutes));
});

// 类型提示（如果使用 TypeScript）
AppRouter.displayName = "AppRouter";
