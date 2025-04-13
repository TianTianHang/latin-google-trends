import { useCallback, useMemo } from "react";
import { useComponentsStore, useRegisteredComponentsStore } from "../stores";
import { ComponentData, PropsType } from "../stores/componentsStore";
import React from "react";

// 使用React.memo优化拖动手柄组件
const DragHandle = React.memo(() => (
  <div
    className="absolute top-0 left-0 z-10 cursor-move opacity-0 transition-opacity duration-300 hover:opacity-100"
    style={{ width: "40px", height: "20px" }}
  >
    <div className="bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
      :::
    </div>
  </div>
));

// 使用React.memo优化组件渲染
const MemoizedComponent = React.memo(
  ({ Component, id, props }: { Component: React.ComponentType<any>; id: string; props: PropsType }) => {
    return <Component key={id} {...props} componentId={id} />;
  },
  (prevProps, nextProps) => {
    // 只有当组件类型变化或props变化时才重新渲染
    return (
      prevProps.Component === nextProps.Component &&
      prevProps.id === nextProps.id &&
      JSON.stringify(prevProps.props) === JSON.stringify(nextProps.props)
    );
  }
);

export const useComponentRenderer = () => {
  const { components } = useComponentsStore();
  const { registered } = useRegisteredComponentsStore();

  // 使用useMemo缓存组件映射
  const componentMap = useMemo(() => {
    const map = new Map();
    registered.forEach((reg, type) => {
      map.set(type, reg.component);
    });
    return map;
  }, [registered]);

  const renderComponent = useCallback(
    (comp: ComponentData<PropsType>, isStatic = false) => {
      const Component = componentMap.get(comp.type);
      if (!Component) return null;

      return (
        <>
          {/* 拖动手柄 */}
          {isStatic ? null : <DragHandle />}
          <MemoizedComponent Component={Component} id={comp.id} props={comp.props} />
        </>
      );
    },
    [componentMap]
  );

  return {
    renderComponent,
    components,
  };
};
