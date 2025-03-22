import { Layout, Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import {
  useComponentsStore,
  useInterlinkedStore,
  useLayoutsStore,
} from "./stores";
import { useComponentRenderer } from "./hooks/useComponentRenderer";
import { useCallback, useEffect, useMemo, useState } from "react";
import RightClickMenu from "./RightClickMenu";
import { PropertyEditor } from "./PropertyEditor";
import "react-resizable/css/styles.css";
import {
  Card,
  Form,
  Modal,
  Tabs,
  Button,
  message,
  Input,
  Drawer,
  List,
  Skeleton,
} from "antd";
import { LinkEditor } from "./LinkEditor";
import { saveService } from "./services/saveService";

const ResponsiveGridLayout = WidthProvider(Responsive);
const responsiveMap = ["lg", "md", "sm", "xs", "xxs"];

export const Canvas = () => {
  const { components, deleteComponent } = useComponentsStore();
  const { currentLayouts, updateLayout } = useLayoutsStore();
  const { renderComponent } = useComponentRenderer();

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );
  const [editForm] = Form.useForm();
  const [linkForm] = Form.useForm();
  const [tabKey, setTabKey] = useState("1");
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>();
  const [currentSaveId] = useState<string>("default");

  // 加载数据
  interface SaveListItem {
    id: string;
    name: string;
    timestamp: number;
  }

  const [loadDrawerVisible, setLoadDrawerVisible] = useState(false);
  const [saveList, setSaveList] = useState<SaveListItem[]>([]);

  const handleLoad = () => {
    const saves = saveService.getSaveList();
    setSaveList(
      Object.values(saves).map((save) => ({
        id: save.id,
        name: save.name,
        timestamp: save.timestamp,
      }))
    );
    setLoadDrawerVisible(true);
  };
  const [loading, setLoading] = useState(false);

  const handleLoadConfirm = useCallback(async (id?: string) => {
    setLoading(true);
    try {
      const data = saveService.loadFromLocalStorage(id);
      if (data) {
        const { components, layouts, interlinks } = data;
        useComponentsStore.setState({ components });
        useLayoutsStore.setState({ currentLayouts: layouts });
        useInterlinkedStore.setState({ interlinked: interlinks });
        message.success("加载成功");
      } else {
        message.info("没有找到保存的数据");
      }
    } catch (error) {
      message.error("加载失败");
      console.error("加载数据时出错:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 手动保存
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveForm] = Form.useForm();

  const handleSave = async () => {
    setSaveModalVisible(true);
  };

  const handleSaveModalCancel = () => {
    setSaveModalVisible(false);
  };

  const handleSaveConfirm = async () => {
    try {
      const values = await saveForm.validateFields();
      const success = saveService.saveToLocalStorage(values.id, values.name);
      if (success) {
        message.success("保存成功");
        setSaveModalVisible(false);
      } else {
        message.error("保存失败");
      }
    } catch (error) {
      message.error("保存出错");
      console.error(error);
    }
  };

  // 自动保存
  useEffect(() => {
    const interval = setInterval(() => {
      saveService.saveToLocalStorage(
        currentSaveId,
        `自动保存-${new Date().toLocaleString()}`
      );
    }, 30000); // 每30秒自动保存一次
    setAutoSaveInterval(interval);

    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    };
  }, [currentSaveId]);

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setSelectedComponentId(id);
    setMenuVisible(true);
  };

  const handleClickOutside = () => {
    setMenuVisible(false);
    setMenuPosition({ x: 0, y: 0 });
  };

  const handleEdit = () => {
    console.log("Edit component:", selectedComponentId);
    setEditorVisible(true);
    setMenuVisible(false);
  };

  const handleDelete = () => {
    console.log("Delete component:", selectedComponentId);
    if (selectedComponentId) {
      deleteComponent(selectedComponentId);
    }
    setMenuVisible(false);
  };

  const { layouts, missIds } = useMemo(() => {
    const emptyLayouts = currentLayouts.filter((c: Layout) => c.i === "");
    const filledLayouts = currentLayouts.filter((c: Layout) => c.i !== "");

    const missIds = emptyLayouts.map((_, i) => `place-${i}`);

    const processedLayouts = [
      ...filledLayouts,
      ...emptyLayouts.map((c, i) => ({
        ...c,
        i: missIds[i],
      })),
    ];

    const layouts = responsiveMap.reduce((acc, r) => {
      acc[r] = processedLayouts;
      return acc;
    }, {} as Record<string, Layout[]>);

    return { layouts, missIds };
  }, [currentLayouts]);

  const handleDragStop = (layout: Layout[]) => {
    updateLayout(
      layout.map((l) => {
        if (l.i.startsWith("place")) {
          return { ...l, i: "" };
        } else {
          return l;
        }
      })
    );
  };

  return (
    <div className="h-screen">
      <div className="absolute top-2 right-150 z-50 flex gap-2">
        <Button type="primary" onClick={handleLoad}>
          加载
        </Button>
        <Button type="primary" onClick={handleSave}>
          保存
        </Button>
      </div>
      <Skeleton
        active
        loading={loading}
        paragraph={{ rows: 18, width: ['100%', '80%', '60%', '40%', '20%'] }}
        title={{ width: '30%' }}
        style={{
          padding: 24,
          background: '#fff',
          borderRadius: 8,
          margin: '0 auto',
          maxWidth: 1200
        }}
      >
        <ResponsiveGridLayout
          className="layout"
          style={{ height: "100%" }}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          onDragStop={handleDragStop}
          isDroppable
          useCSSTransforms
          autoSize
        >
          {missIds.map((id) => (
            <div key={id} onContextMenu={(e) => handleContextMenu(e, id)}>
              <Card className="h-full w-full bg-blue-300 opacity-30 transition-opacity" />
            </div>
          ))}
          {components.map((comp) => (
            <div
              key={comp.id}
              onContextMenu={(e) => handleContextMenu(e, comp.id)}
            >
              {renderComponent(comp)}
            </div>
          ))}
        </ResponsiveGridLayout>
      </Skeleton>

      {menuVisible && selectedComponentId && (
        <RightClickMenu
          componentId={selectedComponentId}
          x={menuPosition.x}
          y={menuPosition.y}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClickOutside={handleClickOutside}
          onClose={() => {
            setMenuVisible(false);
          }}
        />
      )}
      <Modal
        open={editorVisible}
        onClose={() => setEditorVisible(false)}
        onOk={() => {
          if (tabKey === "1") {
            editForm.submit();
          } else if (tabKey === "2") {
            linkForm.submit();
          }

          setEditorVisible(false);
        }}
        onCancel={() => {
          setEditorVisible(false);
        }}
      >
        <Tabs
          activeKey={tabKey}
          onChange={(key) => setTabKey(key)}
          items={[
            {
              key: "1",
              label: "参数编辑",
              children: selectedComponentId && (
                <PropertyEditor
                  componentId={selectedComponentId}
                  form={editForm}
                />
              ),
            },
            {
              key: "2",
              label: "联动属性编辑",
              children: selectedComponentId && (
                <LinkEditor componentId={selectedComponentId} form={linkForm} />
              ),
            },
          ]}
        />
      </Modal>

      <Modal
        title="保存当前状态"
        open={saveModalVisible}
        onOk={handleSaveConfirm}
        onCancel={handleSaveModalCancel}
      >
        <Form form={saveForm} layout="vertical">
          <Form.Item
            name="name"
            label="保存名称"
            rules={[{ required: true, message: "请输入保存名称" }]}
          >
            <Input placeholder="请输入保存名称" />
          </Form.Item>
        </Form>
      </Modal>
      <Drawer
        title="选择存档"
        placement="right"
        onClose={() => setLoadDrawerVisible(false)}
        open={loadDrawerVisible}
        width={400}
        extra={
          <Button
            type="link"
            onClick={() => {
              const saveList = saveService.getSaveList();
              setSaveList(
                Object.entries(saveList).map(([id, save]) => ({
                  id,
                  name: save.name,
                  timestamp: save.timestamp,
                }))
              );
            }}
          >
            刷新
          </Button>
        }
      >
        <List
          dataSource={saveList}
          loading={!saveList.length}
          locale={{ emptyText: "暂无存档" }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  danger
                  onClick={async () => {
                    saveService.deleteSave(item.id);
                    setSaveList(saveList.filter((save) => save.id !== item.id));
                    message.success("删除成功");
                  }}
                >
                  删除
                </Button>,
                <Button
                  type="link"
                  onClick={() => {
                    handleLoadConfirm(item.id);
                    setLoadDrawerVisible(false);
                  }}
                >
                  加载
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={<span style={{ fontWeight: 500 }}>{item.name}</span>}
                description={
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>
                      保存时间：{new Date(item.timestamp).toLocaleString()}
                    </span>
                    <span style={{ color: "#999", fontSize: 12 }}>
                      存档ID：{item.id}
                    </span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
};
