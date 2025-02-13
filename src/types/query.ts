// 定义 Filter 类型
export interface Filter {
    field: string;
    op?: string; // 默认操作符为 "eq"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
  }
  
  // 定义 Sort 类型
  export interface Sort {
    field: string;
    order?: string; // 默认为 "asc"
  }
  
  // 定义 QueryParams 类型
  export interface QueryParams {
    filters?: Filter[];
    sorts?: Sort[];
    skip?: number; // 默认为 0
    limit?: number; // 默认为 100
  }