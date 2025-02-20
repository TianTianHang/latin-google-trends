export type TrainData = {
  geo_code: string; // 地理位置代码
  data: number[]; // 训练数据
  window_size: number; // 滑动窗口大小
};

export type PredictData = {
  id: string; // 模型ID
  data: number[]; // 预测数据
};
export type FitData = {
  timespans: number[];
  values: number[];
};
export type FitResponse = {
  status: "processing" | "completed" | "failed";
  progress?: number;
  result?: FitData;
};
