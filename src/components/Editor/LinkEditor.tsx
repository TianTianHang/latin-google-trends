import { useSetState } from "ahooks";
import { Form, FormInstance, Input, Select, Switch } from "antd";
import { useEffect } from "react";
import { intersection } from "lodash";
import { useComponentsStore, useRegisteredComponentsStore, useInterlinkedStore } from "./stores";

interface LinkEditorProps {
  componentId: string;
 
  form: FormInstance<{ 
    sourceId: string; 
    targetId: string; 
    props: string[];
    bidirectional:boolean;
   }>;
}

interface State {
  sourceId: string | null;
  targetId: string | null;
  sourceProps: string[];
  targetProps: string[];
  isBidirectional: boolean;
  existingLinks: Array<{
    targetId: string;
    props: string[];
    isBidirectional: boolean;
  }>;
}
export const LinkEditor: React.FC<LinkEditorProps> = ({
  componentId,
  form,
}) => {
  const { components} = useComponentsStore();
  const {registered} =useRegisteredComponentsStore();
  const {addInterlink} =useInterlinkedStore();
  const [state, setState] = useSetState<State>({
    sourceId: componentId,
    targetId: null,
    sourceProps: [],
    targetProps: [],
    isBidirectional: false,
    existingLinks: [],
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
      <Form.Item key={"existingLinks"} label={"Existing Links"}>
        <ul>
          {state.existingLinks.map((link, index) => (
            <li key={index}>
              {link.targetId} - {link.props.join(', ')}
              {link.isBidirectional && ' (Bidirectional)'}
            </li>
          ))}
        </ul>
      </Form.Item>
      <Form.Item key={"bidirectional"} name={"bidirectional"} label={"Bidirectional"} valuePropName="checked">
        <Switch
          checked={state.isBidirectional}
          onChange={(checked) => setState({ isBidirectional: checked })}
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
  onFinish={({targetId, props, bidirectional})=>{
    if(state.sourceId){
      addInterlink(state.sourceId, targetId, props);
      if(bidirectional) {
        addInterlink(targetId, state.sourceId, props);
      }
      setState({
        existingLinks: [
          ...state.existingLinks,
          {
            targetId,
            props,
            isBidirectional: bidirectional
          }
        ]
      });
    }
  }}
  >{formItems}</Form>;
};
