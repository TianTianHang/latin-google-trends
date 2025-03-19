import { create } from "zustand";
import {
  ComponentData,
  EditorStore,
  PropsType,
  RegisteredComponent,
} from "./types";


export const useEditorStore = create<EditorStore>((set, get) => ({
  predefinedLayouts: [
    {
      name: '默认布局',
      layouts: [
        { x: 0, y: 0, w: 2, h: 1, minH: 1, minW: 1,moved:true },
        { x: 0, y: 1, w: 2, h: 1, minH: 1, minW: 1,moved:true },
        { x: 0, y: 2, w: 2, h: 1, minH: 1, minW: 1,moved:true },
        { x: 0, y: 3, w: 2, h: 1, minH: 1, minW: 1,moved:true },
        { x: 3, y: 0, w: 10, h: 4, minH: 2, minW: 1,static:true },
      ]
    },
    {
      name: '两列布局', 
      layouts: [
        { x: 0, y: 0, w: 6, h: 2, minH: 1, minW: 1,moved:true },
        { x: 6, y: 0, w: 6, h: 2, minH: 1, minW: 1,moved:true },
        { x: 0, y: 2, w: 6, h: 2, minH: 1, minW: 1,moved:true },
        { x: 6, y: 2, w: 6, h: 2, minH: 1, minW: 1,moved:true },
      ]
    },
    {
      name: '三列布局',
      layouts: [
        { x: 0, y: 0, w: 4, h: 2, minH: 1, minW: 1,moved:true },
        { x: 4, y: 0, w: 4, h: 2, minH: 1, minW: 1,moved:true },
        { x: 8, y: 0, w: 4, h: 2, minH: 1, minW: 1,moved:true },
        { x: 0, y: 2, w: 4, h: 2, minH: 1, minW: 1,moved:true },
        { x: 4, y: 2, w: 4, h: 2, minH: 1, minW: 1,moved:true },
        { x: 8, y: 2, w: 4, h: 2, minH: 1, minW: 1,moved:true },
      ]
    }
  ],
  currentLayouts: [
    { x: 0, y: 0, w: 2, h: 1, minH: 1, minW: 1,moved:true },
    { x: 0, y: 1, w: 2, h: 1, minH: 1, minW: 1,moved:true },
    { x: 0, y: 2, w: 2, h: 1, minH: 1, minW: 1,moved:true },
    { x: 0, y: 3, w: 2, h: 1, minH: 1, minW: 1,moved:true },
    { x: 3, y: 0, w: 10, h: 4, minH: 2, minW: 1,static:true },
  ],
  registered: new Map<string, RegisteredComponent<PropsType>>(),
  components: [],
  past: [],
  future: [],
  selectedId: null,
  interlinked:[],
  
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
    const { currentLayouts } = get();
    if (currentLayouts[component.position].i) {
      //替换路线,id 不变
      const id = currentLayouts[component.position].i;
      set((state) => {
        const newComponents = [...state.components];
        const index = newComponents.findIndex((comp) => comp.id == id);
        newComponents[index] = {
          ...component,
          id: id as string,
        };
        return {
          components: newComponents,
        };
      });
    } else {
      //新增路线
      const id = crypto.randomUUID();
      const newComponent = {
        ...component,
        id: id,
      } as ComponentData<PropsType>;
      set((state) => {
        const newCurrentLayouts = [...state.currentLayouts];
        newCurrentLayouts[component.position] = {
          ...newCurrentLayouts[component.position],
          i: id, // 增加属性 i
        };
        return {
          currentLayouts: newCurrentLayouts,
          components: [...state.components, newComponent],
        };
      });
    }
  },
  deleteComponent: (id: string) => {
    set((state) => {
      const newCurrentLayouts = [...state.currentLayouts];
      const index=newCurrentLayouts.findIndex(layout=>layout.i==id);
      newCurrentLayouts[index] = {
        ...newCurrentLayouts[index],
        i:undefined
      };
      return {
        currentLayouts:newCurrentLayouts,
        components: state.components.filter((comp) => comp.id != id),
      }
    });
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
  updateLayout: (layout) => {
    set(() => ({
      currentLayouts: layout.map((l) =>{
        if(l.i&&!l.i.startsWith("place")){
          return l;
        }else{
          return {...l,i:undefined}
        }
      }
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
  
  switchLayout: (layoutIndex: number) => {
    const { predefinedLayouts } = get();
    const newLayouts = predefinedLayouts[layoutIndex].layouts;
    set({
      currentLayouts: newLayouts.map((layout, index) => ({
        ...layout,
        i: get().currentLayouts[index]?.i
      }))
    });
  },

  addInterlink: (sourceId: string, targetId: string, props: string[]) => {
    if(get().getInterlinkedComponents(sourceId).some(link=>link.targetId==targetId)){
      get().updateInterlinkedProps(sourceId,targetId,props);
    }else{
      set((state) => ({
      interlinked: [
        ...state.interlinked,
        {
          sourceId,
          targetId,
          props
        }
      ]
    }));
    }
  },

  removeInterlink: (sourceId: string, targetId: string) => {
    set((state) => ({
      interlinked: state.interlinked.filter(
        (link) => link.sourceId!=(sourceId)||link.targetId!=targetId
      )
    }));
  },

  updateInterlinkedProps: (sourceId: string, targetId: string, props: string[]) => {
    set((state) => ({
      interlinked: state.interlinked.map((link) =>
        link.sourceId==sourceId&&link.targetId==targetId
          ? {
              ...link,
              props: [...new Set([...link.props, ...props])]
            }
          : link
      )
    }));
  },

  getInterlinkedComponents: (sourceId: string) => {
    return get().interlinked
      .filter((link) => link.sourceId==sourceId);
  }
}));
