import { Dayjs } from "dayjs";

// 定义任务相关的类型
export type HistoricalTaskRequest = {
    job_type: string;
    keywords: string[];
    geo_code?: string;
    start_date: string;
    end_date: string;
    interval?: string;
  };
  
  export type ScheduledTaskRequest = {
    job_type: string;
    keywords: string[];
    start_date: string;
    geo_code?: string;
    interval?: string;
    duration: number;
  };
  
  export type HistoricalTaskResponse = {
    id: number;
    job_type: string;
    keywords: string[];
    status: string;
    created_at: string;
    schedule_id:number;
    geo_code: string;
    start_date: Dayjs
    end_date: Dayjs;
  };
  
  export type ScheduledTaskResponse = {
    id: number;
    job_type: string;
    duration: string;
    interval: number;
    start_date:Dayjs;
    keywords: string[];
    enabled: boolean;
  };
