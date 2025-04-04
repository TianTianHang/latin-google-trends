import { create } from "zustand";
import { useComponentsStore } from "./componentsStore";

export interface Interlinked {
  props: string[];
  sourceId: string;
  targetId: string;
}

interface InterlinkedState {
  interlinked: Interlinked[];
  addInterlink: (sourceId: string, targetId: string, props: string[]) => void;
  removeInterlink: (sourceId: string, targetId: string) => void;
  updateInterlinkedProps: (
    sourceId: string,
    targetId: string,
    props: string[]
  ) => void;
  getInterlinkedComponents: (sourceId: string) => Interlinked[];
  syncProps: (sourceId: string, propName: string, value: unknown) => void;
  reset: () => void;
}

export const useInterlinkedStore = create<InterlinkedState>((set, get) => ({
  interlinked: [],
  addInterlink: (sourceId: string, targetId: string, props: string[]) => {
    if (
      get()
        .getInterlinkedComponents(sourceId)
        .some((link) => link.targetId === targetId)
    ) {
      get().updateInterlinkedProps(sourceId, targetId, props);
    } else {
      set((state) => ({
        interlinked: [
          ...state.interlinked,
          {
            sourceId,
            targetId,
            props,
          },
        ],
      }));
    }
  },
  removeInterlink: (sourceId: string, targetId: string) => {
    set((state) => ({
      interlinked: state.interlinked.filter(
        (link) => link.sourceId !== sourceId || link.targetId !== targetId
      ),
    }));
  },
  updateInterlinkedProps: (
    sourceId: string,
    targetId: string,
    props: string[]
  ) => {
    set((state) => ({
      interlinked: state.interlinked.map((link) =>
        link.sourceId === sourceId && link.targetId === targetId
          ? {
              ...link,
              props: [...new Set([...link.props, ...props])],
            }
          : link
      ),
    }));
  },
  getInterlinkedComponents: (sourceId: string) => {
    return get().interlinked.filter((link) => link.sourceId === sourceId);
  },
  syncProps: (sourceId: string, propName: string, value: unknown) => {
    const linkedComponents = get().getInterlinkedComponents(sourceId);
    linkedComponents.forEach((link) => {
      if (link.props.includes(propName)) {
        useComponentsStore.getState().updateProps(link.targetId, {
          [propName]: value,
        });
      }
    });
  },
  reset: () => {
    set({
      interlinked: [],
    });
  },
}));

// 监听 componentsStore 的属性更新
useComponentsStore.subscribe((state, prevState) => {
  state.components.forEach((comp, index) => {
    const prevComp = prevState.components[index];
    if (prevComp) {
      Object.keys(comp.props).forEach((propName) => {
        if (comp.props[propName] !== prevComp.props[propName]) {
          useInterlinkedStore
            .getState()
            .syncProps(comp.id, propName, comp.props[propName]);
        }
      });
    }
  });
});
