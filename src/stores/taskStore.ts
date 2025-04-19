import { create } from 'zustand';
import { HistoricalTaskResponse, ScheduledTaskResponse } from '@/types/tasks';
import { listHistoricalTasks, listScheduledTasks } from '@/api/tasks';

interface TaskState {
  historicalTasks: HistoricalTaskResponse[];
  scheduledTasks: ScheduledTaskResponse[];
  fetchHistoricalTasks: (serviceId: string) => void;
  fetchScheduledTasks: (serviceId: string) => void;
  // 新增：根据定时任务id获取关联的历史任务
  getHistoricalTasksByScheduleId: (scheduleId: number) => HistoricalTaskResponse[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  historicalTasks: [],
  scheduledTasks: [],
  fetchHistoricalTasks: async (serviceId: string) => {
    const tasks = await listHistoricalTasks(serviceId);
    set({ historicalTasks: tasks });
  },
  fetchScheduledTasks: async (serviceId: string) => {
    const tasks = await listScheduledTasks(serviceId);
    set({ scheduledTasks: tasks });
  },
  // 新增：实现获取关联历史任务的方法
  getHistoricalTasksByScheduleId: (scheduleId: number) => {
    const { historicalTasks } = get();
    return historicalTasks.filter(task => task.schedule_id === scheduleId);
  },
}));