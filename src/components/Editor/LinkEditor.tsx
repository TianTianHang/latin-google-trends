import { useSetState } from "ahooks";
import { Form, FormInstance, Input, Select, Switch, Collapse } from "antd";
import { useEffect } from "react";
import { intersection } from "lodash";
import { useComponentsStore, useRegisteredComponentsStore, useInterlinkedStore, } from "./stores";
import { Interlinked } from "./stores/interlinkedStore";

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
  const {addInterlink, getInterlinkedComponents} =useInterlinkedStore();
  
  
  const [state, setState] = useSetState<State>({
    sourceId: componentId,
    targetId: null,
    sourceProps: [],
    targetProps: [],
    isBidirectional: false,
    existingLinks: [],
  });
  // 初始化表单字段
  useEffect(() => {
    if (state.sourceId) {
      form.setFieldsValue({
        sourceId: state.sourceId,
        bidirectional: state.isBidirectional
      });
    }
  }, [form, state.sourceId, state.isBidirectional]);
  // 使用useEffect来更新状态
  useEffect(() => {
    // 初始化existingLinks
    if (state.sourceId) {
      const linkedComponents = getInterlinkedComponents(state.sourceId);
      const existingLinks = linkedComponents.map((link: Interlinked) => {
        // 检查是否存在双向链接
        const isBidirectional = getInterlinkedComponents(link.targetId)
          .some((reverseLink) => reverseLink.targetId === state.sourceId && 
            JSON.stringify(reverseLink.props.sort()) === JSON.stringify(link.props.sort()));
        
        return {
          targetId: link.targetId,
          props: link.props,
          isBidirectional
        };
      });
      
      // 如果有链接，设置第一个链接的双向属性作为表单的初始值
      if (existingLinks.length > 0) {
        setState({ 
          existingLinks,
          isBidirectional: existingLinks[0].isBidirectional
        });
        form.setFieldsValue({
          bidirectional: existingLinks[0].isBidirectional
        });
      }
    }
    
    // 更新selectedComponent
    const type = components.find((c) => c.id === state.sourceId)?.type;
    if (type) {
      const comp = registered.get(type);
      const propTypes = comp?.meta.propSchema;
      if (propTypes) {
        setState({ sourceProps: Object.keys(propTypes) });
      }
    }
  }, [components, registered, setState, state.sourceId, getInterlinkedComponents, form]);
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
        <Input disabled />
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
        <Collapse
          items={state.existingLinks.map((link, index) => ({
            key: index,
            label: `Target: ${link.targetId}`,
            children: (
              <>
                <div>Properties: {link.props.join(', ')}</div>
                {link.isBidirectional && <div>Type: Bidirectional</div>}
              </>
            )
          }))}
        />
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
  initialValues={{
    sourceId: state.sourceId ?? ""
  }}
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
