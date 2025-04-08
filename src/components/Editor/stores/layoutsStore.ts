import { Layout } from "react-grid-layout";
import { create } from "zustand";



interface LayoutsState {
  predefinedLayouts: Array<{
    name: string;
    layouts: Layout[];
  }>;
  currentLayouts: Layout[];
  switchLayout: (layoutIndex: number) => void;
  updateLayout: (layout: Layout[]) => void;
  reset: ()=>void;
  toggleStatic: (i: string) => void;
  getStatic: (i: string) => boolean;
}

export const useLayoutsStore = create<LayoutsState>((set, get) => ({
  predefinedLayouts: [
    {
      name: '默认布局',
      layouts: [
        {i:"", x: 0, y: 0, w: 2, h: 1, minH: 1, minW: 1,moved:true },
        {i:"", x: 0, y: 1, w: 2, h: 1, minH: 1, minW: 1,moved:true },
        {i:"", x: 0, y: 2, w: 2, h: 1, minH: 1, minW: 1,moved:true },
        {i:"", x: 0, y: 3, w: 2, h: 1, minH: 1, minW: 1,moved:true },
        {i:"", x: 3, y: 0, w: 10, h: 4, minH: 2, minW: 1,static:true },
      ]
    },
    {
      name: '两列布局', 
      layouts: [
        {i:"", x: 0, y: 0, w: 6, h: 2, minH: 1, minW: 1,moved:true },
        {i:"", x: 6, y: 0, w: 6, h: 2, minH: 1, minW: 1,moved:true },
        {i:"", x: 0, y: 2, w: 6, h: 2, minH: 1, minW: 1,moved:true },
        {i:"", x: 6, y: 2, w: 6, h: 2, minH: 1, minW: 1,moved:true },
      ]
    },
    {
      name: '三列布局',
      layouts: [
        {i:"", x: 0, y: 0, w: 4, h: 2, minH: 1, minW: 1,moved:true },
        {i:"", x: 4, y: 0, w: 4, h: 2, minH: 1, minW: 1,moved:true },
        {i:"", x: 8, y: 0, w: 4, h: 2, minH: 1, minW: 1,moved:true },
        {i:"", x: 0, y: 2, w: 4, h: 2, minH: 1, minW: 1,moved:true },
        {i:"", x: 4, y: 2, w: 4, h: 2, minH: 1, minW: 1,moved:true },
        {i:"", x: 8, y: 2, w: 4, h: 2, minH: 1, minW: 1,moved:true },
      ]
    }
  ],
  currentLayouts: [
    {i:"", x: 0, y: 0, w: 2, h: 1, minH: 1, minW: 1,moved:true },
    {i:"", x: 0, y: 1, w: 2, h: 1, minH: 1, minW: 1,moved:true },
    {i:"", x: 0, y: 2, w: 2, h: 1, minH: 1, minW: 1,moved:true },
    {i:"", x: 0, y: 3, w: 2, h: 1, minH: 1, minW: 1,moved:true },
    {i:"", x: 3, y: 0, w: 10, h: 4, minH: 2, minW: 1,static:true },
  ],
  switchLayout: (layoutIndex: number) => {
    const { predefinedLayouts } = get();
    const newLayouts = predefinedLayouts[layoutIndex].layouts;
    set({
      currentLayouts: newLayouts,
    });
  },
  updateLayout: (layout) => {
    set(() => ({
      currentLayouts: layout,
    }));
  },
  reset: () => {
    set(() => ({
      currentLayouts: get().predefinedLayouts[0].layouts,
    }))
  },
  toggleStatic: (i: string) => {
    set((state) => ({
      currentLayouts: state.currentLayouts.map(layout => {
        const isTarget = i.startsWith("place-")
          ? state.currentLayouts.indexOf(layout) === parseInt(i.split("-")[1])
          : layout.i === i;
        return isTarget ? {...layout, static: !layout.static} : layout;
      })
    }));
  },
  getStatic: (i: string) => {
    const { currentLayouts } = get();
    const targetLayout = currentLayouts.find(layout =>
      i.startsWith("place-")
        ? currentLayouts.indexOf(layout) === parseInt(i.split("-")[1])
        : layout.i === i
    );
    return targetLayout?.static ?? false;
  }
}));
