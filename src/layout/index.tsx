import React, { useState, Suspense, useMemo, useCallback, lazy } from "react";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import { MenuProps } from "antd";
import { Layout, Menu, theme, Spin } from "antd";
import HeaderComp from "@/layout/components/Header";
import NoAuthPage from "@/views/error/NoAuthPage";
import "antd/dist/reset.css";
import { useUserStore } from "@/stores/user";
import { RouteType } from "@/types/route";
import { usePermissionStore } from "@/stores/permission";
import { useTranslation } from "react-i18next";
import { saveService } from "@/components/Editor/services/saveService";
import { SaveList } from "@/types/layouts";
import { useRequest } from "ahooks";
import { cloneDeep } from "lodash";

const { Header, Content, Sider } = Layout;

const BasicLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { token } = useUserStore();
  const { routes:rawRoutes } = usePermissionStore();
  const [routes, setRoutes]=useState(rawRoutes);
  
  useRequest(() => saveService.getSaveList() as Promise<SaveList>, {
    cacheKey: "saveList", // 使用缓存键来启用缓存
    onSuccess: (saveList) => {
      const temp:RouteType[] = cloneDeep(rawRoutes);;
      const dashboardRoute = temp.find((r) => r.path === "/dashboard/:id");
      if (!dashboardRoute) return;
      const previewRoutes = Object.keys(saveList).map((key) => ({
        path: `/dashboard/${saveList[key].id}`,
        component: lazy(() => import("@/views/PreviewPage")),
        meta: {
          requiresAuth: false,
          breadcrumb: true,
          allowedRoles: ["user", "admin"],
          title: saveList[key].id,
        },
      }));

      if (dashboardRoute?.children) {
        // 使用 Set 去重
        const uniquePaths = new Set(
          dashboardRoute.children.map((child) => child.path)
        );
        previewRoutes.forEach((route) => {
          if (!uniquePaths.has(route.path)) {
            dashboardRoute?.children?.push(route);
            uniquePaths.add(route.path); // 添加到集合中以避免后续重复
          }
        });
      }else{
        dashboardRoute["children"]=previewRoutes
      }
      setRoutes([...temp]);
    },
  });
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { t, i18n } = useTranslation();
  const isAdmin = true;
  const itemLabel=useCallback((item:RouteType)=>{
    if(item.path!="/dashboard/:id"&&item.path?.startsWith("/dashboard/")){
      return item.meta?.title
    }else{
      return t(`route.${item.meta?.title}`)
    }
  },[t])
  const getItems = useCallback(
    (children: RouteType[]): MenuProps["items"] => {
      return children.map((item) => {
        return {
          key: item.index
            ? "/"
            : item.path?.startsWith("/")
            ? item.path
            : `/${item.path}`,
          icon: item.meta?.icon,
          label: itemLabel(item),
          children: item.children ? getItems(item.children) : null,
        };
      });
    },
    [itemLabel]
  );

  const menuItems: MenuProps["items"] = useMemo(() => {
    if (routes.length === 0) return [];
    return getItems(
      routes[0]?.children?.filter((item) => item.path !== "*") || []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getItems, routes, i18n.language]);

  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    navigate(key);
  };

  if (!token) {
    return <Navigate to="/login" replace={true} />;
  }

  const renderOpenKeys = () => {
    const arr = pathname.split("/").slice(0, -1);
    const result = arr.map(
      (_, index) => "/" + arr.slice(1, index + 1).join("/")
    );
    return result;
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        style={{
          overflow: "auto",
          height: "100vh",
        }}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div
          style={{
            height: 0,
            margin: 16,
          }}
        />
        <Menu
          theme="dark"
          defaultSelectedKeys={[pathname]}
          defaultOpenKeys={renderOpenKeys()}
          mode="inline"
          items={menuItems}
          onClick={onMenuClick}
        />
      </Sider>
      <Layout className="site-layout">
        <Header style={{ padding: "0 10px", background: colorBgContainer }}>
          <HeaderComp />
        </Header>
        {/* height：Header和Footer的默认高度是64 */}
        <Content
          style={{
            padding: 8,
            overflow: "auto",
            height: `calc(100vh - 128px)`,
          }}
          id="main-content"
          className="bg-white"
        >
          {isAdmin ? (
            <Suspense fallback={<Spin size="large" className="content_spin" />}>
              <Outlet />
            </Suspense>
          ) : (
            <NoAuthPage />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
