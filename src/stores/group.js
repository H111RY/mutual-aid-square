import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getGroupList, getGroupInfo, getGroupMessages, sendGroupMessage,
  getGroupMembers, toggleMute, updateGroupNotice,
  pinMessage, unpinMessage, kickMember, banMember, leaveGroup
} from '@/api/group';

export const useGroupStore = defineStore('group', () => {
  /* ========== 群聊列表 ========== */
  const groups = ref([]);
  const groupLoading = ref(false);

  const totalGroupUnread = computed(() =>
    groups.value.filter(g => !g.is_muted).reduce((sum, g) => sum + (g.unread_count || 0), 0)
  );

  async function fetchGroups() {
    groupLoading.value = true;
    try {
      const res = await getGroupList();
      groups.value = (res.list || []).map(g => ({
        ...g,
        timeText: timeAgo(g.updated_at),
        lastPreview: g.last_message
          ? (g.last_message.content_preview || '').slice(0, 20)
          : ''
      }));
    } catch {}
    finally { groupLoading.value = false; }
  }

  /* ========== 当前群聊消息 ========== */
  const currentGroupId = ref(null);
  const groupInfo = ref(null);
  const groupMessages = ref([]);
  const gmLoading = ref(false);
  const gmPage = ref(1);
  const gmIsEnd = ref(false);
  const MESSAGE_PAGE_SIZE = 30;

  function setCurrentGroup(groupId) {
    currentGroupId.value = groupId;
    groupInfo.value = null;
    groupMessages.value = [];
    gmPage.value = 1;
    gmIsEnd.value = false;
  }

  async function fetchGroupInfo(groupId) {
    try {
      const res = await getGroupInfo(groupId);
      groupInfo.value = res;
    } catch {}
  }

  async function fetchGroupMessages(groupId, reset = false) {
    if (gmLoading.value) return;
    const p = reset ? 1 : gmPage.value;
    gmLoading.value = true;
    try {
      const res = await getGroupMessages(groupId, { page: p, page_size: MESSAGE_PAGE_SIZE });
      const list = (res.list || []).map(m => ({
        ...m,
        _status: 'sent',
        _localId: 'gm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
      }));
      groupMessages.value = reset ? list : [...list, ...groupMessages.value];
      gmPage.value = p + 1;
      gmIsEnd.value = list.length < MESSAGE_PAGE_SIZE;
    } catch {}
    finally { gmLoading.value = false; }
  }

  /* ========== 发送群消息 ========== */
  async function sendGm(groupId, data) {
    const tempId = 'gtemp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const optimistic = {
      id: tempId, _localId: tempId, group_id: groupId,
      sender: { uid: 'me', nickname: '我', avatar: '' },
      msg_type: data.msg_type, content: data.content,
      extra: data.extra || {}, is_pinned: false,
      _status: 'sending', created_at: new Date().toISOString()
    };
    groupMessages.value.push(optimistic);
    try {
      const res = await sendGroupMessage(groupId, data);
      const idx = groupMessages.value.findIndex(m => m._localId === tempId);
      if (idx !== -1) {
        groupMessages.value[idx] = { ...groupMessages.value[idx], ...res, _status: 'sent' };
      }
    } catch {
      const idx = groupMessages.value.findIndex(m => m._localId === tempId);
      if (idx !== -1) groupMessages.value[idx]._status = 'failed';
    }
  }

  /* ========== 接收群消息 ========== */
  function receiveGroupMessage(msg) {
    if (msg.group_id === currentGroupId.value) {
      const exists = groupMessages.value.find(m => m.id === msg.id);
      if (!exists) groupMessages.value.push({ ...msg, _status: 'sent' });
    }
    const g = groups.value.find(gr => gr.id === msg.group_id);
    if (g) {
      g.last_message = { msg_type: msg.msg_type, content_preview: (msg.content || '').slice(0, 20), created_at: msg.created_at };
      g.updated_at = msg.created_at;
      if (msg.group_id !== currentGroupId.value && !g.is_muted) {
        g.unread_count = (g.unread_count || 0) + 1;
      }
    }
  }

  /* ========== 群管理操作 ========== */
  async function toggleGroupMute(groupId, muted) {
    const g = groups.value.find(gr => gr.id === groupId);
    if (g) g.is_muted = muted;
    try { await toggleMute(groupId, muted); } catch {}
  }

  async function setGroupNotice(groupId, notice) {
    try { await updateGroupNotice(groupId, notice); }
    catch { throw new Error('更新公告失败'); }
  }

  async function pinGroupMsg(groupId, messageId) {
    try {
      await pinMessage(groupId, messageId);
      const msg = groupMessages.value.find(m => m.id === messageId);
      if (msg) msg.is_pinned = true;
    } catch {}
  }

  async function unpinGroupMsg(groupId, messageId) {
    try {
      await unpinMessage(groupId, messageId);
      const msg = groupMessages.value.find(m => m.id === messageId);
      if (msg) msg.is_pinned = false;
    } catch {}
  }

  async function kickGroupMember(groupId, userId) {
    try { await kickMember(groupId, userId); } catch {}
  }

  async function banGroupMember(groupId, userId, duration) {
    try { await banMember(groupId, userId, duration); } catch {}
  }

  async function leaveCurrentGroup(groupId) {
    groups.value = groups.value.filter(gr => gr.id !== groupId);
    try { await leaveGroup(groupId); } catch {}
  }

  /* ========== 成员列表 ========== */
  const members = ref([]);

  async function fetchMembers(groupId) {
    try {
      const res = await getGroupMembers(groupId);
      members.value = res.list || res.members || [];
    } catch {}
  }

  /* ========== 工具函数 ========== */
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
    groups, groupLoading, totalGroupUnread, fetchGroups,
    currentGroupId, groupInfo, groupMessages, gmLoading, gmIsEnd,
    setCurrentGroup, fetchGroupInfo, fetchGroupMessages, sendGm,
    receiveGroupMessage, toggleGroupMute, setGroupNotice,
    pinGroupMsg, unpinGroupMsg, kickGroupMember, banGroupMember,
    leaveCurrentGroup, members, fetchMembers
  };
});
