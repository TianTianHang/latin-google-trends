import { useEffect, useRef } from 'react';
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
  
  // 使用ref保存上一次的参数，避免不必要的重新绑定
  const prevParamsRef = useRef({ sourceId, targetId, propName });

  useEffect(() => {
    const prevParams = prevParamsRef.current;
    
    // 只有当参数变化时才重新绑定数据
    if (true||
      prevParams.sourceId !== sourceId ||
      prevParams.targetId !== targetId ||
      prevParams.propName !== propName
    ) {
      // 如果之前已经绑定了数据，先解绑
      if (prevParams.sourceId && prevParams.targetId) {
        unbindData(prevParams.sourceId, prevParams.targetId);
      }
      
      // 绑定新数据
      bindData(sourceId, targetId, propName);
      
      // 更新ref
      prevParamsRef.current = { sourceId, targetId, propName };
    }

    return () => {
      unbindData(sourceId, targetId);
    };
  }, [sourceId, targetId, propName, bindData, unbindData]);
};