import { create } from "zustand";
import { PropsType } from "./componentsStore";
import { ComponentType } from "react";


export interface Schema {
  type: "text" | "number" | "color" | "select" | "boolean" | "date" | "range" | "json" | "code";
  label?: string;
  placeholder?: string;
  mode?:"multiple" | "tags" | undefined;
  options?: Array<{ label: string; value: string | number | null }>|(()=> Array<{ label: string; value: string | number | null }>)|(()=>Promise<Array<{ label: string; value: string | number | null }>>)
  min?: number; // for range/number
  max?: number; // for range/number
  step?: number; // for range/number
  format?: string; // for date
  language?: string; // for code editor
  height?: number; // for code/json editor
}

// 扩展组件元数据类型
export interface ComponentMeta<T extends PropsType> {
  type: string;
  name: string;
  icon?: React.ReactNode;
  defaultProps?: T;
  propSchema?: {
    [key: string]: Schema
  };
}
// 注册组件类型
export interface RegisteredComponent<T extends PropsType> {
  meta: ComponentMeta<T>;
  component: ComponentType<T>;
}
interface RegisteredComponentsState {
  registered: Map<string, RegisteredComponent<PropsType>>;
  registerComponent: (component: RegisteredComponent<PropsType>) => void;
}

export const useRegisteredComponentsStore = create<RegisteredComponentsState>((set) => ({
  registered: new Map<string, RegisteredComponent<PropsType>>(),
  registerComponent: (component) => {
    set((state) => {
      state.registered.set(component.meta.type, component);
      return state;
    });
  },
}));
