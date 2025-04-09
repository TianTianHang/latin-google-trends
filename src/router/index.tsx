/* eslint-disable react-refresh/only-export-components */
import { usePermissionStore } from "@/stores/permission";
import { RouteType } from "@/types/route";
import { lazy, Suspense, useMemo } from "react";
import { Outlet, useRoutes } from "react-router-dom";
/** 常驻路由 */
export const constantRoutes: RouteType[] = [
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
          title: "home",
          requiresAuth: false,
        },
      },
      {
        path: "*",
        component: lazy(() => import("@/views/error/NotFound")),
      },
    ],
  },
  {
    path: "/login",
    component: lazy(() => import("@/views/LoginPage")),
  },
];
export const asyncRoutes: RouteType[] = [
  {
    path: "/keywords",
    element: <Outlet/>,
    meta: {
      requiresAuth: true,
      breadcrumb: true,
      allowedRoles: ["admin"],
      title: "keywords",
    },
    children:[
      {
        path: "/keywords/list",
        component: lazy(() => import("@/views/KeywordsView")),
        meta: {
          requiresAuth: true,
          breadcrumb: true,
          allowedRoles: ["admin"],
          title: "keywords.list",
        }
      },
      {
        path: "/keywords/details",
        component: lazy(() => import("@/views/KeywordsView/KeywordDetailPage")),
        meta: {
          requiresAuth: true,
          breadcrumb: true,
          allowedRoles: ["admin","user"],
          title: "keywords.details",
        }
      },
    ]
  },
  {
    path: "/tasks",
    component: lazy(() => import("@/views/TaskManagementPage")),
    meta: {
      requiresAuth: true,
      breadcrumb: true,
      allowedRoles: ["admin"],
      title: "tasks",
    },
  },
  {
    path: "/dashboard/:id",
    component: lazy(() => import("@/views/PreviewPage")),
    meta: {
      requiresAuth: true,
      breadcrumb: true,
      allowedRoles: ["user", "admin"],
      title: "dashboard",
    }
  },
  {
    path: "/data",
    element: <Outlet />,
    meta: {
      requiresAuth: true,
      breadcrumb: true,
      allowedRoles: ["user", "admin"],
      title: "data",
    },
    children: [
      {
        path: "/data/subject",
        component: lazy(() => import("@/views/SubjectView")),
        meta: {
          requiresAuth: true,
          breadcrumb: true,
          allowedRoles: ["user", "admin"],
          title: "data.subject",
        },
      },
      {
        path: "/data/data-source",
        component: lazy(() => import("@/views/DataSourceManagementPage")),
        meta: {
          requiresAuth: true,
          breadcrumb: true,
          allowedRoles: ["user", "admin"],
          title: "data.data-source",
        },
      },
    ],
  },
  {
    path: "/editor",
    component: lazy(() => import("@/views/VisualEditorView")),
    meta: {
      requiresAuth: true,
      breadcrumb: true,
      allowedRoles: ["user", "admin"],
      title: "editor",
    },
  },
  {
    path: "/permission",
    element: <Outlet />,
    meta: {
      requiresAuth: true,
      breadcrumb: true,
      allowedRoles: ["admin"],
      title: "permission",
    },
    children: [
      {
        path: "/permission/endpoint",
        component: lazy(() => import("@/views/PermissionManagementPage")),
        meta: {
          requiresAuth: true,
          breadcrumb: true,
          allowedRoles: ["admin"],
          title: "permission.endpoint",
        },
      },
      {
        path: "/permission/user-role",
        component: lazy(() => import("@/views/UserRoleManagementPage")),
        meta: {
          requiresAuth: true,
          breadcrumb: true,
          allowedRoles: ["admin"],
          title: "permission.user-role",
        },
      },
    ],
  },
];
// 路由处理方式
const generateRouter = (routers: RouteType[]) => {
  return routers.map((item: RouteType) => {
    if (item.children) {
      item.children = generateRouter(item.children);
    }
    item.element = item.element || (
      <Suspense fallback={""}>
        {/* 把懒加载的异步路由变成组件装载进去 */}
        {item.component && <item.component />}
      </Suspense>
    );
    return item;
  });
};
export const AppRouter = () => {
  // 合并静态路由和动态路由
  const { dynamicRoutes } = usePermissionStore();
  
  

  // 修改合并函数
  const allRoutes = useMemo(() => {
    // 找到常驻路由中路径为"/"的路由
    const rootRoute = constantRoutes.find((route) => route.path === "/");
    if (rootRoute && rootRoute.children) {
      // 筛选出尚未存在的动态路由
      const existingPaths = new Set(
        rootRoute.children.map((child) => child.path)
      );
      const newRoutes = dynamicRoutes.filter(
        (route) => !existingPaths.has(route.path)
      );

      // 将筛选后的动态路由合并到"/"的children中
      rootRoute.children.push(...newRoutes);
    }

    return constantRoutes;
  }, [dynamicRoutes]);
 
  return useRoutes(generateRouter(allRoutes));
};

// 类型提示（如果使用 TypeScript）
AppRouter.displayName = "AppRouter";
