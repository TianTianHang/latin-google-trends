import { create } from "zustand";
import { useDataNotificationCenter } from "./dataNotificationCenter";
import { useInterlinkedStore } from "./interlinkedStore";
import { listDataSources, createDataSource, deleteDataSource } from '@/api/datasource';

export interface DataSource {
  id: string;
  type: "static" | "api" | "websocket" | "csv" | "excel";
  config: Record<string, unknown>;
  fetch: () => Promise<unknown>;
  subscribe?: (callback: (data: unknown) => void) => void;
}

interface DataProviderState {
  dataSources: Map<string, DataSource>;
  loadDataSources: () => Promise<void>;
  registerDataSource: (source: DataSource,save:boolean) => Promise<string>;
  unregisterDataSource: (id: string) => Promise<void>;
  getData: (sourceId: string) => Promise<unknown>;
  subscribeData: (sourceId: string, callback: (data: unknown) => void) => void;
}

export const useDataProviderStore = create<DataProviderState>((set, get) => ({
  dataSources: new Map(),

  loadDataSources: async () => {
    try {
      const sources = await listDataSources();
      set({ dataSources: new Map(sources.map(s => [s.id, s])) });
    } catch (error) {
      console.error('Failed to load data sources', error);
    }
  },

  registerDataSource: async (source,save=true) => {
    try {
      let created=null
      if(save){
         created = await createDataSource(source);
      }else{
        created = source;
      }
      
      set((state) => {
        state.dataSources.set(created.id, created);
        return state;
      });
      
      // Setup real-time updates if supported
      if (created.subscribe) {
        created.subscribe((data) => {
          useDataNotificationCenter.getState().notify(created.id, data);
          useInterlinkedStore.getState().syncProps(created.id, "data", data);
        });
      }
      return created.id;
    } catch (error) {
      console.error('Failed to register data source', error);
      throw error;
    }
  },

  unregisterDataSource: async (id) => {
    try {
      await deleteDataSource(id);
      set((state) => {
        state.dataSources.delete(id);
        return state;
      });
    } catch (error) {
      console.error('Failed to unregister data source', error);
      throw error;
    }
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



