import { useEffect } from "react";
import { useEditorStore } from "./store";
import type { EditorStore, PropsType } from "./types";

const useLink = () => {
  // 监听components变化
  useEffect(() => {
    const unsub = useEditorStore.subscribe(
      (state: EditorStore, prevState: EditorStore) => {
        const currentComponents = state.components;
        const prevComponents = prevState.components;
        const interlinked = state.interlinked;
        interlinked.forEach((link) => {
          const sourceComp = currentComponents.find(
            (comp) => comp.id === link.sourceId
          );
          const prevSourceComp = prevComponents.find(
            (comp) => comp.id === link.sourceId
          );
          const filter = link.props.filter(
            (k) => sourceComp?.props[k] != prevSourceComp?.props[k]
          );
          if (filter.length == 0) {
            return;
          }
          const changeProp = filter.reduce((acc, k) => {
            if (sourceComp?.props[k] !== undefined) {
              acc[k] = sourceComp.props[k];
            }
            return acc;
          }, {} as PropsType);
          state.updateProps(link.targetId, changeProp);
        });
      }
    );

    return unsub;
  }, []);
};

export default useLink;
