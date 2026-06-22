import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getItem, setItem } from '@/storage/core';

const STORAGE_KEY = 'drafts';

/**
 * 草稿箱 — localStorage 持久化
 *
 * 管理发布帖子的草稿：自动保存、恢复、删除
 * 页面意外关闭后重新打开可恢复未发布内容
 */
export const useDraftStore = defineStore('draft', () => {
  /* ==================================================================
     ── 草稿列表 ──
     ================================================================== */
  const drafts = ref([]);

  // 草稿结构: { id, category, content, images, savedAt, title }

  /* ==================================================================
     ── 加载 ──
     ================================================================== */
  function loadFromStorage() {
    drafts.value = getItem(STORAGE_KEY) || [];
  }

  function saveToStorage() {
    setItem(STORAGE_KEY, drafts.value);
  }

  /* ==================================================================
     ── 操作 ──
     ================================================================== */
  const draftCount = computed(() => drafts.value.length);

  function saveDraft(data) {
    const now = new Date().toISOString();
    const existing = drafts.value.find(d => d.id === data.id);

    if (existing) {
      existing.category = data.category;
      existing.content = data.content;
      existing.images = data.images || [];
      existing.savedAt = now;
    } else {
      drafts.value.unshift({
        id: data.id || 'draft_' + Date.now(),
        category: data.category || 'chat',
        content: data.content || '',
        images: data.images || [],
        title: data.content ? data.content.slice(0, 30) : '空草稿',
        savedAt: now
      });
    }

    // 最多保留 20 条草稿
    if (drafts.value.length > 20) {
      drafts.value = drafts.value.slice(0, 20);
    }

    saveToStorage();
  }

  function getDraft(id) {
    return drafts.value.find(d => d.id === id) || null;
  }

  function removeDraft(id) {
    drafts.value = drafts.value.filter(d => d.id !== id);
    saveToStorage();
  }

  function clearAllDrafts() {
    drafts.value = [];
    saveToStorage();
  }

  function hasDraftForCategory(category) {
    return drafts.value.some(d => d.category === category && d.content.trim());
  }

  // 初始化载入
  loadFromStorage();

  return {
    drafts,
    draftCount,
    saveDraft,
    getDraft,
    removeDraft,
    clearAllDrafts,
    hasDraftForCategory
  };
});
