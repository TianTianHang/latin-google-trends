import { create } from "zustand";
import { useDataNotificationCenter } from "./dataNotificationCenter";
import { useInterlinkedStore } from "./interlinkedStore";

export interface DataSource {
  id: string;
  type: "static" | "api" | "websocket" | "csv" | "excel";
  config: Record<string, unknown>;
  fetch: () => Promise<unknown>;
  subscribe?: (callback: (data: unknown) => void) => void;
}

interface DataProviderState {
  dataSources: Map<string, DataSource>;
  registerDataSource: (source: DataSource) => void;
  unregisterDataSource: (id: string) => void;
  getData: (sourceId: string) => Promise<unknown>;
  subscribeData: (sourceId: string, callback: (data: unknown) => void) => void;
}

export const useDataProviderStore = create<DataProviderState>((set, get) => ({
  dataSources: new Map(),

  registerDataSource: (source) => {
    set((state) => {
      state.dataSources.set(source.id, source);
      return state;
    });

    // Setup real-time updates if supported
    if (source.subscribe) {
      source.subscribe((data) => {
        useDataNotificationCenter.getState().notify(source.id, data);
        useInterlinkedStore.getState().syncProps(source.id, "data", data);
      });
    }
  },

  unregisterDataSource: (id) => {
    set((state) => {
      state.dataSources.delete(id);
      return state;
    });
  },

  getData: async (sourceId) => {
    const source = get().dataSources.get(sourceId);
    if (!source) {
      throw new Error(`Data source ${sourceId} not found`);
    }
    return await source.fetch();
  },

  subscribeData: (sourceId, callback) => {
    const source = get().dataSources.get(sourceId);
    if (!source) {
      throw new Error(`Data source ${sourceId} not found`);
    }
    if (source.subscribe) {
      source.subscribe(callback);
    } else {
      console.warn(
        `Data source ${sourceId} does not support real-time updates`
      );
    }
  },
}));



