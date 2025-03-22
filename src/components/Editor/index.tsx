import { Layout } from "antd";
import { Canvas } from "./Canvas";

import { useRegisterComponent } from "../VisualComponents";


const {Content}=Layout

const VisualEditor = () => {
  useRegisterComponent();
  return (
    <Layout className="editor h-full">
      <Content className="editor-body">
        <Canvas />
      </Content>
    </Layout>
  );
};
export default VisualEditor;
