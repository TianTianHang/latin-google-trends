import { useSetState } from "ahooks";
import { Form, FormInstance, Input, Select } from "antd";
import { useEditorStore } from "./store";
import { useEffect } from "react";
import { intersection } from "lodash";

interface LinkEditorProps {
  componentId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: FormInstance<{ sourceId: string; targetId: string; props: string[] }>;
}

interface State {
  sourceId: string | null;
  targetId: string | null;
  sourceProps: string[];
  targetProps: string[];
}
export const LinkEditor: React.FC<LinkEditorProps> = ({
  componentId,
  form,
}) => {
  const { components, registered,addInterlink } = useEditorStore();
  const [state, setState] = useSetState<State>({
    sourceId: componentId,
    targetId: null,
    sourceProps: [],
    targetProps: [],
  });
  // 使用useEffect来更新状态
  useEffect(() => {
    // 更新selectedComponent
    const type = components.find((c) => c.id === state.sourceId)?.type;
    if (type) {
      const comp = registered.get(type);
      const propTypes = comp?.meta.propSchema;
      if (propTypes) {
        setState({ sourceProps: Object.keys(propTypes) });
      }
    }
  }, [components, registered, setState, state.sourceId]);
  useEffect(() => {
    // 更新selectedComponent
    const type = components.find((c) => c.id === state.targetId)?.type;
    if (type) {
      const comp = registered.get(type);
      const propTypes = comp?.meta.propSchema;
      if (propTypes) {
        setState({ targetProps: Object.keys(propTypes) });
      }
    }
  }, [components, registered, setState, state.targetId]);
  const formItems = (
    <>
      <Form.Item key={"sourceId"} name={"sourceId"} label={"Source Id"}>
        <Input defaultValue={state.sourceId ?? ""} disabled />
      </Form.Item>
      <Form.Item key={"targetId"} name={"targetId"} label={"Target Id"}>
        <Select
          value={state.targetId}
          onChange={(value) => setState({ targetId: value })}
          options={components
            .filter((c) => c.id != componentId)
            .map((comp) => ({
              key: comp.id,
              label: `${comp.type}-${comp.id}`,
              value: comp.id,
            }))}
        />
      </Form.Item>
      <Form.Item key={"props"} name={"props"} label={"Props"}>
        <Select
          options={intersection(state.sourceProps,state.targetProps).map((item) => ({
            key: item,
            label: item,
            value: item,
          }))}
          mode={"multiple"}
          disabled={
            state.sourceProps.length == 0 &&state.targetProps.length>0 ||state.targetProps.length == 0
          }
        />
      </Form.Item>
    </>
  );
  return <Form 
  form={form}
  onFinish={({targetId,props})=>{
    addInterlink(state.sourceId,targetId,props)
  }}
  >{formItems}</Form>;
};
