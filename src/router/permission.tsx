import { MutableRefObject, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getRoles, getToken } from '@/stores/user' // 直接导入工具函数
import {useUserStore} from '@/stores/user'
import {usePermissionStore} from '@/stores/permission'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { message } from 'antd'
import { RouteType } from '@/types/route'

NProgress.configure({ showSpinner: false })

export default function RouterBeforeEach({appRouterRef}:
  {appRouterRef:MutableRefObject<{ addRoutes: (routes: RouteType[]) => void } | undefined>}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { getInfo, resetToken } = useUserStore()
  const { setRoutes} = usePermissionStore()
  const [auth,setAuth] = useState(false)
  const init = async ():Promise<boolean> => {
    NProgress.start()
    if(getToken()){
        if(location.pathname=="/login"||location.pathname=="/"){
          // 如果已经登录，并准备进入 Login 页面，则重定向到主页
          navigate("/home")
          NProgress.done()
          return true
        }else{
          // 检查用户是否已获得其权限角色
          if (getRoles().length === 0) {
            try {
              await getInfo()
            } catch (err: unknown) {
              resetToken()
              const error = err instanceof Error ? err.message : '路由守卫过程发生错误'
              message.error(error);
              console.error(error)
              navigate('/login', { replace: true })
              NProgress.done()
              return false
            }
          }else{
              const roles = getRoles()
              setRoutes(roles)

              // 将'有访问权限的动态路由' 添加到 Router 中
              // 获取动态路由并添加到 AppRouter
              const { dynamicRoutes } = usePermissionStore.getState();
              appRouterRef?.current?.addRoutes(dynamicRoutes);
              // 确保添加路由已完成
              // 设置 replace: true, 因此导航将不会留下历史记录
              navigate(location.pathname, {replace: true })
              return true
            return true
          }
    }
  }else {
      navigate("/login")
      NProgress.done()
      return true
    }
    return false
  }
  useEffect(() => {
    init().then((res)=>setAuth(res))
    // 确保依赖项只包含必要的变化项
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  useEffect(() => {
    NProgress.done()
  })

  return auth?<Outlet/>:<></>
}