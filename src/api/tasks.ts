import { HistoricalTaskRequest, ScheduledTaskRequest, HistoricalTaskResponse, ScheduledTaskResponse } from '@/types/tasks';
import http from '@/utils/request';

// API 接口路径
const api = {
  createHistoricalTask: '/trends_collector/tasks/historical',
  createScheduledTask: '/trends_collector/tasks/scheduled',
  listHistoricalTasks: '/trends_collector/tasks/historical',
  listScheduledTasks: '/trends_collector/tasks/scheduled',
  terminateHistoricalTask: '/trends_collector/tasks/historical/{task_id}/terminate',
  retryHistoricalTask: '/trends_collector/tasks/historical/{task_id}/retry',
  toggleScheduledTask: '/trends_collector/tasks/scheduled/{task_id}/toggle',
};

// 创建历史任务
export function createHistoricalTask(serviceId: string, data: HistoricalTaskRequest) {
  return http.post<{ task_id: number }>(api.createHistoricalTask, data, {
    headers: { 'X-Service-ID': serviceId }
  });
}

// 创建定时任务
export function createScheduledTask(serviceId: string, data: ScheduledTaskRequest) {
  return http.post<{ task_id: number }>(api.createScheduledTask, data, {
    headers: { 'X-Service-ID': serviceId }
  });
}

// 查询所有历史任务
export function listHistoricalTasks(serviceId: string) {
  return http.get<HistoricalTaskResponse[]>(api.listHistoricalTasks, {
    headers: { 'X-Service-ID': serviceId }
  });
}

// 查询所有定时任务
export function listScheduledTasks(serviceId: string) {
  return http.get<ScheduledTaskResponse[]>(api.listScheduledTasks, {
    headers: { 'X-Service-ID': serviceId }
  });
}

// 终止历史任务
export function terminateHistoricalTask(serviceId: string, taskId: number) {
  const url = api.terminateHistoricalTask.replace('{task_id}', taskId.toString());
  return http.post<{ message: string }>(url, undefined, {
    headers: { 'X-Service-ID': serviceId }
  });
}

// 重试历史任务
export function retryHistoricalTask(serviceId: string, taskId: number) {
  const url = api.retryHistoricalTask.replace('{task_id}', taskId.toString());
  return http.post<{ message: string }>(url, undefined, {
    headers: { 'X-Service-ID': serviceId }
  });
}

// 切换定时任务状态
export function toggleScheduledTask(serviceId: string, taskId: number, enabled: boolean) {
  const url = api.toggleScheduledTask.replace('{task_id}', taskId.toString());
  return http.post<{ message: string }>(url, { enabled }, {
    headers: { 'X-Service-ID': serviceId }
  });
}
