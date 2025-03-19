/* eslint-disable @typescript-eslint/no-unused-vars */
import { Layout, Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { useEditorStore } from "./store";
import { useEffect, useMemo, useState } from "react";
import RightClickMenu from "./RightClickMenu";
import { PropertyEditor } from "./PropertyEditor";
import "react-resizable/css/styles.css";
import { Card, Form, Modal, Tabs } from "antd";

import { LinkEditor } from "./LinkEditor";
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
    currentLayouts,
  } = useEditorStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );
  const [editForm] = Form.useForm();
  const [linkForm] =Form.useForm();
  const [tabKey,setTabKey]=useState("1");
  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setSelectedComponentId(id);
    setMenuVisible(true);
  };
  const handleClickOutside=()=>{
    setMenuVisible(false);
    setMenuPosition({x:0,y:0});
  }
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
  const [missIds, setMissIds] = useState<string[]>([]);
  useEffect(() => {
    const ids: string[] = [];
    const layout = currentLayouts.map((c, i) => {
      if (!c.i) {
        const id=`place-${i}`
        ids.push(id);
        return {
        ...c,
        i:id
      };
      }
      return c;
    }) as Layout[];
    const layouts: Record<string, Layout[]> = {};
    responsiveMap.forEach((r) => (layouts[r] = layout));
    setLayouts(layouts);
    setMissIds(ids);
  }, [currentLayouts]);

  // const _handleDrop = (_layout: Layout[], item: Layout, e: DragEvent) => {
  //   item.w = 4;
  //   const type = e.dataTransfer?.getData("componentType");
  //   if (type) {
  //     const r = registered.get(type);
  //     if (r) {
  //       addComponent({
  //         type: r.meta.type,
  //         props: r.meta.defaultProps || {},
  //         layout: item,
  //       });
  //     }
  //   }
  // };
  const handleDragStop = (
    layout: Layout[],
    _oldItem: Layout,
    _newItem: Layout,
    _placeholder: Layout,
    _event: MouseEvent,
    _element: HTMLElement
  ) => {
    // 在这里可以执行拖拽结束时的逻辑，例如保存新的位置
    updateLayout(layout);
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
        style={{ height: "100%" }}
        layouts={layouts}
        // onDrop={handleDrop}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        onDragStop={handleDragStop}
        isDroppable
        useCSSTransforms
        autoSize
      >
        {missIds.map((id) => (
          <div key={id} onContextMenu={(e) => handleContextMenu(e, id)}>
            <Card className="h-full w-full bg-blue-300 opacity-30 transition-opacity"/>
          </div>
        ))}
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
              
            </div>
          );
        })}
      </ResponsiveGridLayout>
      {menuVisible&&selectedComponentId&& (
        <RightClickMenu
          componentId={selectedComponentId}
          x={menuPosition.x}
          y={menuPosition.y}
          onEdit={handleEdit}
          onDelete={handleDelete} 
          onClickOutside={handleClickOutside}   
          onClose={()=>{setMenuVisible(false)}}     
          />
      )}
      <Modal
      open={editorVisible}
      onClose={() => setEditorVisible(false)}
      onOk={()=>{
        if(tabKey=="1"){
           editForm.submit();
        }else if(tabKey=="2"){
          linkForm.submit();
        }
      
        setEditorVisible(false);
      }}
      onCancel={()=>{
        setEditorVisible(false)
      }}
      >
        <Tabs activeKey={tabKey} 
        onChange={(key)=>setTabKey(key)}
        items={[{
            key:"1",
            label:"参数编辑",
            children:selectedComponentId && (
              <PropertyEditor
                  componentId={selectedComponentId} form={editForm}         
              />
            )
        },{
          key:"2",
          label:"联动属性编辑",
          children:selectedComponentId&&(
            <LinkEditor
              componentId={selectedComponentId} form={linkForm}/>
          )
        }]}  />

      </Modal>
      
    </div>
  );
};
