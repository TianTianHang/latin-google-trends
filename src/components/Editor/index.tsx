import { Layout } from "antd";
import { Canvas } from "./Canvas";
import { ComponentPalette } from "./ComponentPalette";
import { useState } from "react";
import { useRegisterComponent } from "../VisualComponents";

const {Content,Sider}=Layout

const VisualEditor = () => {
  useRegisterComponent()
  const [siderVisible] = useState(true);
  return (
    <Layout className="editor h-full">
      <Content className="editor-body">
        <Canvas />
      </Content>
      {siderVisible && (
        <Sider width="10%" className="bg-white border-black">
          <ComponentPalette />
        </Sider>
      )}
    </Layout>
  );
};
export default VisualEditor;
