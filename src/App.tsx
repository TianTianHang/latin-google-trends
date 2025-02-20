import { AppRouter } from "@/router";
import RouterBeforeEach from "@/router/permission";
import { BrowserRouter } from "react-router-dom";
import { StyleProvider } from '@ant-design/cssinjs';
function App() {
  return (
      <StyleProvider layer>
         <BrowserRouter>
        <AppRouter />
        <RouterBeforeEach />
      </BrowserRouter>
      </StyleProvider>
  );
}

export default App;
