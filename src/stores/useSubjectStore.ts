import { create } from "zustand";
import {
  SubjectDataResponse,
  ListSubjectResponse,
  SubjectDataMeta,
} from "@/types/subject";
import { getSubject, getSubjectData, getSubjectList } from "@/api/subject";
import { RegionInterest, TimeInterest } from "@/types/interest";
import { zip } from "lodash";

interface SubjectState {
  currentSubject: ListSubjectResponse | null;
  subjectDatas: SubjectDataResponse[];
  allSubjects: ListSubjectResponse[];
  loading: boolean;
  error: string | null;
  timeInterests: { interests: TimeInterest[]; meta: SubjectDataMeta }[];
  regionInterests: { interests: RegionInterest[]; meta: SubjectDataMeta }[];
  selectSubject: (subject_id: number) => Promise<void>;
  clearSelection: () => void;
  fetchAllSubjects: () => Promise<void>;
  parseSubjectData:(subjectData: SubjectDataResponse[])=>void;
  claerParse:() =>void;
}
export const useSubjectStore = create<SubjectState>((set) => ({
  currentSubject: null,
  subjectDatas: [],
  allSubjects: [],
  loading: false,
  error: null,
  timeInterests: [],
  regionInterests: [],
  parseSubjectData: (subjectDatas) => {
    const timeInterests:{ interests: TimeInterest[]; meta: SubjectDataMeta }[] = [];
    const regionInterests: { interests: RegionInterest[]; meta: SubjectDataMeta }[] = [];
    for (const data of subjectDatas) {
      if (data.data_type == "time") {
        for (const [interests, meta] of zip(data.data as TimeInterest[][], data.meta)) {
          if (interests && meta) {
            timeInterests.push({ interests: interests, meta: meta });
          }
        }
      } else {
        for (const [interests, meta] of zip(data.data as RegionInterest[][], data.meta)) {
          if (interests && meta) {
            regionInterests.push({ interests: interests, meta: meta });
          }
        }
      }
    }
    set(()=>({ timeInterests:[...timeInterests], regionInterests:[...regionInterests] }));
  },
  selectSubject: async (subject_id) => {
    try {
      set({ loading: true, error: null });
      let subject = useSubjectStore.getState().allSubjects.find(s => s.subject_id === subject_id) || null;
      if (!subject) {
        subject = await getSubject(subject_id);
      }
      const data = await getSubjectData(subject_id);
      useSubjectStore.getState().parseSubjectData(data);
      set({
        currentSubject: subject,
        subjectDatas: data,
        loading: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      set({
        error: "Failed to load subject data",
        loading: false,
      });
    }
  },
  clearSelection: () => {
    set({
      currentSubject: null,
      subjectDatas: [],
      error: null,
    });
  },
  fetchAllSubjects: async () => {
    try {
      set({ loading: true, error: null });
      const subjects = await getSubjectList();
      set({
        allSubjects: subjects,
        loading: false,
      });
    } catch {
      set({
        error: "Failed to load subjects",
        loading: false,
      });
    }
  },
  claerParse:()=>{
    set({
      timeInterests:[],
      regionInterests:[]
    })
  }
}));
