import { Layout } from "react-grid-layout";
import React, { ComponentType } from "react";

// 通用属性类型
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PropsType = Record<string, any>;

// 组件数据接口
export interface ComponentData<T extends PropsType> {
  id: string;
  type: string;
  props: T;
  layout: Layout;
}
export interface AddComponentData<T extends PropsType> {
  type: string;
  props: T;
  layout: Omit<Layout, "i">;
}
export interface Schema {
  type: "text" | "number" | "color" | "select";
  label?: string;
  placeholder?: string;
  mode?:"multiple" | "tags" | undefined;
  options?: Array<{ label: string; value: unknown }>;
}

// 扩展组件元数据类型
export interface ComponentMeta<T extends PropsType> {
  type: string;
  name: string;
  icon?: React.ReactNode;
  defaultProps?: T;
  defaultLayout?: Omit<Layout, "i">;
  propSchema?: {
    [key: string]: Schema
  };
}

// 注册组件类型
export interface RegisteredComponent<T extends PropsType> {
  meta: ComponentMeta<T>;
  component: ComponentType<T>;
}

export interface EditorState {
  registered: Map<string, RegisteredComponent<PropsType>>;
  components: ComponentData<PropsType>[];
  past: ComponentData<PropsType>[][];
  future: ComponentData<PropsType>[][];
  selectedId: string | null;
}

// 编辑器存储
export type EditorStore = EditorState & {
  registerComponent: <T extends PropsType>(
    component: RegisteredComponent<T>
  ) => void;
  addComponent: <T extends PropsType>(component: AddComponentData<T>) => void;
  deleteComponent: (id: string) => void;
  updateProps: <T extends PropsType>(id: string, props: T) => void;
  updateLayout: (id: string, layout: Layout) => void;
  selectComponent: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  checkpoint: () => void;
};
