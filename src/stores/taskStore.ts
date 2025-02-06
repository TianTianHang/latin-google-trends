import { create } from 'zustand';
import { HistoricalTaskResponse, ScheduledTaskResponse } from '@/types/tasks';
import { listHistoricalTasks, listScheduledTasks } from '@/api/tasks';

interface TaskState {
  historicalTasks: HistoricalTaskResponse[];
  scheduledTasks: ScheduledTaskResponse[];
  fetchHistoricalTasks: () => void;
  fetchScheduledTasks: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  historicalTasks: [],
  scheduledTasks: [],
  fetchHistoricalTasks: async () => {
    const tasks = await listHistoricalTasks();
    set({ historicalTasks: tasks });
  },
  fetchScheduledTasks: async () => {
    const tasks = await listScheduledTasks();
    set({ scheduledTasks: tasks });
  },
}));