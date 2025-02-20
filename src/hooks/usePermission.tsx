import { useUserStore } from '@/stores/user';

const usePermission = () => {
  const roles = useUserStore((state) => state.roles);

  const hasPermission = (requiredRoles: string[]) => {
    return requiredRoles.some((role) => roles.includes(role));
  };

  return { hasPermission };
};

export default usePermission;
