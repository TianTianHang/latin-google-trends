import { useSubjectStore } from "@/stores/useSubjectStore";
import { useMemo } from "react";

export const useSubjectData=(subjectDataId:number|undefined)=>{
    const { subjectDatas } = useSubjectStore();
      const data = useMemo(() => {
        const subject = subjectDatas.find((s) => s.id == subjectDataId);
        return subject ? subject : null;
      }, [subjectDataId, subjectDatas]);
      return data;
}