import React, { useEffect, useMemo, useRef, useState } from "react";

import { Menu, MenuProps, Popover, Spin, Typography } from "antd";
import { useEditorStore } from "./store";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { CheckOutlined } from "@ant-design/icons";

interface RightClickMenuProps {
  componentId: string;
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onClickOutside: () => void;
  onClose: () => void;
}
type MenuItem = Required<MenuProps>["items"][number];

const RightClickMenu: React.FC<RightClickMenuProps> = ({
  componentId,
  x,
  y,
  onEdit,
  onDelete,
  onClickOutside,
  onClose,
}) => {
  const { addComponent, registered, currentLayouts, components } =
    useEditorStore();
  const [position, setPosition] = useState<number>(-1);
  const [type, setType] = useState<string | undefined>(undefined);

  const componentsItems: MenuItem[] = useMemo(
    () =>
      Array.from(registered.values())
        .filter((r) => r.meta.type != type)
        .map((r) => ({
          key: r.meta.type,
          icon: r.meta.icon,
          label: r.meta.name,
          onClick: () => {
            addComponent({
              type: r.meta.type,
              props: r.meta.defaultProps || {},
              position: position,
            });
            onClose();
          },
        })),
    [addComponent, position, registered]
  );

  const { switchLayout, predefinedLayouts } = useEditorStore();

  const layoutItems: MenuItem[] = useMemo(() => {
    return predefinedLayouts.map((layout, index) => ({
      key: `layout-${index}`,
      label: (
        <Popover
          trigger="hover"
          placement={"right"}
          content={
            <div className="w-[300px] h-[150px]">
              <div className="grid grid-cols-12 grid-rows-4 gap-1 w-full h-full">
                {layout.layouts.map((item, i) => (
                  <div
                    key={i}
                    className={`bg-blue-300 opacity-30 ${
                      item.w ? `col-span-${item.w}` : ""
                    } ${item.h ? `row-span-${item.h}` : ""}`}
                    style={{
                      gridColumn: `${item.x + 1} / span ${item.w}`,
                      gridRow: `${item.y + 1} / span ${item.h}`,
                    }}
                  />
                ))}
              </div>
            </div>
          }
        >
          <div>
            <span>{layout.name}</span>
          </div>
        </Popover>
      ),
      onClick: () => {
        switchLayout(index);
        onClose();
      },
     
    }));
  }, [predefinedLayouts, switchLayout, onClose]);

  const { fetchAllSubjects, allSubjects, loading,selectSubject,currentSubject } = useSubjectStore();
  useEffect(() => {
    // 组件挂载时获取数据
    if(allSubjects.length>0) return;
    fetchAllSubjects();
  }, []);
  const subjectItems: MenuItem[] = useMemo(() => {
    if (loading) {
      return [
        {
          key: "loading",
          label: <Spin size="small" tip="Loading..." />,
          disabled: true,
        },
      ];
    }
    if (allSubjects.length == 0) {
      return [
        {
          key: "no-data",
          label: "No available subjects",
          disabled: true,
        },
      ];
    }
    return allSubjects.map((s) => ({
      key: `subject-${s.subject_id}`,
      label: (
        <Popover
          content={<Typography.Paragraph>{s.description}</Typography.Paragraph>}
          placement={"right"}
        >
          <div>
            {s.subject_id==currentSubject?.subject_id?<CheckOutlined style={{color:"green"}}/>:<></>}
            <Typography.Text className="w-full">{s.name}</Typography.Text>
          </div>
          
        </Popover>
      ),
      onClick:()=>{
        selectSubject(s.subject_id);
        onClose()
      }
    }));
  }, [allSubjects, currentSubject?.subject_id, loading, onClose, selectSubject]);

  const items: MenuItem[] = useMemo(() => {
    // 提取重叠的item部分
    const commonItems = [
      { label: "subject", children: subjectItems },
      { label: "布局切换", children: layoutItems },
      { label:"固定",onClick:()=>{onClose()}}
    ];
  
    const getMenuItems = (additionalItems: (Omit<MenuItem,"key">)[], startIndex: number) => {
      return additionalItems.map((item, index) => ({
        key: String(startIndex + index),
        ...item,
      }));
    };
  
    if (componentId.startsWith("place")) {
      setPosition(+componentId.split("-")[1]);
      return [
        { key: "0", label: "组件", children: componentsItems },
        { key: "1", label: "布局切换", children: layoutItems },
        ...getMenuItems(commonItems, 2),
      ];
    } else {
      setPosition(currentLayouts.findIndex((l) => l?.i && l.i === componentId));
      setType(components.find((comp) => comp.id === componentId)?.type);
      return [
        { key: "0", label: "删除", onClick: onDelete },
        { key: "1", label: "编辑", onClick: onEdit },
        { key: "2", label: "替换", children: componentsItems },
        ...getMenuItems(commonItems, 3),
      ];
    }
  }, [subjectItems, layoutItems, componentId, onClose, componentsItems, currentLayouts, components, onDelete, onEdit]);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const handleClick = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
      // 检查是否点击在Ant Design的子菜单弹出层上
      const submenuPopups = document.getElementsByClassName(
        "ant-menu-submenu-popup"
      );
      let isSubmenuClick = false;
      for (const popup of submenuPopups) {
        if (popup.contains(e.target as Node)) {
          isSubmenuClick = true;
          break;
        }
      }
      if (!isSubmenuClick) {
        onClickOutside();
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className="absolute z-1000"
      style={{
        left: x,
        top: y,
      }}
    >
      <Menu
        style={{
          boxShadow:
            "0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
        }}
        items={items}
      />
    </div>
  );
};

export default RightClickMenu;
