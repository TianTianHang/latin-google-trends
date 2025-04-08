import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/lang";
import "@/index.css";

import App from "@/App";
import { useSubjectStore } from "./stores/useSubjectStore";
import { useDataProviderStore } from "./components/Editor/stores";
import { getSubjectData } from "./api/subject";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App/>
  </StrictMode>
);
useSubjectStore.getState().fetchAllSubjects().then(()=>{
  useSubjectStore.getState().allSubjects.map((s) => {
      useDataProviderStore.getState().registerDataSource({
        id: `subject-${s.subject_id}`,
        type: "api",
        config: {
          renderData:"data=>data.map(item=>item.data)"
        },
        fetch: async () => {
          return await getSubjectData(s.subject_id);
        },
      },false);
    });
});