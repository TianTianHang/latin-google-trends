// 定义任务相关的类型
export type HistoricalTaskRequest = {
    job_type: string;
    keyword: string;
    geo_code?: string;
    start_date: string;
    end_date: string;
    interval?: string;
  };
  
  export type ScheduledTaskRequest = {
    job_type: string;
    keyword: string;
    cron_expression: string;
    geo_code?: string;
    interval?: string;
  };
  
  export type HistoricalTaskResponse = {
    id: number;
    job_type: string;
    keyword: string;
    status: string;
    created_at: string;
  };
  
  export type ScheduledTaskResponse = {
    id: number;
    cron_expression: string;
    keyword: string;
    enabled: boolean;
  };