import { RegionInterestResult } from "@/types/interest";
import dayjs from "dayjs"
 
/**
 * 根据 RegionInterestResult、开始时间、结束时间和时间间隔生成时间段和兴趣值
 * @param regionInterestResult RegionInterestResult[geocode] 数据
 * @param startDate 开始时间
 * @param endDate 结束时间
 * @param interval 时间间隔（支持 'day' | 'month' | 'year'）
 * @returns { time_range: string[]; value: Array<number | null> }
 */
export const generateTimeRangeAndValues = (
  regionInterestResult: RegionInterestResult[string], // 具体某个 geo_code 的数据
  startDate: dayjs.Dayjs,
  endDate: dayjs.Dayjs,
  interval: 'day' | 'month' | 'year'
): { time_range: string[]; values: Array<number | null> } => {
  const time_range: string[] = [];
  const values: Array<number | null> = [];

  let currentDate = startDate;

  // 生成时间段
  while (currentDate.isBefore(endDate)) {
    let nextDate = currentDate;

    // 根据时间间隔增加日期
    switch (interval) {
      case 'day':
        nextDate = currentDate.add(1, 'day');
        break;
      case 'month':
        nextDate = currentDate.add(1, 'month');
        break;
      case 'year':
        nextDate = currentDate.add(1, 'year');
        break;
    }

    // 格式化时间段
    const formattedRange = `${currentDate.format('YYYY-MM-DD')} - ${nextDate.format('YYYY-MM-DD')}`;
    time_range.push(formattedRange);

    // 查找匹配的兴趣值
    const matchedInterest = regionInterestResult.find(interest => {
      const interestStart = dayjs(interest.timeframe_start);
      const interestEnd = dayjs(interest.timeframe_end);
      return currentDate.isSame(interestStart) && nextDate.isSame(interestEnd);
    });

    // 如果匹配则赋值，否则为 null
    values.push(matchedInterest ? matchedInterest.value : null);

    // 更新当前时间
    currentDate = nextDate;
  }
  // 2. 去除末尾连续 null
  let trimIndex = values.length;
  while (trimIndex > 0 && values[trimIndex - 1] === null) trimIndex--;

  return { time_range:time_range.slice(0,trimIndex), values:values.slice(0,trimIndex) };
};


  /**
 * 填充缺失数据
 * @param data 输入数据，包含 time_range 和 value
 * @param method 插值方法，支持 'linear'（线性插值）或 'nearest'（邻近插值）
 * @returns 处理后的数据
 */
export const fillMissingValuesAndTrim = (
    data: Array<number | null>,
    method: 'linear' | 'nearest'
  ): number[]|null => {
    const value = data;
  
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
  
    
  
    return filledValues as number[]
  };

  export const generateTimespans = (
    currentDate: string,
    startDate: dayjs.Dayjs,
    interval: 'day' | 'month' | 'year'
  ): number => {
    const start = startDate;
    const current = dayjs(currentDate);
  
    switch (interval) {
      case 'day':
        return current.diff(start, 'day');
      case 'month':
        return current.diff(start, 'month');
      case 'year':
        return current.diff(start, 'year');
      default:
        return 0;
    }
  };