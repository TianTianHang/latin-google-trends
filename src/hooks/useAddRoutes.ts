import { usePermissionStore } from "@/stores/permission";
import { RouteType } from "@/types/route";

export const useAddRoutes = () => {
  const { addRoutes } = usePermissionStore();
  
  return (newRoutes: RouteType[], roles: string[]) => {
    addRoutes(newRoutes, roles);
  };
};