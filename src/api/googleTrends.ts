import http from '@/utils/request';
import { GoogleTrendsRequest, TrendsByRegionRes, TrendsOverTimeRes } from "@/types/google-trends";
// api接口 - 此处用了统一保存接口url路径
const api = {
    overTime: '/trends/overTime',
    region:'/trends/region'
  };
export function getInterestOverTime(query:GoogleTrendsRequest){
    return http.post<TrendsOverTimeRes>(api.overTime,query);
}
export function getInterestByRegion(query:GoogleTrendsRequest & {resolution?:string}){
  return http.post<TrendsByRegionRes>(api.region,query);
}