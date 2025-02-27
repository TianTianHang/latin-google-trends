import { Dayjs } from "dayjs";
import { RegionInterest, TimeInterest } from "./interest";

export interface RealtimeTask {
  type: "realtime";
  data_type: string;
  keywords: string[];
  geo_code: string;
  start_date: Dayjs;
  duration: number;
  interval: string;
}

export interface HistoricalTask {
  type: "historical";
  data_type: string;
  keywords: string[];
  geo_code: string;
  start_date: Dayjs;
  end_date: Dayjs;
  interval?: string;
}

export interface RealtimeTaskStringDate extends Omit<RealtimeTask, 'start_date'> {
  start_date: string;
}

export interface HistoricalTaskStringDate extends Omit<HistoricalTask, 'start_date' | 'end_date'> {
  start_date: string;
  end_date: string;
}

export interface CreateSubjectParams {
  user_id: number;
  name: string;
  description:string
  parameters: Array<RealtimeTaskStringDate | HistoricalTaskStringDate>;
}

export interface CreateSubjectResponse {
  subject_id: string;
  name: string;
  description:string
}

export interface ListSubjectResponse {
  subject_id: string;
  name: string;
  description:string
  status: string;
  data_num: number;
}
export interface SubjectDataResponse{
  subject_id: string;
  data_type: string;
  data: Array<TimeInterest>[]|Array<RegionInterest>[];
  meta: SubjectDataMeta[];
  timestamp: string;
}
export interface SubjectDataMeta{
  keywords: string[];
  geo_code: string;
  timeframe_start: string;
  timeframe_end: string;
}


