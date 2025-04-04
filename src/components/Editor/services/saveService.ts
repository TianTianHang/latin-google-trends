import { useComponentsStore } from '../stores/componentsStore';
import { useLayoutsStore } from '../stores/layoutsStore';
import { useInterlinkedStore } from '../stores/interlinkedStore';
import { SaveData, SaveList } from '@/types/layouts';
import { saveLayout, listLayouts, deleteLayout } from '@/api/layouts';



interface ISaveStrategy {
  save(id: string, name: string): boolean | Promise<boolean>;
  deleteSave(id: string): boolean | Promise<boolean>;
  getSaveList(): SaveList | Promise<SaveList>;
  load(id?: string): SaveData | null | Promise<SaveData | null>;
}

class LocalStorageStrategy implements ISaveStrategy {
  constructor(private saveService: SaveService) {}

  public save(id: string, name: string): boolean {
    try {
      const baseData = this.saveService['collectData']();
      const data: SaveData = {
        ...baseData,
        id,
        name
      };
      
      const saveList = this.getSaveList();
      saveList[id] = data;
      localStorage.setItem('editorStates', JSON.stringify(saveList));
      return true;
    } catch (error) {
      console.error('保存到本地存储失败:', error);
      return false;
    }
  }

  public deleteSave(id: string): boolean {
    try {
      const saveList = this.getSaveList();
      delete saveList[id];
      localStorage.setItem('editorStates', JSON.stringify(saveList));
      return true;
    } catch (error) {
      console.error('删除存档失败:', error);
      return false;
    }
  }

  public getSaveList(): SaveList {
    try {
      const saveList = localStorage.getItem('editorStates');
      return saveList ? JSON.parse(saveList) as SaveList : {};
    } catch (error) {
      console.error('获取存档列表失败:', error);
      return {};
    }
  }

  public load(id?: string): SaveData | null {
    try {
      const saveList = this.getSaveList();
      
      if (!id) {
        const latest = Object.values(saveList).sort((a, b) => b.timestamp - a.timestamp)[0];
        return latest || null;
      }
      
      return saveList[id] || null;
    } catch (error) {
      console.error('从本地存储加载数据失败:', error);
      return null;
    }
  }
}

class RemoteAPIStrategy implements ISaveStrategy {
  constructor(private saveService: SaveService) {}

  public async save(id: string, name: string): Promise<boolean> {
    try {
      const data = this.saveService['collectData']();
      const saveData = {
        ...data,
        id,
        name
      };
      
      const response = await saveLayout(saveData);
      return !!response;
    } catch (error) {
      console.error('保存到远程API失败:', error);
      return false;
    }
  }

  public async deleteSave(id: string): Promise<boolean> {
    try {
      const response = await deleteLayout(id);
      return !!response;
    } catch (error) {
      console.error('删除远程存档失败:', error);
      return false;
    }
  }

  public async getSaveList(): Promise<SaveList> {
    try {
      const layouts = await listLayouts();
      const saveList: SaveList = {};
      layouts.forEach(layout => {
        saveList[layout.id] = layout;
      });
      return saveList;
    } catch (error) {
      console.error('获取远程存档列表失败:', error);
      return {};
    }
  }

  public async load(id?: string): Promise<SaveData | null> {
    try {
      if (!id) {
        const saveList = await this.getSaveList();
        const latest = Object.values(saveList).sort((a, b) => b.timestamp - a.timestamp)[0];
        return latest || null;
      }
      
      const saveList = await this.getSaveList();
      return saveList[id] || null;
    } catch (error) {
      console.error('从远程加载数据失败:', error);
      return null;
    }
  }
}

class SaveService {
  private static instance: SaveService;
  private version = '1.0.0';
  private currentStrategy: ISaveStrategy;
  
  private constructor() {
    // 默认使用远程存储策略
    this.currentStrategy = new RemoteAPIStrategy(this);
  }

  public static getInstance(): SaveService {
    if (!SaveService.instance) {
      SaveService.instance = new SaveService();
    }
    return SaveService.instance;
  }

  // 设置保存策略
  public setStrategy(strategy: 'local' | 'remote'): void {
    this.currentStrategy = strategy === 'local'
      ? new LocalStorageStrategy(this)
      : new RemoteAPIStrategy(this);
  }

  // 获取当前策略类型
  public getCurrentStrategyType(): 'local' | 'remote' {
    return this.currentStrategy instanceof LocalStorageStrategy
      ? 'local'
      : 'remote';
  }

  // 收集数据
  private collectData(): Omit<SaveData, 'id' | 'name'> {
    return {
      version: this.version,
      timestamp: Date.now(),
      components: useComponentsStore.getState().components,
      layouts: useLayoutsStore.getState().currentLayouts,
      interlinks: useInterlinkedStore.getState().interlinked,
    };
  }


  // 使用当前策略保存
  public save(id: string, name: string): boolean | Promise<boolean> {
    return this.currentStrategy.save(id, name);
  }

  // 使用当前策略删除
  public deleteSave(id: string): boolean | Promise<boolean> {
    return this.currentStrategy.deleteSave(id);
  }

  // 使用当前策略获取列表
  public getSaveList(): SaveList | Promise<SaveList> {
    return this.currentStrategy.getSaveList();
  }

  // 使用当前策略加载
  public load(id?: string): SaveData | null | Promise<SaveData | null> {
    return this.currentStrategy.load(id);
  }
}

export const saveService = SaveService.getInstance();