import { SubjectDataMeta } from "./subject";

export type TimeInterest= {
    time_utc: string;
    is_partial: boolean;
} & Record<string, number>;
export type RegionInterest= {
    geo_name: string;
    geo_code: string;
} & Record<string, number>;

export interface CollectionsNotBindRequest{
  interest_type?:string;
  skip:number;
  limit:number;
}
export type CollectionsBindRequest=CollectionsNotBindRequest & {
  subject_data_ids:string
}
export interface CollectionResponse{
    id:number;
    interest_type: string
    subject_data_id: number
    meta_data: SubjectDataMeta
}