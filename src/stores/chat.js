import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getConversations, createConversation, getMessages, sendMessage,
  markRead, deleteConversation, pollMessages
} from '@/api/chat';

export const useChatStore = defineStore('chat', () => {
  /* ========== 会话列表 ========== */
  const conversations = ref([]);
  const convLoading = ref(false);

  const totalUnread = computed(() =>
    conversations.value.reduce((sum, c) => sum + (c.unread_count || 0), 0)
  );

  async function fetchConversations() {
    convLoading.value = true;
    try {
      const res = await getConversations();
      conversations.value = (res.list || []).map(formatConversation);
    } catch { /* 静默 */ }
    finally { convLoading.value = false; }
  }

  function formatConversation(item) {
    return {
      ...item,
      timeText: timeAgo(item.updated_at),
      lastPreview: item.last_message
        ? (item.last_message.content_preview || item.last_message.content || '').slice(0, 20)
        : ''
    };
  }

  /* ========== 当前会话消息 ========== */
  const currentConvId = ref(null);
  const messages = ref([]);
  const msgLoading = ref(false);
  const msgPage = ref(1);
  const msgIsEnd = ref(false);
  const MESSAGE_PAGE_SIZE = 30;

  function setCurrentConv(convId) {
    currentConvId.value = convId;
    messages.value = [];
    msgPage.value = 1;
    msgIsEnd.value = false;
  }

  async function fetchMessages(convId, reset = false) {
    if (msgLoading.value) return;
    const p = reset ? 1 : msgPage.value;
    msgLoading.value = true;
    try {
      const res = await getMessages(convId, { page: p, page_size: MESSAGE_PAGE_SIZE });
      const list = (res.list || []).map(m => ({
        ...m,
        _status: 'sent',
        _localId: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
      }));
      messages.value = reset ? list : [...list, ...messages.value];
      msgPage.value = p + 1;
      msgIsEnd.value = list.length < MESSAGE_PAGE_SIZE;
    } catch { /* 静默 */ }
    finally { msgLoading.value = false; }
  }

  /* ========== 发送消息（乐观更新） ========== */
  async function sendMsg(convId, data) {
    const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const optimistic = {
      id: tempId,
      _localId: tempId,
      conversation_id: convId,
      sender_uid: 'me',
      msg_type: data.msg_type,
      content: data.content,
      extra: data.extra || {},
      _status: 'sending',
      created_at: new Date().toISOString()
    };
    messages.value.push(optimistic);

    try {
      const res = await sendMessage(convId, data);
      const idx = messages.value.findIndex(m => m._localId === tempId);
      if (idx !== -1) {
        messages.value[idx] = { ...messages.value[idx], ...res, _status: 'sent', id: res.id || tempId };
      }
      // 更新会话最后消息
      const conv = conversations.value.find(c => c.id === convId);
      if (conv) {
        conv.last_message = { msg_type: data.msg_type, content_preview: data.content?.slice(0, 20) || '', created_at: new Date().toISOString() };
        conv.updated_at = new Date().toISOString();
      }
    } catch {
      const idx = messages.value.findIndex(m => m._localId === tempId);
      if (idx !== -1) messages.value[idx]._status = 'failed';
    }
  }

  function retryMsg(convId, localId) {
    const msg = messages.value.find(m => m._localId === localId);
    if (!msg || msg._status !== 'failed') return;
    messages.value = messages.value.filter(m => m._localId !== localId);
    sendMsg(convId, {
      msg_type: msg.msg_type,
      content: msg.content,
      extra: msg.extra
    });
  }

  /* ========== 已读 ========== */
  async function readConversation(convId) {
    const conv = conversations.value.find(c => c.id === convId);
    if (conv) conv.unread_count = 0;
    try { await markRead(convId); } catch {}
  }

  /* ========== 接收新消息（WebSocket/轮询推送） ========== */
  function receiveMessage(msg) {
    // 判断是否属于当前会话
    if (msg.conversation_id === currentConvId.value) {
      const exists = messages.value.find(m => m.id === msg.id);
      if (!exists) {
        messages.value.push({ ...msg, _status: 'sent' });
        readConversation(msg.conversation_id);
      }
    }
    // 更新会话列表
    const conv = conversations.value.find(c => c.id === msg.conversation_id);
    if (conv) {
      conv.last_message = { msg_type: msg.msg_type, content_preview: (msg.content || '').slice(0, 20), created_at: msg.created_at };
      conv.updated_at = msg.created_at;
      if (msg.conversation_id !== currentConvId.value) {
        conv.unread_count = (conv.unread_count || 0) + 1;
      }
    } else {
      // 新会话，加入列表
      conversations.value.unshift({
        id: msg.conversation_id,
        peer: msg.sender || {},
        last_message: { msg_type: msg.msg_type, content_preview: (msg.content || '').slice(0, 20), created_at: msg.created_at },
        unread_count: 1,
        updated_at: msg.created_at,
        timeText: '刚刚'
      });
    }
  }

  /* ========== 删除会话 ========== */
  async function removeConversation(convId) {
    conversations.value = conversations.value.filter(c => c.id !== convId);
    try { await deleteConversation(convId); } catch {}
  }

  /* ========== 轮询 ========== */
  let lastPollId = null;
  async function poll() {
    try {
      const res = await pollMessages(lastPollId);
      if (res && res.list) {
        res.list.forEach(receiveMessage);
        if (res.list.length > 0) lastPollId = res.list[res.list.length - 1].id;
      }
    } catch {}
  }

  /* ========== 时间格式化 ========== */
  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
    if (diff < 604800) return Math.floor(diff / 86400) + '天前';
    const d = new Date(dateStr);
    return (d.getMonth() + 1) + '/' + d.getDate();
  }

  return {
    conversations, convLoading, totalUnread, fetchConversations,
    currentConvId, messages, msgLoading, msgIsEnd,
    setCurrentConv, fetchMessages, sendMsg, retryMsg, readConversation,
    receiveMessage, removeConversation, poll
  };
});
