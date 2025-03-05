import { CreateSubjectParams, CreateSubjectResponse, ListSubjectResponse, SubjectDataResponse } from '@/types/subject';
import http from '@/utils/request';

const api = {
  create: '/query/subject/create',
  data: '/query/subject/{subject_id}/data',
  list: '/query/subject/list',
  subject: '/query/subject/{subject_id}',
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