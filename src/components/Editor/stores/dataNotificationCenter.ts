import { create } from 'zustand';

interface NotificationCenterState {
  subscribers: Map<string, Set<(data: unknown) => void>>;
  subscribe: (sourceId: string, callback: (data: unknown) => void) => void;
  unsubscribe: (sourceId: string, callback: (data: unknown) => void) => void;
  notify: (sourceId: string, data: unknown) => void;
}

export const useDataNotificationCenter = create<NotificationCenterState>((set, get) => ({
  subscribers: new Map(),
  
  subscribe: (sourceId, callback) => {
    set((state) => {
      if (!state.subscribers.has(sourceId)) {
        state.subscribers.set(sourceId, new Set());
      }
      state.subscribers.get(sourceId)?.add(callback);
      return state;
    });
  },

  unsubscribe: (sourceId, callback) => {
    set((state) => {
      state.subscribers.get(sourceId)?.delete(callback);
      return state;
    });
  },

  notify: (sourceId, data) => {
    const callbacks = get().subscribers.get(sourceId);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}));