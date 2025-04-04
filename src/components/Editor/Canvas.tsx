import { Layout, Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import {
  useComponentsStore,
  useInterlinkedStore,
  useLayoutsStore,
} from "./stores";
import { useComponentRenderer } from "./hooks/useComponentRenderer";
import { useMemo, useState } from "react";
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
import { useBoolean, useInterval, useMount, useRequest, useUnmount } from "ahooks";

const ResponsiveGridLayout = WidthProvider(Responsive);
const responsiveMap = ["lg", "md", "sm", "xs", "xxs"];

export const Canvas = () => {
  const { components, deleteComponent } = useComponentsStore();
  const { currentLayouts, updateLayout } = useLayoutsStore();

  const { renderComponent } = useComponentRenderer();
  const reset = () => {
    useComponentsStore.getState().reset();
    useInterlinkedStore.getState().reset();
    useLayoutsStore.getState().reset();
  };
  useMount(() => {
    reset();
  });
  useUnmount(() => {
    reset();
  });
  
  const [menuVisible, { setTrue: showMenu, setFalse: hideMenu }] =
    useBoolean(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [editorVisible, { setTrue: showEditor, setFalse: hideEditor }] =
    useBoolean(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );
  const [editForm] = Form.useForm();
  const [linkForm] = Form.useForm();
  const [tabKey, setTabKey] = useState("1");
  const [currentSaveId] = useState<string>("default");

  // 加载数据
  interface SaveListItem {
    id: string;
    name: string;
    timestamp: number;
  }

  const [
    loadDrawerVisible,
    { setTrue: showLoadDrawer, setFalse: hideLoadDrawer },
  ] = useBoolean(false);
  const [saveList, setSaveList] = useState<SaveListItem[]>([]);

  const { run: handleLoad } = useRequest(
    async () => {
      showLoadDrawer();
      return saveService.getSaveList();
    },
    {
      manual: true,
      onSuccess: (saves) => {
        setSaveList(
          Object.values(saves).map((save) => ({
            id: save.id,
            name: save.name,
            timestamp: save.timestamp,
          }))
        );
      },
    }
  );

  const { loading: loadLoading, run: handleLoadConfirm } = useRequest(
    async (id?: string) => {
      const data = await saveService.load(id);
      if (!data) {
        message.info("没有找到保存的数据");
        return;
      }
      return data;
    },
    {
      manual: true,
      onSuccess: (data) => {
        if (data) {
          const { components, layouts, interlinks } = data;
          useComponentsStore.setState({ components });
          useLayoutsStore.setState({ currentLayouts: layouts });
          useInterlinkedStore.setState({ interlinked: interlinks });
          message.success("加载成功");
        }
      },
      onError: (error) => {
        message.error("加载失败");
        console.error("加载数据时出错:", error);
      },
    }
  );

  // 手动保存
  const [
    saveModalVisible,
    { setTrue: showSaveModal, setFalse: hideSaveModal },
  ] = useBoolean(false);
  const [saveForm] = Form.useForm();

  const handleSave = () => {
    showSaveModal();
  };

  const handleSaveModalCancel = hideSaveModal;

  const { run: handleSaveConfirm } = useRequest(
    async () => {
      const values = await saveForm.validateFields();
      return saveService.save(
        values.name,
        `${values.name}-${new Date().toLocaleString()}`
      );
    },
    {
      manual: true,
      onSuccess: (success) => {
        if (success) {
          message.success("保存成功");
          hideSaveModal();
        } else {
          message.error("保存失败");
        }
      },
      onError: (error) => {
        message.error("保存出错");
        console.error(error);
      },
    }
  );

  // 自动保存
  useInterval(() => {
    saveService.save(currentSaveId, `自动保存-${new Date().toLocaleString()}`);
  }, 30000);

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setSelectedComponentId(id);
    showMenu();
  };

  const handleClickOutside = () => {
    hideMenu();
    setMenuPosition({ x: 0, y: 0 });
  };

  const handleEdit = () => {
    console.log("Edit component:", selectedComponentId);
    showEditor();
    hideMenu();
  };

  const handleDelete = () => {
    console.log("Delete component:", selectedComponentId);
    if (selectedComponentId) {
      deleteComponent(selectedComponentId);
    }
    hideMenu();
  };

  const { layouts, missIds } = useMemo(() => {
    // 分类并保持原始索引顺序
    const layoutsWithIndex = currentLayouts.map((layout, index) => ({
      ...layout,
      originalIndex: index,
    }));

    // 根据条件分类布局，并保持原始索引顺序
    const emptyLayouts = layoutsWithIndex.filter((c) => c.i === "");
    const filledLayouts = layoutsWithIndex.filter((c) => c.i !== "");

    // 为缺少id的布局生成新的id
    const missIds = emptyLayouts.map((l) => `place-${l.originalIndex}`);

    // 合并filled和empty布局，更新empty布局的id
    const processedLayouts = [
      ...filledLayouts.map((c) => ({ ...c })),
      ...emptyLayouts.map((c, i) => ({ ...c, i: missIds[i] })),
    ].map((c) => {
      return c;
    });

    // 根据responsiveMap生成layouts对象
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
        loading={loadLoading}
        paragraph={{ rows: 18, width: ["100%", "80%", "60%", "40%", "20%"] }}
        title={{ width: "30%" }}
        style={{
          padding: 24,
          background: "#fff",
          borderRadius: 8,
          margin: "0 auto",
          maxWidth: 1200,
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
          draggableHandle=".cursor-move"
        >
          {missIds.map((id) => (
            <div key={id} onContextMenu={(e) => handleContextMenu(e, id)}>
              {/* 拖动手柄 */}
              <div
                className="absolute top-0 right-0 z-10 cursor-move opacity-0 transition-opacity duration-300 hover:opacity-100"
                style={{ width: "40px", height: "20px" }}
              >
                <div className="bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                  :::
                </div>
              </div>
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
            hideMenu();
          }}
        />
      )}
      <Modal
        open={editorVisible}
        onClose={hideEditor}
        onOk={() => {
          if (tabKey === "1") {
            editForm.submit();
          } else if (tabKey === "2") {
            linkForm.submit();
          }

          hideEditor();
        }}
        onCancel={hideEditor}
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
        onClose={hideLoadDrawer}
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
                    hideLoadDrawer();
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
