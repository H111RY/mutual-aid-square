import http from './http';

/** 提交举报 */
export function submitReport(data) {
  return http.post('/report', data);
}
