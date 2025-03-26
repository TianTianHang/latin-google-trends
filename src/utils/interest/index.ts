import dayjs from "dayjs";

/**
 * 填充缺失数据
 * @param data 输入数据，包含 time_range 和 value
 * @param method 插值方法，支持 'linear'（线性插值）或 'nearest'（邻近插值）
 * @returns 处理后的数据
 */
export const fillMissingValuesAndTrim = (
  data: Array<number | null>,
  method: "linear" | "nearest"
): number[] | null => {
  const value = data;

  // 1. 插值填充缺失值
  const filledValues = value.map((val, index) => {
    if (val !== null) return val;

    // 线性插值
    if (method === "linear") {
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
    if (method === "nearest") {
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

  return filledValues as number[];
};

export const generateTimespans = (
  currentDate: string,
  startDate: dayjs.Dayjs,
  interval: "day" | "month" | "year"
): number => {
  const start = startDate;
  const current = dayjs(currentDate);

  switch (interval) {
    case "day":
      return current.diff(start, "day");
    case "month":
      return current.diff(start, "month");
    case "year":
      return current.diff(start, "year");
    default:
      return 0;
  }
};
