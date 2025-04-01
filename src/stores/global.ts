import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GlobalState {
  primaryColor: string;
  language: string;
  setColor: (color: string) => void;
  setLanguage: (language: string) => void;
}

//partialize 过滤属性，存储哪些字段到localStorage
export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      primaryColor: "#247fff",
      language: "zh",
      setColor: (color) => set(() => ({ primaryColor: color })),
      setLanguage: (language) => set(() => ({ language })),
    }),
    {
      name: "global-store",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) =>
            ["primaryColor", "language"].includes(key)
          )
        ),
    }
  )
);
