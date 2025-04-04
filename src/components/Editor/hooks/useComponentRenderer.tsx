import { useCallback } from "react";
import { useComponentsStore, useRegisteredComponentsStore } from "../stores";
import { ComponentData, PropsType } from "../stores/componentsStore";

export const useComponentRenderer = () => {
  const { components } = useComponentsStore();
  const { registered } = useRegisteredComponentsStore();

  const renderComponent = useCallback(
    (comp: ComponentData<PropsType>,isStatic=false) => {
      const Component = registered.get(comp.type)?.component;
      if (!Component) return null;

      return (
        <>
          {/* 拖动手柄 */}
          {isStatic?null:( <div
            className="absolute top-0 right-0 z-10 cursor-move opacity-0 transition-opacity duration-300 hover:opacity-100"
            style={{ width: "40px", height: "20px" }}
          >
            <div className="bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
              :::
            </div>
          </div>
)}
         
          <Component key={comp.id} {...comp.props} componentId={comp.id} />
        </>
      );
    },
    [registered]
  );

  return {
    renderComponent,
    components,
  };
};
