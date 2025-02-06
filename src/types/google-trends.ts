export interface GoogleTrendsRequest {
    cat?: string;
    date: string;
    geo?: string;
    gprop?: string;
    q: string;
}
export interface TrendsOverTime {
    time: string,
    [prop:string]: number|string
}
export interface TrendsOverTimeRes {
   data:TrendsOverTime[],
   keys:string[]
}
export interface Coordinates{
    lat:number,
    lon:number
}
export interface TrendsByRegion{
    geoName:string,
    geoCode:string,
    coordinates?:Coordinates
    [prop:string]: number | string | Coordinates | undefined
}
export interface TrendsByRegionRes {
    data:TrendsByRegion[],
    keys:string[]
 }


