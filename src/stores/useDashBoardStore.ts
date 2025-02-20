import { create } from "zustand";
import { RegionInterestResponse, RegionInterestResult } from "@/types/interest";
import dayjs from "dayjs";

interface DashBoardState {
  data: { [index: number]: RegionInterestResponse[] };
  currentStep: number;
  timeSteps: dayjs.Dayjs[];
  geoData: RegionInterestResult;
  selectedGeos: string[];
  startDate: dayjs.Dayjs;
  interval: "day" | "month" | "year";
  keyword: string;
  fitCodes: string[];
  setData: (index: number, regionData: RegionInterestResponse[]) => void;
  setGeoData: (geoData: RegionInterestResult) => void;
  setCurrentStep: (step: number) => void;
  setTimeSteps: (steps: dayjs.Dayjs[]) => void;
  setStartDate: (date: dayjs.Dayjs) => void;
  setInterval: (interval: "day" | "month" | "year") => void;
  setKeyword: (keyword: string) => void;
  setSelectedGeos: (geos: string[]) => void;
  setFitCodes: (codes: string[]) => void;
}

export const useDashBoardStore = create<DashBoardState>((set) => ({
  data: {},
  currentStep: 0,
  timeSteps: [],
  selectedGeos: ["IT"],
  geoData: {},
  startDate: dayjs("2004-01-01"), // 默认值
  interval: "month",
  keyword: "new",
  fitCodes: ["IT"],
  setData: (index, regionData) =>
    set((state) => ({
      data: { ...state.data, [index]: regionData },
    })),
  setGeoData: (geodata) => set({ geoData: geodata }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setTimeSteps: (steps) => set({ timeSteps: steps }),
  setStartDate: (date) => set({ startDate: date }),
  setInterval: (interval) => set({ interval }),
  setKeyword: (keyword) => set({ keyword }),
  setSelectedGeos: (geos) =>
    set({
      selectedGeos: geos,
      fitCodes: geos.slice(0, 1), // 保持fitCodes为selectedGeos的子集
    }),
  setFitCodes: (codes) =>
    set((state) => ({
      fitCodes: codes.filter((code) => state.selectedGeos.includes(code)),
    })),
}));
