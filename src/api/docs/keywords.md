以下是 `tag` 为 `keywords` 的接口定义：

### 1. 创建关键词

**接口路径**：`/query/keywords/words/create`
**请求方法**：`POST`
**请求体**：

```json
{
  "word": "string",
  "pronunciation": "string",
  "category_id": integer
}
```

**响应**：

- **200**：成功响应
  ```json
  {
    "word": "string",
    "pronunciation": "string",
    "category_id": integer,
    "id": integer,
    "created_at": "date-time",
    "updated_at": "date-time"
  }
  ```
- **422**：验证错误

### 2. 获取关键词详情

**接口路径**：`/query/query/keywords/words/{keyword_id}`**请求方法**：`GET`**路径参数**：

- `keyword_id`：整数，关键词 ID**响应**：
- **200**：成功响应
  ```json
  {
    "word": "string",
    "pronunciation": "string",
    "category_id": integer,
    "id": integer,
    "created_at": "date-time",
    "updated_at": "date-time",
    "definitions": [
      {
        "word_id": integer,
        "definition": "string",
        "is_primary": boolean,
        "id": integer,
        "created_at": "date-time",
        "updated_at": "date-time"
      }
    ],
    "category": {
      "name": "string",
      "description": "string",
      "parent_id": integer,
      "id": integer,
      "created_at": "date-time",
      "updated_at": "date-time",
      "words": [],
      "children": []
    }
  }
  ```
- **422**：验证错误

### 3. 更新关键词

**接口路径**：`/query/keywords/words/{keyword_id}/update`**请求方法**：`PUT`**路径参数**：

- `keyword_id`：整数，关键词 ID
  **请求体**：

```json
{
  "word": "string",
  "pronunciation": "string",
  "category_id": integer
}
```

**响应**：

- **200**：成功响应
  ```json
  {
    "word": "string",
    "pronunciation": "string",
    "category_id": integer,
    "id": integer,
    "created_at": "date-time",
    "updated_at": "date-time"
  }
  ```
- **422**：验证错误

### 4. 删除关键词

**接口路径**：`/query/keywords/words/{keyword_id}/delete`**请求方法**：`DELETE`**路径参数**：

- `keyword_id`：整数，关键词 ID**响应**：
- **200**：成功响应
  ```json
  {
    "word": "string",
    "pronunciation": "string",
    "category_id": integer,
    "id": integer,
    "created_at": "date-time",
    "updated_at": "date-time"
  }
  ```
- **422**：验证错误

### 5. 创建定义

**接口路径**：`/query/keywords/definitions/create`
**请求方法**：`POST`
**请求体**：

```json
{
  "word_id": integer,
  "definition": "string",
  "is_primary": boolean
}
```

**响应**：

- **200**：成功响应
  ```json
  {
    "word_id": integer,
    "definition": "string",
    "is_primary": boolean,
    "id": integer,
    "created_at": "date-time",
    "updated_at": "date-time"
  }
  ```
- **422**：验证错误

### 6. 获取定义详情

**接口路径**：`/query/keywords/definitions/{definition_id}`**请求方法**：`GET`**路径参数**：

- `definition_id`：整数，定义 ID**响应**：
- **200**：成功响应
  ```json
  {
    "word_id": integer,
    "definition": "string",
    "is_primary": boolean,
    "id": integer,
    "created_at": "date-time",
    "updated_at": "date-time"
  }
  ```
- **422**：验证错误

### 7. 更新定义

**接口路径**：`/query/keywords/definitions/{definition_id}/update`**请求方法**：`PUT`**路径参数**：

- `definition_id`：整数，定义 ID
  **请求体**：

```json
{
  "word_id": integer,
  "definition": "string",
  "is_primary": boolean
}
```

**响应**：

- **200**：成功响应
  ```json
  {
    "word_id": integer,
    "definition": "string",
    "is_primary": boolean,
    "id": integer,
    "created_at": "date-time",
    "updated_at": "date-time"
  }
  ```
- **422**：验证错误

### 8. 删除定义

**接口路径**：`/query/keywords/definitions/{definition_id}/delete`**请求方法**：`DELETE`**路径参数**：

- `definition_id`：整数，定义 ID**响应**：
- **200**：成功响应
  ```json
  {
    "word_id": integer,
    "definition": "string",
    "is_primary": boolean,
    "id": integer,
    "created_at": "date-time",
    "updated_at": "date-time"
  }
  ```
- **422**：验证错误

### 9. 创建分类

**接口路径**：`/query/keywords/categories/create`
**请求方法**：`POST`
**请求体**：

```json
{
  "name": "string",
  "description": "string",
  "parent_id": integer
}
```

**响应**：

- **200**：成功响应
  ```json
  {
    "name": "string",
    "description": "string",
    "parent_id": integer,
    "id": integer,
    "created_at": "date-time",
    "updated_at": "date-time",
    "words": [],
    "children": []
  }
  ```
- **422**：验证错误

### 10. 获取分类详情

**接口路径**：`/query/keywords/categories/{category_id}`**请求方法**：`GET`**路径参数**：

- `category_id`：整数，分类 ID**响应**：
- **200**：成功响应
  ```json
  {
    "name": "string",
    "description": "string",
    "parent_id": integer,
    "id": integer,
    "created_at": "date-time",
    "updated_at": "date-time",
    "children": []
  }
  ```
- **422**：验证错误

### 11. 更新分类

**接口路径**：`/query/keywords/categories/{category_id}/update`**请求方法**：`PUT`**路径参数**：

- `category_id`：整数，分类 ID
  **请求体**：

```json
{
  "name": "string",
  "description": "string",
  "parent_id": integer
}
```

**响应**：

- **200**：成功响应
  ```json
  {
    "name": "string",
    "description": "string",
    "parent_id": integer,
    "id": integer,
    "created_at": "date-time",
    "updated_at": "date-time",
    "children": []
  }
  ```
- **422**：验证错误

### 12. 删除分类

**接口路径**：`/query/keywords/categories/{category_id}/delete`**请求方法**：`DELETE`**路径参数**：

- `category_id`：整数，分类 ID**响应**：
- **200**：成功响应
  ```json
  {
    "name": "string",
    "description": "string",
    "parent_id": integer,
    "id": integer,
    "created_at": "date-time",
    "updated_at": "date-time",
    "children": []
  }
  ```
- **422**：验证错误

### 13. 获取关键词列表

**接口路径**：`/query/keywords/words/list`**请求方法**：`GET`**响应**：

- **200**：成功响应
  ```json
  [
    {
      "word": "string",
      "pronunciation": "string",
      "category_id": integer,
      "id": integer,
      "created_at": "date-time",
      "updated_at": "date-time",
      "definitions": [],
      "category": {}
    }
  ]
  ```

### 14. 获取分类列表

**接口路径**：`/query/keywords/categories/list`**请求方法**：`GET`**响应**：

- **200**：成功响应
  ```json
  [
    {
      "name": "string",
      "description": "string",
      "parent_id": integer,
      "id": integer,
      "created_at": "date-time",
      "updated_at": "date-time",
      "children": []
    }
  ]
  ```
