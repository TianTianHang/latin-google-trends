# 数据源管理API文档

## 数据模型

### DataSource 模型
```typescript
interface DataSource {
  id: string; // 数据源唯一标识
  type: 'api' | 'csv' | 'excel'; // 数据源类型
  config: {
    url?: string; // API URL (仅type=api时)
    method?: string; // HTTP方法 (仅type=api时)
    params?: Record<string, unknown>; // 请求参数 (仅type=api时)
    headers?: Record<string, string>; // 请求头 (仅type=api时)
    renderData?: string; // 数据转换函数 (仅type=api时)
    file?: File; // 文件对象 (仅type=csv/excel时)
  };
  createdAt: string; // 创建时间 ISO格式
  updatedAt: string; // 更新时间 ISO格式
}
```

## API端点

### 创建数据源
- **URL**: `POST /query/datasources/create`
- **请求体**:
```json
{
  "type": "api",
  "config": {
    "url": "https://api.example.com/data",
    "method": "GET",
    "renderData": "(data) => data.results"
  }
}
```
- **响应**:
```json
{
  "id": "ds_123",
  "type": "api",
  "config": {
    "url": "https://api.example.com/data",
    "method": "GET",
    "renderData": "(data) => data.results"
  },
  "createdAt": "2025-04-08T07:29:28Z",
  "updatedAt": "2025-04-08T07:29:28Z"
}
```

### 获取数据源列表
- **URL**: `GET /query/datasources/list`
- **响应**:
```json
[
  {
    "id": "ds_123",
    "type": "api",
    "config": {
      "url": "https://api.example.com/data"
    },
    "createdAt": "2025-04-08T07:29:28Z",
    "updatedAt": "2025-04-08T07:29:28Z"
  }
]
```

### 获取单个数据源
- **URL**: `GET /query/datasources/{id}`
- **响应**: 同创建接口返回格式

### 更新数据源
- **URL**: `PUT /query/datasources/list`
- **请求体**: 同创建接口
- **响应**: 同创建接口

### 删除数据源
- **URL**: `DELETE /query/datasources/{id}/delete`
- **响应**:
```json
{
  "message": "DataSource deleted"
}
```

## 错误响应
```json
{
  "error": "Error message",
  "code": 400
}