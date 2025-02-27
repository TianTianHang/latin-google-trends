import { create } from "zustand";
import { Subject } from "@/types/subject";
import { RegionInterestResult } from "@/types/interest";
import dayjs from "dayjs";

interface DashBoardState {
  subjects: Subject[];
  currentStep: number;
  timeSteps: dayjs.Dayjs[];
  geoData: RegionInterestResult;
  selectedGeos: string[];
  startDate: dayjs.Dayjs;
  interval: "day" | "month" | "year";
  keyword: string;
  fitCodes: string[];
  setSubjects: (subjects: Subject[]) => void;
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
  subjects: [],
  currentStep: 0,
  timeSteps: [],
  selectedGeos: ["IT"],
  geoData: {},
  startDate: dayjs("2004-01-01"),
  interval: "month",
  keyword: "new",
  fitCodes: ["IT"],
  setSubjects: (subjects) => set({ subjects }),
  setGeoData: (geodata) => set({ geoData: geodata }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setTimeSteps: (steps) => set({ timeSteps: steps }),
  setStartDate: (date) => set({ startDate: date }),
  setInterval: (interval) => set({ interval }),
  setKeyword: (keyword) => set({ keyword }),
  setSelectedGeos: (geos) =>
    set({
      selectedGeos: geos,
      fitCodes: geos.slice(0, 1),
    }),
  setFitCodes: (codes) =>
    set((state) => ({
      fitCodes: codes.filter((code) => state.selectedGeos.includes(code)),
    })),
}));
