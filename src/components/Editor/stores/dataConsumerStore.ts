import { create } from 'zustand';
import { useDataProviderStore } from './dataProviderStore';
import { useDataNotificationCenter } from './dataNotificationCenter';
import { useComponentsStore } from './componentsStore';

interface DataBinding {
  sourceId: string;
  targetId: string;
  propName: string;
}
//sourceId 数据源id targetId 组件Id
interface DataConsumerState {
  bindings: Map<string, DataBinding[]>;
  bindData: (sourceId: string, targetId: string, propName: string) => void;
  unbindData: (sourceId: string, targetId: string) => void;
  updateBoundData: (sourceId: string, data: unknown) => void;
}

export const useDataConsumerStore = create<DataConsumerState>((set, get) => ({
  bindings: new Map(),
  
  bindData: (sourceId, targetId, propName) => {
    set((state) => {
      if (!state.bindings.has(sourceId)) {
        state.bindings.set(sourceId, []);
      }
      state.bindings.get(sourceId)?.push({ sourceId, targetId, propName });
      return state;
    });

    // Setup initial data
    useDataProviderStore.getState().getData(sourceId).then((data) => {
      useComponentsStore.getState().updateProps(targetId, { [propName]: data });
    });

    // Subscribe to updates
    useDataNotificationCenter.getState().subscribe(sourceId, (data) => {
      get().updateBoundData(sourceId, data);
    });
  },

  unbindData: (sourceId, targetId) => {
    set((state) => {
      const bindings = state.bindings.get(sourceId);
      if (bindings) {
        state.bindings.set(sourceId, bindings.filter(b => b.targetId !== targetId));
      }
      return state;
    });

    useDataNotificationCenter.getState().unsubscribe(sourceId, (data) => {
      get().updateBoundData(sourceId, data);
    });
  },

  updateBoundData: (sourceId, data) => {
    const bindings = get().bindings.get(sourceId);
    if (bindings) {
      bindings.forEach((binding) => {
        useComponentsStore.getState().updateProps(binding.targetId, {
          [binding.propName]: data
        });
      });
    }
  }
}));