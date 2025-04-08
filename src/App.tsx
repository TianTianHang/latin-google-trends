import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, Spin } from "antd";
import { Suspense } from "react";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";
import { BrowserRouter } from "react-router";
import { AppRouter } from "./router";
import RouterBeforeEach from "./router/permission";

import { useGlobalStore } from "./stores/global";
import { useRegisterComponent } from "./components/VisualComponents";


const antdLocales = {
  zh: zhCN,
  en: enUS,
};

function App() {
  const { language } = useGlobalStore();
  useRegisterComponent();
  
  return (
    <StyleProvider layer>
      <ConfigProvider
        locale={antdLocales[language as keyof typeof antdLocales]}
        theme={{
          token: {},
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
