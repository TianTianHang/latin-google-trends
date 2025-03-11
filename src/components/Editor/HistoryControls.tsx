import { useEditorStore } from './store/editorStore';

export const HistoryControls = () => {
  const { undo, redo, past, future } = useEditorStore();
  
  return (
    <div className="history-controls">
      <button onClick={undo} disabled={past.length === 0}>撤销</button>
      <button onClick={redo} disabled={future.length === 0}>重做</button>
    </div>
  );
};