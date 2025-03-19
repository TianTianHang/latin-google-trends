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
  position: number;
}

export interface Schema {
  type: "text" | "number" | "color" | "select";
  label?: string;
  placeholder?: string;
  mode?:"multiple" | "tags" | undefined;
  options?: Array<{ label: string; value: unknown }>|(()=> Array<{ label: string; value: unknown }>);
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

export interface PredefinedLayout {
  name: string;
  layouts: (Omit<Layout, "i"> & {
    i?: Layout["i"];
  })[];
}
export interface Interlinked{
  props: string[];
  sourceId:string;
  targetId:string;
} 

export interface EditorState {
  predefinedLayouts: PredefinedLayout[];
  currentLayouts:(Omit<Layout, "i"> & {
    i?: Layout["i"];
  })[];
  registered: Map<string, RegisteredComponent<PropsType>>;
  components: ComponentData<PropsType>[];
  past: ComponentData<PropsType>[][];
  future: ComponentData<PropsType>[][];
  selectedId: string | null;
  interlinked:Interlinked[];
}

// 编辑器存储
export type EditorStore = EditorState & {
  registerComponent: <T extends PropsType>(
    component: RegisteredComponent<T>
  ) => void;
  addComponent: <T extends PropsType>(component: Omit<ComponentData<T>,"id">) => void;
  deleteComponent: (id: string) => void;
  updateProps: <T extends PropsType>(id: string, props: T) => void;
  updateLayout: (layout: Layout[]) => void;
  selectComponent: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  checkpoint: () => void;
  switchLayout: (layoutIndex: number) => void;
  // 维护组件联动关系的方法
  addInterlink: (sourceId: string, targetId: string, props: string[]) => void;
  removeInterlink: (sourceId: string, targetId: string) => void;
  updateInterlinkedProps: (sourceId: string, targetId: string, props: string[]) => void;
  getInterlinkedComponents: (sourceId: string) => Interlinked[];
};
