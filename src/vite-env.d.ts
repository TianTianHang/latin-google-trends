/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_BASE_URL: string;
    readonly VITE_ROUTER_HISTORY: string;
    readonly VITE_PUBLIC_PATH:string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }