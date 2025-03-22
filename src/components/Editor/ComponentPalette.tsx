import { List, Typography } from "antd";
import { useComponentsStore, useLayoutsStore, useRegisteredComponentsStore } from "./stores";

export const ComponentPalette = () => {
  const { addComponent } = useComponentsStore();
  const { registered } = useRegisteredComponentsStore();
  const { currentLayouts } = useLayoutsStore();

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("componentType", type);
  };

  return (
    <List
      className="palette  bg-white"
      itemLayout="vertical"
      bordered
      dataSource={Array.from(registered.values())}
      renderItem={(r) => (
        <List.Item
          key={r.meta.type}
          className="palette-item"
          draggable
          onDragStart={(e) => handleDragStart(e, r.meta.type)}
          unselectable="on"
          onClick={() =>
            addComponent({
              type: r.meta.type,
              props: r.meta.defaultProps || {},
              position: currentLayouts.findIndex(layout=>!layout.i)
            })
          }
        >
          {r.meta.icon}
          <Typography.Text>{`${r.meta.name}`}</Typography.Text>
        </List.Item>
      )}
    />
  );
};
