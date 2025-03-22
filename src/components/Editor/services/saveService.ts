import { useComponentsStore } from '../stores/componentsStore';
import { useLayoutsStore } from '../stores/layoutsStore';
import { useInterlinkedStore } from '../stores/interlinkedStore';

interface SaveData {
  id: string;
  name: string;
  version: string;
  timestamp: number;
  components: ReturnType<typeof useComponentsStore.getState>['components'];
  layouts: ReturnType<typeof useLayoutsStore.getState>['currentLayouts'];
  interlinks: ReturnType<typeof useInterlinkedStore.getState>['interlinked'];
}

interface SaveList {
  [id: string]: SaveData;
}

class SaveService {
  private static instance: SaveService;
  private version = '1.0.0';
  
  private constructor() {}

  public static getInstance(): SaveService {
    if (!SaveService.instance) {
      SaveService.instance = new SaveService();
    }
    return SaveService.instance;
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

  // 序列化数据
  private serializeData(data: SaveData | Omit<SaveData, 'id' | 'name'>): string {
    return JSON.stringify(data, null, 2);
  }

  // 保存到本地存储
  public saveToLocalStorage(id: string, name: string): boolean {
    try {
      const baseData = this.collectData();
      const data: SaveData = {
        ...baseData,
        id,
        name
      };
      
      // 获取现有存档列表
      const saveList = this.getSaveList();
      saveList[id] = data;
      
      // 保存更新后的存档列表
      localStorage.setItem('editorStates', JSON.stringify(saveList));
      return true;
    } catch (error) {
      console.error('保存到本地存储失败:', error);
      return false;
    }
  }

  // 获取所有存档列表
  public getSaveList(): SaveList {
    try {
      const saveList = localStorage.getItem('editorStates');
      return saveList ? JSON.parse(saveList) as SaveList : {};
    } catch (error) {
      console.error('获取存档列表失败:', error);
      return {};
    }
  }

  // 保存到远程API
  public async saveToRemoteAPI(): Promise<boolean> {
    try {
      const data = this.collectData();
      const serializedData = this.serializeData(data);
      
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: serializedData,
      });

      return response.ok;
    } catch (error) {
      console.error('保存到远程API失败:', error);
      return false;
    }
  }

  // 删除存档
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

  // 加载数据
  public loadFromLocalStorage(id?: string): SaveData | null {
    try {
      const saveList = this.getSaveList();
      
      // 如果没有指定id，返回最新存档
      if (!id) {
        const latest = Object.values(saveList).sort((a, b) => b.timestamp - a.timestamp)[0];
        return latest || null;
      }
      
      // 返回指定id的存档
      return saveList[id] || null;
    } catch (error) {
      console.error('从本地存储加载数据失败:', error);
      return null;
    }
  }
}

export const saveService = SaveService.getInstance();