import { AppRouter } from '@/router';
import RouterBeforeEach from '@/router/permission';
import { useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RouteType } from '@/types/route';

function App() {
  const appRouterRef = useRef<{ addRoutes: (routes: RouteType[]) => void }>();
  return (
    <BrowserRouter>
      <AppRouter ref={appRouterRef}/>
      <RouterBeforeEach appRouterRef={appRouterRef}/>
    </BrowserRouter>
  );
}

export default App;
