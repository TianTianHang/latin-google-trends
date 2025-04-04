import { create } from "zustand";
import { PropsType } from "./componentsStore";
import { ComponentType, JSXElementConstructor, ReactElement } from "react";

export type CustomTagProps = {
    label: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    disabled: boolean;
    onClose: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    closable: boolean;
    isMaxTag: boolean;
};
export interface Schema {
  type: "text" | "number" | "color" | "select" | "boolean" | "date" | "range" | "json" | "code";
  label?: string;
  placeholder?: string;
  mode?:"multiple" | "tags" | undefined;
  options?: Array<{ label: string; value: string | number | null }>|(()=> Array<{ label: string; value: string | number | null }>)|(()=>Promise<Array<{ label: string; value: string | number | null }>>)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tagRender?: ((props: CustomTagProps) => ReactElement<any, string | JSXElementConstructor<any>>);
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
  registerComponent: <T extends PropsType>(component: RegisteredComponent<T>) => void;
}

export const useRegisteredComponentsStore = create<RegisteredComponentsState>((set) => ({
  registered: new Map<string, RegisteredComponent<PropsType>>(),
  registerComponent: (component) => {
    set((state) => {
      state.registered.set(component.meta.type, component as  RegisteredComponent<PropsType>);
      return state;
    });
  },
}));
