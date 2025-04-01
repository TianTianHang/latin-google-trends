import {
  useComponentsStore,
  useInterlinkedStore,
  useLayoutsStore,
} from "@/components/Editor/stores";
import { Dayjs } from "dayjs";

export interface LayoutResponse {
  id: string;
  name: string;
  version:string;
  timestamp: number;
  components: ReturnType<typeof useComponentsStore.getState>["components"];
  layouts: ReturnType<typeof useLayoutsStore.getState>["currentLayouts"];
  interlinks: ReturnType<typeof useInterlinkedStore.getState>["interlinked"];
  created_at: Dayjs;
  updated_at: Dayjs;
}

export interface SaveData {
  id: string;
  name: string;
  version: string;
  timestamp: number;
  components: ReturnType<typeof useComponentsStore.getState>["components"];
  layouts: ReturnType<typeof useLayoutsStore.getState>["currentLayouts"];
  interlinks: ReturnType<typeof useInterlinkedStore.getState>["interlinked"];
}

export interface SaveList {
  [id: string]: SaveData;
}
