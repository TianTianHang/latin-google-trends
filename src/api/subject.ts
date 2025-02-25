import { CreateSubjectParams, CreateSubjectResponse } from '@/types/subject';
import http from '@/utils/request';

const api = {
  create: '/query/subject/create',
};

export function createSubject(data: CreateSubjectParams) {
  return http.post<CreateSubjectResponse>(api.create, data);
}
