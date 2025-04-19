import { useUserStore } from "@/stores/user"

interface PermissionCompProps {
    children: React.ReactNode;
    requireRoles: string[];
}

const PermissionComp: React.FC<PermissionCompProps> = ({children, requireRoles}) => {
    const {roles} = useUserStore()
     
    // 检查用户是否具有所需的角色权限
    const hasPermission = requireRoles.some(role => roles.includes(role))
    
    return hasPermission ? children : null
}
export default PermissionComp