/* eslint-disable @typescript-eslint/no-unused-vars */
import { Layout, Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { useEditorStore } from "./store";
import { useEffect, useMemo, useState } from "react";
import RightClickMenu from "./RightClickMenu";
import { PropertyEditor } from "./PropertyEditor";
//import 'react-resizable/css/styles.css'
const ResponsiveGridLayout = WidthProvider(Responsive);
const responsiveMap = ["lg", "md", "sm", "xs", "xxs"];
export const Canvas = () => {
  const {
    components,
    registered,
    addComponent,
    updateLayout,
    deleteComponent,
    updateProps,
  } = useEditorStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setSelectedComponentId(id);
    setMenuVisible(true);
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

  const [layouts, setLayouts] = useState({});
  useEffect(() => {
    const layout = components.map((c) => c.layout);
    const layouts: Record<string, Layout[]> = {};
    responsiveMap.forEach((r) => (layouts[r] = layout));
    setLayouts(layouts);
  }, [components]);
  const handleDrop = (_layout: Layout[], item: Layout, e: DragEvent) => {
    item.w=4
    const type = e.dataTransfer?.getData("componentType");
    if (type) {
      const r = registered.get(type);
      if (r) {
        addComponent({
          type: r.meta.type,
          props: r.meta.defaultProps || {},
          layout: item,
        });
      }
    }
  };
  const handleDragStop = (
    layout: Layout[],
    _oldItem: Layout,
    _newItem: Layout,
    _placeholder: Layout,
    _event: MouseEvent,
    _element: HTMLElement
  ) => {
    
    // 在这里可以执行拖拽结束时的逻辑，例如保存新的位置
    layout.forEach((l) => {
      updateLayout(l.i, l);
    });
  };
  const _handleResize = (
    _layout: Layout[],
    _oldItem: Layout,
    newItem: Layout,
    _placeholder: Layout,
    _event: MouseEvent,
    element: HTMLElement
  ) => {
    const width = element.parentElement?.offsetWidth;
    const height = element.parentElement?.offsetHeight;
    console.log(element, width, height);
    updateProps(newItem.i, { width, height });
  };
  return (
    <div className="h-screen">
      <ResponsiveGridLayout
        className="layout"
        style={{height:"100%"}}
        layouts={layouts}
        onDrop={handleDrop}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        onDragStop={handleDragStop}
        isDroppable
        useCSSTransforms
        autoSize
      >
        {components.map((comp) => {
          const Component = registered.get(comp.type)?.component;
          if (!Component) return null; // 或者处理组件未找到的情况
          const props = comp.props as React.ComponentProps<typeof Component>;
          return (
            <div
              key={comp.id}
              onContextMenu={(e) => handleContextMenu(e, comp.id)}
            >
              <Component {...props} />
              <div className="hidden">
                {JSON.stringify(comp.props, null, 2)}
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
      {menuVisible && (
        <RightClickMenu
          x={menuPosition.x}
          y={menuPosition.y}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {selectedComponentId && (
        <PropertyEditor
          componentId={selectedComponentId}
          visible={editorVisible}
          onClose={() => setEditorVisible(false)}
        />
      )}
    </div>
  );
};
