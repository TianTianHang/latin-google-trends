import { create } from 'zustand';
import { HistoricalTaskResponse, ScheduledTaskResponse } from '@/types/tasks';
import { listHistoricalTasks, listScheduledTasks } from '@/api/tasks';

interface TaskState {
  historicalTasks: HistoricalTaskResponse[];
  scheduledTasks: ScheduledTaskResponse[];
  fetchHistoricalTasks: (serviceId: string) => void;
  fetchScheduledTasks: (serviceId: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
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
}));