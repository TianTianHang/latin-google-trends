import { create } from "zustand";
import { useLayoutsStore } from "./layoutsStore";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PropsType = Record<string, any>;

// 组件数据接口
export interface ComponentData<T extends PropsType> {
  id: string;
  type: string;
  props: T;
  position: number;
}
interface ComponentsState {
  components: ComponentData<PropsType>[];
  addComponent: (component: Omit<ComponentData<PropsType>, "id">) => void;
  deleteComponent: (id: string) => void;
  updateProps: (id: string, props: Partial<PropsType>) => void;
  reset: () => void;
}

export const useComponentsStore = create<ComponentsState>((set) => {
  return {
    components: [],
    addComponent: (component) => {
      const currentLayouts = useLayoutsStore.getState().currentLayouts;
      if(currentLayouts.length == component.position){
        // 新增layout多一项
        const id = crypto.randomUUID();
        const newComponent = {
          ...component,
          id: id,
        } as ComponentData<PropsType>;
        set((state) => ({
          components: [...state.components, newComponent],
        }));
        // 计算新组件的位置，避免重叠
        let newY = 0;
        let foundPosition = false;
        while (!foundPosition) {
          // 检查当前y位置是否可用
          const positionOccupied = currentLayouts.some(layout =>
            layout.y <= newY && newY < layout.y + layout.h &&
            layout.x <= 0 && 0 < layout.x + layout.w
          );
          
          if (!positionOccupied) {
            foundPosition = true;
          } else {
            newY++;
          }
        }

        const newLayout = {
          i: id,
          x: 0,
          y: newY,
          w: 2,
          h: 1,
          minH: 1,
          minW: 1,
          moved: true
        }
        const newCurrentLayouts = [...currentLayouts,newLayout];
        useLayoutsStore.setState({
          currentLayouts: newCurrentLayouts,
        });
        return;
      }
      if (currentLayouts[component.position].i != "") {
        // 替换路线, id 不变
        const id = currentLayouts[component.position].i;
        set((state) => ({
          components: state.components.map((comp) =>
            comp.id === id
              ? {
                  ...component,
                  id: id as string,
                }
              : comp
          ),
        }));
      } else {
        // 新增路线
        const id = crypto.randomUUID();
        const newComponent = {
          ...component,
          id: id,
        } as ComponentData<PropsType>;
        set((state) => ({
          components: [...state.components, newComponent],
        }));
        const newCurrentLayouts = [...currentLayouts];
        newCurrentLayouts[component.position] = {
          ...newCurrentLayouts[component.position],
          i: id, // 增加属性 i
        };
        useLayoutsStore.setState({
          currentLayouts: newCurrentLayouts,
        });
      }
    },
    deleteComponent: (id: string) => {
      set((state) => ({
        components: state.components.filter((comp) => comp.id !== id),
      }));
      const currentLayouts = useLayoutsStore.getState().currentLayouts;
      const newCurrentLayouts = [...currentLayouts];
      const index = newCurrentLayouts.findIndex((layout) => layout.i == id);
      newCurrentLayouts[index] = {
        ...newCurrentLayouts[index],
        i: "",
      };
      useLayoutsStore.setState({
        currentLayouts: newCurrentLayouts,
      });
    },
    updateProps: (id: string, props: Partial<PropsType>) => {
      set((state) => ({
        components: state.components.map((comp) =>
          comp.id === id
            ? {
                ...comp,
                props: { ...(comp.props as Record<string, unknown>), ...props },
              }
            : comp
        ),
      }));
    },
    reset: () => {
      set({
        components: [],
      });
    },
  };
});
