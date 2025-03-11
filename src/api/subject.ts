import { CreateSubjectParams, CreateSubjectResponse, ListSubjectResponse, SubjectDataResponse, SubjectDataUpdate } from '@/types/subject';
import http from '@/utils/request';

const api = {
  create: '/query/subject/create',
  data: '/query/subject/{subject_id}/data',
  list: '/query/subject/list',
  subject: '/query/subject/{subject_id}',
  updateSubjectData: '/query/subjectData/{subject_data_id}/update'
};

export function createSubject(data: CreateSubjectParams) {
  return http.post<CreateSubjectResponse>(api.create, data);
}
export function getSubject(subject_id: number) {
  return http.get<ListSubjectResponse>(api.subject.replace('{subject_id}', subject_id.toString()));
}
export function getSubjectData(subject_id: number) {
  return http.get<SubjectDataResponse[]>(api.data.replace('{subject_id}', subject_id.toString()));
}
export function getSubjectList() {
  return http.get<ListSubjectResponse[]>(api.list);
}

export function updateSubjectData(subject_data_id:number,data:SubjectDataUpdate){
  const url=api.updateSubjectData.replace("{subject_data_id}",subject_data_id.toString())
  return http.put<SubjectDataResponse>(url,data)
}