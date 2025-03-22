import { useCallback } from 'react';
import { useComponentsStore, useRegisteredComponentsStore } from '../stores';
import { ComponentData, PropsType } from '../stores/componentsStore';

export const useComponentRenderer = () => {
  const { components } = useComponentsStore();
  const { registered } = useRegisteredComponentsStore();

  const renderComponent = useCallback((comp: ComponentData<PropsType>) => {
    const Component = registered.get(comp.type)?.component;
    if (!Component) return null;

    return (
      <Component
        key={comp.id}
        {...comp.props}
        componentId={comp.id}
      />
    );
  }, [registered]);

  return {
    renderComponent,
    components
  };
};