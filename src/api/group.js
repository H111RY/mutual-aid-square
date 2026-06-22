import http from './http';

/** 获取我的群聊列表 */
export function getGroupList() {
  return http.get('/group/list');
}

/** 获取群信息 */
export function getGroupInfo(groupId) {
  return http.get(`/group/${groupId}/info`);
}

/** 获取群消息 */
export function getGroupMessages(groupId, params) {
  return http.get(`/group/${groupId}/messages`, { params });
}

/** 发送群消息 */
export function sendGroupMessage(groupId, data) {
  return http.post(`/group/${groupId}/messages`, data);
}

/** 获取成员列表 */
export function getGroupMembers(groupId) {
  return http.get(`/group/${groupId}/members`);
}

/** 消息免打扰开关 */
export function toggleMute(groupId, muted) {
  return http.post(`/group/${groupId}/mute`, { muted });
}

/** 编辑群公告 */
export function updateGroupNotice(groupId, notice) {
  return http.post(`/group/${groupId}/notice`, { notice });
}

/** 置顶消息 */
export function pinMessage(groupId, messageId) {
  return http.post(`/group/${groupId}/pin/${messageId}`);
}

/** 取消置顶 */
export function unpinMessage(groupId, messageId) {
  return http.delete(`/group/${groupId}/pin/${messageId}`);
}

/** 移出成员 */
export function kickMember(groupId, userId) {
  return http.post(`/group/${groupId}/kick/${userId}`);
}

/** 禁言成员 */
export function banMember(groupId, userId, duration) {
  return http.post(`/group/${groupId}/ban/${userId}`, { duration });
}

/** 退出群聊 */
export function leaveGroup(groupId) {
  return http.post(`/group/${groupId}/leave`);
}
