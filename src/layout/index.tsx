import { Breadcrumb, Layout, Menu, MenuProps, theme } from 'antd';
import { Content, Footer } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { useState, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { usePermissionStore } from '@/stores/permission';
import { RouteType } from '@/types/route';
import { ItemType } from 'antd/es/menu/interface';

type MenuItem = Required<MenuProps>['items'][number];

// 递归生成菜单项
const generateMenuItems = (routes: RouteType[]): ItemType[] => {
  // 已生成的菜单路径集合，用于去重
  const existingPaths = new Set<string>();

  const generate = (routes: RouteType[]): ItemType[] => {
    return routes
      .filter(route => !route.meta?.hidden) // 过滤隐藏菜单
      .map(route => {
        // 如果路径已经存在，则跳过该路由
        if (existingPaths.has(route.path!)) {
          return null;
        }

        // 将当前路径添加到已生成的路径集合中
        existingPaths.add(route.path!);

        const menuItem: MenuItem = {
          key: route.path!,
          icon: route.meta?.icon,
          label: route.meta?.title || route.path,
          children: route.children ? generate(route.children) : undefined
        };

        return menuItem;
      })
      .filter(item => item !== null); // 过滤掉被跳过的路由
  };

  return generate(routes);
};


// 根据路径获取面包屑数据
const getBreadcrumbItems = (
  routes: RouteType[],
  currentPath: string
): { title: string }[] => {
  const items: { title: string }[] = [];
  let found = false;

  const traverse = (routes: RouteType[], parentPath = '') => {
    for (const route of routes) {
      const fullPath = `${parentPath}/${route.path}`.replace(/\/+/g, '/');
      
      if (fullPath === currentPath) {
        if (route.meta?.breadcrumb !== false) { // 支持单独控制
          items.push({ title: route.meta?.title || route.path! });
        }
        found = true;
        return true;
      }

      if (route.children) {
        if (traverse(route.children, fullPath)) {
          if (route.meta?.breadcrumb !== false && !route.meta?.hidden) {
            items.unshift({ title: route.meta?.title || route.path! });
          }
          return true;
        }
      }
    }
    return false;
  };

  traverse(routes);
  
  return found ? items : [{ title: '当前位置' }];
};

export default function BasicLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const routes  = usePermissionStore(state => state.routes);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  // 生成动态菜单项
  const menuItems = useMemo(() => {
    // 过滤根路由（布局路由不需要显示）
    const mainRoutes = routes.find(r => r.path === '/')?.children || [];
    return generateMenuItems(mainRoutes);
  }, [routes]);
  // 菜单点击处理
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  // 生成面包屑数据
  const breadcrumbItems = useMemo(() => {
    return getBreadcrumbItems(routes, location.pathname);
    // eslint-disable-next-line
  }, [routes, location.pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          defaultSelectedKeys={[location.pathname]}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
          {breadcrumbItems.map((item, index) => (
            <Breadcrumb.Item key={index}>{item.title}</Breadcrumb.Item>
          ))}
          </Breadcrumb>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet/>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
}