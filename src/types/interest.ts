export interface RegionInterestResponse {
    id: number; // 唯一标识符
    keyword: string; // 关键词
    geo_code: string; // 地区代码
    timeframe_start?: string; // 时间范围开始日期，格式为 "YYYY-MM-DD"，可选
    timeframe_end?: string; // 时间范围结束日期，格式为 "YYYY-MM-DD"，可选
    value: number; // 兴趣值
  }
  export interface TimeInterestResponse {
    id: number;
    keyword: string;
    geo_code?: string;
    time: string;
    value: number;
    is_partial?: boolean;
  }

  // 定义返回的数据结构
export interface RegionInterestResult {
  [geo_code: string]: {
    timeframe_start: string;
    timeframe_end: string;
    value: number;
  }[];
}