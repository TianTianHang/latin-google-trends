import React, { useEffect } from "react";
import { Modal, Table, Input, Collapse } from "antd";
import { useRequest } from "ahooks";
import type { DataSource } from "./stores/dataProviderStore";
import { useDataProviderStore } from "./stores/dataProviderStore";

interface PreviewModalProps {
  visible: boolean;
  dataSource?: DataSource;
  onCancel: () => void;

}

const PreviewModal: React.FC<PreviewModalProps> = ({
  visible,
  dataSource,
  onCancel,
 
}) => {
  const [filterValue, setFilterValue] = React.useState("");

  const { data, loading, run } = useRequest(
    async () => {
      if (!dataSource) return [];
      const result = await useDataProviderStore
        .getState()
        .getData(dataSource.id);
      return Array.isArray(result) ? result : [result];
    },
    {
      manual: true,
      refreshDeps: [dataSource],
    }
  );

  const processedData = React.useMemo(() => {
    if (!data) return [];
    return data
  }, [data]);

  const filteredData =
    processedData?.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(filterValue.toLowerCase())
      )
    ) || [];

  const getColumns = (data: Record<string, unknown>[]) => {
    if (!data.length) return [];

    // 获取所有可能的key
    const keys = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => keys.add(key));
    });

    return Array.from(keys).map((key) => ({
      title: key,
      dataIndex: key,
      key: key,
      render: (value: unknown) => {
        // 优化：嵌套对象/数组缩略显示，鼠标悬停可查看完整内容
        if (typeof value === "object" && value !== null) {
          const jsonStr = JSON.stringify(value, null, 2);
          const maxLen = 60;
          const isLong = jsonStr.length > maxLen;
          const displayStr = isLong ? jsonStr.slice(0, maxLen) + "..." : jsonStr;
          return (
            <span title={jsonStr}>
              <pre style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                margin: 0,
                display: 'inline',
                maxWidth: 300,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{displayStr}</pre>
            </span>
          );
        }
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          return value;
        }
        return null;
      },
    }));
  };

  const renderTable = (
    data: Record<string, unknown>[],
    columns: {
      title: string;
      dataIndex: string;
      key: string;
      render?: (value: unknown) => React.ReactNode;
    }[]
  ) => (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      scroll={{ x: true,y:300 }}
      rowKey={(record, index) => index?.toString() || "key"}
      loading={loading}
    />
  );

  const renderContent = () => {
    if (!filteredData.length) return null;

    // 判断数据维度
    const is1D = !Array.isArray(filteredData[0]);
    const is2D =
      Array.isArray(filteredData[0]) && !Array.isArray(filteredData[0][0]);
    const is3D =
      Array.isArray(filteredData[0]) && Array.isArray(filteredData[0][0]);

    if (is1D) {
      // 1维数据直接渲染表格
      const columns = getColumns(filteredData);
      return renderTable(filteredData, columns);
    }

    if (is2D) {
      // 2维数据，第二维作为页码
      const columns = getColumns(filteredData[0]);
      return (
        <Table
          columns={columns}
          dataSource={filteredData.flat()}
          pagination={{
            total:filteredData.length*filteredData.length*100,
            pageSize: filteredData.length*100,
            showSizeChanger:false,
            onChange: (page) => {
              const start = filteredData.slice(0, page - 1).reduce((sum, arr) => sum + arr.length, 0);
              const end = start + filteredData[page - 1].length;
              return filteredData.flat().slice(start, end);
            },
          }}
          scroll={{ x: true,y:300 }}
          rowKey={(record, index) => index?.toString() || "key"}
          loading={loading}
        />
      );
    }

    if (is3D) {
      // 3维数据，使用Collapse变成两维
      return (
        <Collapse>
          {filteredData.map((data2D, pageIndex) => (
            <Collapse.Panel header={`Preview ${pageIndex + 1}`} key={pageIndex}>
              <Table

                columns={getColumns(data2D[0])}
                dataSource={data2D.flat()}
                pagination={{
                  total:data2D.length*data2D.length*100,
                  pageSize: data2D.length*100,
                  showSizeChanger:false,
                  onChange: (page) => {
                    const start = data2D.slice(0, page - 1).reduce((sum:number, arr:unknown[]) => sum + arr.length, 0);
                    const end = start + data2D[page - 1].length;
                    return data2D.flat().slice(start, end);
                  },
                }}
                scroll={{ x: true,y:300 }}
                rowKey={(record, index) => index?.toString() || "key"}
                loading={loading}
              />
            </Collapse.Panel>
          ))}
        </Collapse>
      );
    }

    return null;
  };

  useEffect(() => {
    if (visible && dataSource) {
      run();
    }
  }, [visible, dataSource, run]);

  return (
    <Modal
      title="数据预览"
      width={800}
      open={visible}
      onCancel={onCancel}
      footer={null}
    >
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="过滤数据"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          style={{ width: 200 }}
        />
      </div>
      {renderContent()}
    </Modal>
  );
};

export default PreviewModal;
