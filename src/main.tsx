import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/lang";
import "@/index.css";

import App from "@/App";
import { fetchApiData, parseCsvData, parseExcelData } from '@/utils/dataSourceUtils';

// 全局挂载
(window as any).fetchApiData = fetchApiData;
(window as any).parseCsvData = parseCsvData;
(window as any).parseExcelData = parseExcelData;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App/>
  </StrictMode>
);

