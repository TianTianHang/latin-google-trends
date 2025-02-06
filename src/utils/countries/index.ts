import { Coordinates } from '@/types/google-trends';
import { countriesData, Country } from '@/utils/countries/data';



// 根据 geoCode 获取国家信息的函数
function getCountryInfo(geoCode: string): Country | null {
  return countriesData[geoCode] || null;
}
export function getCountryCoordinates(geoCode: string):Coordinates | null{
  const info=getCountryInfo(geoCode)
  if(info!=null){
    return {lat:info.geo.latitude,lon:info.geo.longitude}
  }else{
    return null
  }
  
}