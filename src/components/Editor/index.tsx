import { Layout } from "antd";
import { Canvas } from "./Canvas";




const {Content}=Layout

const VisualEditor = () => {

  return (
    <Layout className="editor h-full">
      <Content className="editor-body">
        <Canvas />
      </Content>
    </Layout>
  );
};
export default VisualEditor;
