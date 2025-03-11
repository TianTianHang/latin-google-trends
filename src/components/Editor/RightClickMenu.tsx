import React from "react";
import { Menu, MenuProps } from "antd";

interface RightClickMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
}
type MenuItem = Required<MenuProps>["items"][number];

const RightClickMenu: React.FC<RightClickMenuProps> = ({
  x,
  y,
  onEdit,
  onDelete,
}) => {
  const items: MenuItem[] = [
    { key: "1", label: "删除", onClick: onDelete },
    { key: "2", label: "编辑", onClick: onEdit },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 1000,
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
