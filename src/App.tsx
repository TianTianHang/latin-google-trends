import { AppRouter } from "@/router";
import RouterBeforeEach from "@/router/permission";
import { ConfigProvider } from "antd";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            /* 这里是你的组件 token */
          },
        },
      }}
    >
      <BrowserRouter>
        <AppRouter />
        <RouterBeforeEach />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
