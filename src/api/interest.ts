import { CollectionResponse, CollectionsBindRequest, CollectionsNotBindRequest } from "@/types/interest";
import http from "@/utils/request";

// api接口 - 此处用了统一保存接口url路径
const api = {
  collectionsNotBind: "/query/interests/collections/notBind",
  collectionBind:"/query/interests/collections/bind",
  stats:"/query/interests/collections/stats"
};

interface StatsResponse {
  total: number;
  by_type: {
    time: number;
    region: number;
  };
  by_binding: {
    bound: number;
    unbound: number;
  };
}

export const getCollectionsNotBind=(query:CollectionsNotBindRequest)=>{
  return http.get<CollectionResponse[]>(api.collectionsNotBind,query)
}

export const getCollectionsBind=(query:CollectionsBindRequest)=>{
  return http.get<CollectionResponse[]>(api.collectionBind,query)
}

export const getCollectionsStats=()=>{
  return http.get<StatsResponse>(api.stats)
}