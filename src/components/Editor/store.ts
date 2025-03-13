import { create } from "zustand";
import {
  ComponentData,
  EditorStore,
  PropsType,
  RegisteredComponent,
} from "./types";
import { Layout } from "react-grid-layout";

export const useEditorStore = create<EditorStore>((set, get) => ({
  registered: new Map<string, RegisteredComponent<PropsType>>(),
  components: [],
  past: [],
  future: [],
  selectedId: null,

  registerComponent: (component) => {
    set((state) => {
      state.registered.set(
        component.meta.type,
        component as RegisteredComponent<PropsType>
      );
      return state;
    });
  },
  addComponent: (component) => {
    const id=crypto.randomUUID();
    (component.layout as Layout).i=id;
    const newComponent = {
      ...component,
      id: id,
    } as ComponentData<PropsType>;
    set((state) => ({
      components: [...state.components, newComponent],
    }));
  },
  deleteComponent: (id: string) => {
    set((state) => ({
      components: state.components.filter((comp) => comp.id != id),
    }));
  },
  updateProps: (id, props) => {
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
  updateLayout: (id, layout) => {
    set((state) => ({
      components: state.components.map((comp) =>
        comp.id === id
          ? { ...comp, layout: { ...comp.layout, ...layout } }
          : comp
      ),
    }));
  },
  selectComponent: (id) => {
    set({ selectedId: id });
  },

  undo: () => {
    const { past, components } = get();
    if (past.length > 0) {
      const previous = past[past.length - 1];
      set({
        components: previous,
        past: past.slice(0, -1),
        future: [components, ...get().future],
      });
    }
  },

  redo: () => {
    const { future, components } = get();
    if (future.length > 0) {
      const next = future[0];
      set({
        components: next,
        past: [...get().past, components],
        future: future.slice(1),
      });
    }
  },

  checkpoint: () => {
    const { components, past } = get();
    set({
      past: [...past, components],
      future: [],
    });
  },
  
}));
