import {
  RegionInterestResponse,
  RegionInterestResult,
  TimeInterestResponse,
} from "@/types/interest";
import { QueryParams } from "@/types/query";
import http from "@/utils/request";
import dayjs from "dayjs";

// api接口 - 此处用了统一保存接口url路径
const api = {
  regionInterests: "/query/interest/region-interests",
  timeInterests: "/query/interest/time-interests",
};

// 定义查询区域兴趣的接口
export const queryRegionInterests = (queryParams: QueryParams) => {
  return http.post<RegionInterestResponse[]>(api.regionInterests, queryParams);
};

// 定义查询时间兴趣的接口
export const queryTimeInterests = (queryParams: QueryParams) => {
  return http.post<TimeInterestResponse[]>(api.timeInterests, queryParams);
};

/**
 * 根据多个 geo_code 查询区域兴趣
 * @param geo_codes 区域代码数组
 * @returns 返回指定格式的结果
 */
export const getRegionInterestByGeoCode = async (
  geo_codes: string[]
): Promise<RegionInterestResult> => {
  try {
    // 构造查询参数
    const queryParams = {
      filters: [{ field: "geo_code", op: "in", value: geo_codes }],
    };

    // 调用查询接口
    const regionInterests = await queryRegionInterests(queryParams);

    // 格式化结果
    const result: RegionInterestResult = {};

    regionInterests.forEach((interest) => {
      const { geo_code, timeframe_start, timeframe_end, value } = interest;
      if (!result[geo_code]) {
        result[geo_code] = [];
      }
      result[geo_code].push({
        timeframe_start: timeframe_start!,
        timeframe_end: timeframe_end!,
        value: value!,
      });
    });

    return result;
  } catch (error) {
    console.error("Error fetching region interests:", error);
    throw error;
  }
};

/**
 * 查询地区数据，基于时间段划分地区兴趣值并过滤时间间隔不对的数据
 * @param keyword 关键词
 * @param startDate 开始时间
 * @param endDate 结束时间
 * @param interval 时间间隔（支持 'day' | 'month' | 'year'）
 * @returns { RegionInterestResponse[] }
 */
export const getRegionInterestByTime = async (
  keyword: string,
  startDate: dayjs.Dayjs,
  endDate: dayjs.Dayjs,
): Promise<RegionInterestResponse[]> => {
  try {
    // 1. 查询地区数据
    const regionQueryParams:QueryParams = {
      filters: [
        { field: "keyword", op: "eq", value: keyword },
        { field: "timeframe_start", op: "eq", value: startDate.format("YYYY-MM-DD") },
        { field: "timeframe_end", op: "eq", value: endDate.format("YYYY-MM-DD") },
      ],
    };
    const regionInterests = await queryRegionInterests(regionQueryParams);

    

    return regionInterests;
  } catch (error) {
    console.error("Error fetching region interest by time interval:", error);
    throw error;
  }
};
