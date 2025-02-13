import { RegionInterestResult } from "@/types/interest";
import dayjs from "dayjs"
 
/**
 * 根据 RegionInterestResult、开始时间、结束时间和时间间隔生成时间段和兴趣值
 * @param regionInterestResult RegionInterestResult[geocode] 数据
 * @param startDate 开始时间
 * @param endDate 结束时间
 * @param interval 时间间隔（支持 'day' | 'month' | 'year'）
 * @returns { time_range: string[], value: number[] }
 */
export const generateTimeRangeAndValues = (
    regionInterestResult: RegionInterestResult[string], // 具体某个 geo_code 的数据
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'month' | 'year'
  ): { time_range: string[]; value: Array<number | null> } => {
    const time_range: string[] = [];
    const value: Array<number | null> = [];
  
    let currentDate = new Date(startDate);
  
    // 生成时间段
    while (currentDate <= endDate) {
      const nextDate = new Date(currentDate);
      switch (interval) {
        case 'day':
          nextDate.setDate(currentDate.getDate() + 1);
          break;
        case 'month':
          nextDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'year':
          nextDate.setFullYear(currentDate.getFullYear() + 1);
          break;
      }
  
      // 格式化时间段
      const formattedRange = `${dayjs(currentDate,'yyyy-MM-dd')} ${dayjs(nextDate,'yyyy-MM-dd')}`;
      time_range.push(formattedRange);
  
      // 查找匹配的兴趣值
      const matchedInterest = regionInterestResult.find(interest => {
        const interestStart = new Date(interest.timeframe_start);
        const interestEnd = new Date(interest.timeframe_end);
        return currentDate >= interestStart && nextDate <= interestEnd;
      });
  
      // 如果匹配则赋值，否则为 null
      value.push(matchedInterest ? matchedInterest.value : null);
  
      // 更新当前时间
      currentDate = nextDate;
    }
  
    return { time_range, value };
  };


  /**
 * 填充缺失数据并去除末尾连续 null
 * @param data 输入数据，包含 time_range 和 value
 * @param method 插值方法，支持 'linear'（线性插值）或 'nearest'（邻近插值）
 * @returns 处理后的数据
 */
export const fillMissingValuesAndTrim = (
    data: {
      time_range: string[];
      value: Array<number | null>;
    },
    method: 'linear' | 'nearest'
  ): { time_range: string[]; value: number[] } => {
    const { time_range, value } = data;
  
    // 1. 插值填充缺失值
    const filledValues = value.map((val, index) => {
      if (val !== null) return val;
  
      // 线性插值
      if (method === 'linear') {
        let prevIndex = index - 1;
        let nextIndex = index + 1;
  
        // 找到前一个非 null 值
        while (prevIndex >= 0 && value[prevIndex] === null) prevIndex--;
        // 找到后一个非 null 值
        while (nextIndex < value.length && value[nextIndex] === null) nextIndex++;
  
        if (prevIndex >= 0 && nextIndex < value.length) {
          const prevVal = value[prevIndex]!;
          const nextVal = value[nextIndex]!;
          const weight = (index - prevIndex) / (nextIndex - prevIndex);
          return prevVal + (nextVal - prevVal) * weight;
        }
      }
  
      // 邻近插值
      if (method === 'nearest') {
        let prevIndex = index - 1;
        let nextIndex = index + 1;
  
        // 找到前一个非 null 值
        while (prevIndex >= 0 && value[prevIndex] === null) prevIndex--;
        // 找到后一个非 null 值
        while (nextIndex < value.length && value[nextIndex] === null) nextIndex++;
  
        if (prevIndex >= 0 && nextIndex < value.length) {
          const prevVal = value[prevIndex]!;
          const nextVal = value[nextIndex]!;
          return index - prevIndex <= nextIndex - index ? prevVal : nextVal;
        }
      }
  
      // 如果无法插值，返回 null
      return null;
    });
  
    // 2. 去除末尾连续 null
    let trimIndex = filledValues.length;
    while (trimIndex > 0 && filledValues[trimIndex - 1] === null) trimIndex--;
  
    return {
      time_range: time_range.slice(0, trimIndex),
      value: filledValues.slice(0, trimIndex) as number[], // 移除 null，确保返回类型为 number[]
    };
  };