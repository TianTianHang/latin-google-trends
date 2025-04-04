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
