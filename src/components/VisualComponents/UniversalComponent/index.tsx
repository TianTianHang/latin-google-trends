import { RegisteredComponent } from "@/components/Editor/stores/registeredComponentsStore";
import BarChart from "./BarChart";
import LineChart from "./LineChart";
import PieChart from "./PieChart";
import ScatterChart from "./ScatterChart";
import { useDataBinding } from "@/components/Editor/hooks/useDataBinding";
import { Empty } from 'antd';
import { useDataProviderStore } from "@/components/Editor/stores";
import { useMemo } from "react";
import { color } from "echarts";

// 创建可扩展的组件映射
const componentMap = {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  // 可在此处扩展新组件
} as const;

// 定义通用组件属性
export interface UniversalComponentProps {
  componentName: keyof typeof componentMap;
  data: Record<string, any>[];
  xKey: string;
  yKey: string;
  color?: string;
  componentId: string;
  sourceId: string;
  sortBy?: string;         // 新增排序字段
  sortOrder?: 'asc'|'desc';// 新增排序方向
}

const UniversalComponent: React.FC<UniversalComponentProps> = ({
  componentName,
  sourceId,
  componentId,
  data,
  sortBy,
  sortOrder = 'asc',
  ...props
}) => {
  useDataBinding(sourceId, componentId, "data")
  const TargetComponent = componentMap[componentName];
  
  // 新增排序逻辑
  const sortedData = useMemo(() => {
    if (!data?.length || !sortBy) return data;
    
    return [...data].sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      const modifier = sortOrder === 'asc' ? 1 : -1;
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return (valueA - valueB) * modifier;
      }
      return String(valueA).localeCompare(String(valueB)) * modifier;
    });
  }, [data, sortBy, sortOrder]);

  return TargetComponent ? (
    sortedData?.length ? (
      <TargetComponent {...props} data={sortedData} />
    ) : (
      <Empty 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="暂无可用数据"
        style={{ 
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100%'
        }}
      />
    )
  ) : null;
};

// 更新注册配置
export const registeredUniversalComponent: RegisteredComponent<UniversalComponentProps> = {
  meta: {
    type: "UniversalComponent",
    name: "universalComponent",
    icon: "📊",
    defaultProps: {
        componentName: "BarChart",
        data: [],
        xKey: "",
        yKey: "",
        componentId: "",
        sourceId: ""
    },
    propSchema: {
      componentName: {
        type: "select",
        label: "组件类型",
        options: Object.keys(componentMap).map(name => ({
          label: name,
          value: name
        }))
      },
      sourceId:{
        type: "text",
        label: "sourceId",
        // options: Array.from(useDataProviderStore.getState().dataSources.values())
        // .filter(ds=>!ds.id.startsWith("subject"))
        // .map(ds => ({
        //   label: ds.id,
        //   value: ds.id
        // }))
      },
      xKey: {
        type: "text",
        label: "xKey",
      },
      yKey: {
        type: "text",
        label: "yKey", 
       
      },
      color:{
        type: "select",
        label: "color",
        options: [
          { label: 'white', value: 'white' },
          { label: 'black', value: 'black' },
          { label: 'red', value: 'red' },
          { label: 'blue', value: 'blue' },
          { label: 'green', value: 'green' },
          { label: 'yellow', value: 'yellow' },
          { label: 'orange', value: 'orange' },
          { label: 'pink', value: 'pink' },
          { label: 'purple', value: 'purple' },
          { label: 'gray', value: 'gray' },
          { label: 'brown', value: 'brown' },
        ]
      },
      sortBy: {
        type: "text",
        label: "排序字段",
      
      },
      sortOrder: {
        type: "select",
        label: "排序方向",
        options: [
          { label: '升序', value: 'asc' },
          { label: '降序', value: 'desc' }
        ]
      }
    }
  },
  component: UniversalComponent
};

export default UniversalComponent;



