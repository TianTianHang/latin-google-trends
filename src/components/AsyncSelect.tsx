import { Select, SelectProps, Spin } from 'antd';
import { useRequest } from 'ahooks';
import { useMemo } from 'react';

export interface AsyncSelectProps extends Omit<SelectProps,"options"> {
  options?: Array<{ label: string; value: string | number | null }> | (() => Array<{ label: string; value: string | number | null }>) | (()=>Promise<Array<{ label: string; value: string | number | null }>>);
}

export const AsyncSelect: React.FC<AsyncSelectProps> = ({ options, ...props }) => {
  const { data, loading } = useRequest(async () => {
    if (!options) return [];
    
    // 处理数组类型
    if (Array.isArray(options)) {
      return options;
    }
    
    // 处理函数类型
    if (typeof options === 'function') {
      const result = options();
      // 如果返回的是Promise
      if (result instanceof Promise) {
        return await result;
      }
      return result;
    }
       
    return [];
  }, {
    refreshDeps: [options]
  });

  const selectOptions = useMemo(() => {
    return data || [];
  }, [data]);

  return (
    <Select
      {...props}
      options={selectOptions}
      notFoundContent={loading ? <Spin size="small" /> : props.notFoundContent}
    />
  );
};
