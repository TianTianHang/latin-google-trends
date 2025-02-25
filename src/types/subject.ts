import { Dayjs } from "dayjs";

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

export interface CreateSubjectParams {
  user_id: string;
  parameters: Array<RealtimeTask | HistoricalTask>;
}

export interface CreateSubjectResponse {
  subject_id: string;
}
