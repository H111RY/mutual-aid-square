import http from './http';

/** 获取会话列表 */
export function getConversations(params) {
  return http.get('/chat/conversations', { params });
}

/** 创建/获取会话 */
export function createConversation(userId) {
  return http.post('/chat/conversations', { user_id: userId });
}

/** 获取历史消息 */
export function getMessages(conversationId, params) {
  return http.get(`/chat/conversations/${conversationId}/messages`, { params });
}

/** 发送消息 */
export function sendMessage(conversationId, data) {
  return http.post(`/chat/conversations/${conversationId}/messages`, data);
}

/** 标记已读 */
export function markRead(conversationId) {
  return http.post(`/chat/conversations/${conversationId}/read`);
}

/** 删除会话 */
export function deleteConversation(conversationId) {
  return http.delete(`/chat/conversations/${conversationId}`);
}

/** 发送需求确认卡片 */
export function sendDemandCard(conversationId, data) {
  return http.post('/chat/demand-confirm', { conversation_id: conversationId, ...data });
}

/** 轮询增量消息（WebSocket 降级） */
export function pollMessages(lastMsgId) {
  return http.get('/chat/poll', { params: { since: lastMsgId }, __showLoading: false });
}
