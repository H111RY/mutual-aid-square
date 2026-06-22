import http from './http';

/** 获取帖子列表 */
export function getPosts(params) {
  return http.get('/square/posts', { params });
}

/** 获取帖子详情 */
export function getPostDetail(id) {
  return http.get(`/square/posts/${id}`);
}

/** 发布帖子 */
export function createPost(data) {
  return http.post('/square/posts', data);
}

/** 删除帖子 */
export function deletePost(id) {
  return http.delete(`/square/posts/${id}`);
}

/** 点赞/取消 */
export function likePost(id) {
  return http.post(`/square/posts/${id}/like`);
}

/** 获取评论列表 */
export function getComments(postId, params) {
  return http.get(`/square/posts/${postId}/comments`, { params });
}

/** 发表评论 */
export function createComment(postId, data) {
  return http.post(`/square/posts/${postId}/comments`, data);
}

/** 获取置顶公告 */
export function getNotices() {
  return http.get('/square/notices');
}

/** 记录分享 */
export function sharePost(id) {
  return http.post(`/square/posts/${id}/share`);
}
