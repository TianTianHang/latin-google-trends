import { useEffect } from 'react';
import { useDataConsumerStore } from '../stores/dataConsumerStore';
/**
 * @description: 绑定数据
 * @param {sourceId}  sourceId 数据源id
 * @param {targetId}  targetId 组件id
 * @param {propName} propName 参数名
 * @return 返回数据
 */
export const useDataBinding = (
  sourceId: string,
  targetId: string,
  propName: string
) => {
  const { bindData, unbindData } = useDataConsumerStore();

  useEffect(() => {
    bindData(sourceId, targetId, propName);

    return () => {
      unbindData(sourceId, targetId);
    };
  }, [sourceId, targetId, propName, bindData, unbindData]);
};