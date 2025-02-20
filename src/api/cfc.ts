import { FitData, FitResponse, PredictData, TrainData } from '@/types/cfc';
import http from '@/utils/request';

// api接口 - 统一保存接口url路径
const api = {
  train: '/query/cfc/train',  // 模型训练接口
  predict: '/query/cfc/predict',  // 模型预测接口
  fit: '/query/cfc/fit',
  fitProcess: '/query/cfc/fit/{task_id}'
};

/**
 * @description: 模型训练
 * @param {TrainData} data 训练参数
 * @return 返回训练结果
 */
export function trainModel(data: TrainData) {
  return http.post<{ message: string, model_id: string, model_save_path: string, geo_code: string, status: string }>(api.train, data);
}

/**
 * @description: 模型预测
 * @param {PredictData} data 预测参数
 * @return 返回预测结果
 */
export function predictModel(data: PredictData) {
  return http.post<{ prediction: number[] }>(api.predict, data);
}


// 添加进度查询接口
export async function getFitProgress(taskId: string) {
    const url=api.fitProcess.replace("{task_id}",taskId)
    return http.get<FitResponse>(url);
  }

/**
 * @description: 模型训练
 * @param {FitData} data 训练参数
 * @return 返回任务id
 */
export function fitModel(data: FitData) {
    return http.post<{ task_id: string,status?:string,result?:FitData }>(api.fit, data);
  }