import { useRef, useState, useEffect } from 'react';

export const useContainerSize = () => {
  const containerRef = useRef(null); // 组件容器的 ref
  const [size, setSize] = useState({ width: 0, height: 0 }); // 容器的尺寸状态

  useEffect(() => {
 
    if (!containerRef.current) return;
    
    const  observerRefValue = containerRef.current; 
    // 创建 ResizeObserver 监听容器尺寸变化
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect; // 获取容器的宽度和高度
      setSize({ width, height }); // 更新尺寸状态
    });

    // 开始监听容器
    resizeObserver.observe(observerRefValue);
   
    // 清理函数：组件卸载时取消监听
    return () => {
      if (observerRefValue) {
        resizeObserver.unobserve(observerRefValue);
      }
    };
  }, []);

  return { containerRef, size }; // 返回容器 ref 和尺寸
};
