import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, Spin } from "antd";
import { Suspense } from "react";
import zhCN from "antd/locale/zh_CN";
import { BrowserRouter } from "react-router";
import { AppRouter } from "./router";
import RouterBeforeEach from "./router/permission";
function App() {
 
  return (
    <StyleProvider layer>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            
          },
        }}
      >
        <Suspense fallback={<Spin size="large" className="globa_spin" />}>
          <BrowserRouter>
            <AppRouter />
            <RouterBeforeEach />
          </BrowserRouter>
        </Suspense>
      </ConfigProvider>
    </StyleProvider>
  );
}

export default App;
