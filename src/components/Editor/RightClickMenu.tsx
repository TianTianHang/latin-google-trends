import React, { useEffect, useMemo, useRef, useState } from "react";

import { Menu, Popover } from "antd";
import { useComponentsStore, useRegisteredComponentsStore, useLayoutsStore } from "./stores";


interface RightClickMenuProps {
  componentId: string;
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onClickOutside: () => void;
  onClose: () => void;
}
const RightClickMenu: React.FC<RightClickMenuProps> = ({
  componentId,
  x,
  y,
  onEdit,
  onDelete,
  onClickOutside,
  onClose,
}) => {
  const { addComponent, components } =
    useComponentsStore();
    const {registered}=useRegisteredComponentsStore();
    const {currentLayouts,switchLayout,predefinedLayouts}=useLayoutsStore();
  const [position, setPosition] = useState<number>(-1);
  const [type, setType] = useState<string | undefined>(undefined);

  const menuItems = useMemo(() => {
    const baseItems = [
      {
        key: "layout",
        label: "布局切换",
        children: predefinedLayouts.map((layout, index) => ({
          key: `layout-${index}`,
          label: (
            <Popover
              trigger="hover"
              placement="right"
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
              <span>{layout.name}</span>
            </Popover>
          ),
          onClick: () => {
            switchLayout(index);
            onClose();
          },
        })),
      },
      {
        key: "fixed",
        label: "固定",
        onClick: onClose,
      },
    ];

    const componentItems = Array.from(registered.values())
      .filter((r) => r.meta.type !== type)
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
      }));

    if (componentId.startsWith("place")) {
      setPosition(+componentId.split("-")[1]);
      return [
        {
          key: "components",
          label: "组件",
          children: componentItems,
        },
        ...baseItems,
      ];
    }

    setPosition(currentLayouts.findIndex((l) => l?.i && l.i === componentId));
    setType(components.find((comp) => comp.id === componentId)?.type);
    return [
      { key: "delete", label: "删除", onClick: onDelete },
      { key: "edit", label: "编辑", onClick: onEdit },
      {
        key: "replace",
        label: "替换",
        children: componentItems,
      },
      ...baseItems,
    ];
  }, [
    componentId,
    registered,
    type,
    position,
    predefinedLayouts,
    currentLayouts,
    components,
    addComponent,
    switchLayout,
    onClose,
    onDelete,
    onEdit,
  ]);

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
        items={menuItems}
      />
    </div>
  );
};

export default RightClickMenu;
