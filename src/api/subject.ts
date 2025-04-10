import { TimeInterest } from "@/types/interest";
import {
  CreateSubjectParams,
  CreateSubjectResponse,
  ListSubjectResponse,
  SubjectDataResponse,
  SubjectDataUpdate,
} from "@/types/subject";
import http from "@/utils/request";
import dayjs from "dayjs";

const api = {
  create: "/query/subject/create",
  data: "/query/subject/{subject_id}/data",
  list: "/query/subject/list",
  subject: "/query/subject/{subject_id}",
  updateSubjectData: "/query/subjectData/{subject_data_id}/update",
};

export function createSubject(data: CreateSubjectParams) {
  return http.post<CreateSubjectResponse>(api.create, data);
}
export function getSubject(subject_id: number) {
  return http.get<ListSubjectResponse>(
    api.subject.replace("{subject_id}", subject_id.toString())
  );
}
export function getSubjectData(subject_id: number) {
  return http
    .get<SubjectDataResponse[]>(
      api.data.replace("{subject_id}", subject_id.toString())
    )
    .then((data) => {
      data.map(item => {
        if (item.data_type === "time") {
          // 直接在排序时使用 map 的索引参数来简化创建索引数组的步骤
          const sortedIndexes = item.meta
            .map((_, index) => index)
            .sort((a, b) => {
              const timeA = dayjs(item.meta[a].timeframe_end);
              const timeB = dayjs(item.meta[b].timeframe_end);
              // 使用 dayjs 的 diff 方法直接返回比较结果，简化比较逻辑
              return timeB.diff(timeA); // 注意这里与原逻辑相反，如果需要升序请改为 timeA.diff(timeB)
            });
      
          // 同时重新排列 item.meta 和 item.data 根据排序后的索引
          item.meta = sortedIndexes.map(index => item.meta[index]);
          item.data = sortedIndexes.map(index => item.data[index]) as TimeInterest[][];
        }
        // 返回处理后的 item 或未修改的 item（如果 data_type 不是 "time"）
        return item;
      });
      return data;
    });
}
export function getSubjectList() {
  return http.get<ListSubjectResponse[]>(api.list);
}

export function updateSubjectData(
  subject_data_id: number,
  data: SubjectDataUpdate
) {
  const url = api.updateSubjectData.replace(
    "{subject_data_id}",
    subject_data_id.toString()
  );
  return http.put<SubjectDataResponse>(url, data);
}
