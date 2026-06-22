import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getNotices } from '@/api/square';
import { getItem, setItem } from '@/storage/core';
import { useAppStore } from '@/stores/app';

export const useSquareStore = defineStore('square', () => {
  /* ========== 字体模式 ========== */
  const isLargeFont = ref(false);

  function initFontMode() {
    isLargeFont.value = getItem('font_large') === '1';
    applyFontMode();
  }

  function toggleFontMode() {
    isLargeFont.value = !isLargeFont.value;
    setItem('font_large', isLargeFont.value ? '1' : '0');
    applyFontMode();
  }

  function applyFontMode() {
    document.body.classList.toggle('font-large', isLargeFont.value);
  }

  /* ========== Tab 分类 ========== */
  const tabs = [
    { name: '全部', value: 'all' },
    { name: '求助', value: 'help' },
    { name: '闲置', value: 'idle' },
    { name: '交流', value: 'chat' }
  ];

  const currentTab = ref(0);
  const activeTabValue = computed(() => tabs[currentTab.value].value);

  function switchTab(index) {
    if (index === currentTab.value) return;
    currentTab.value = index;
  }

  /* ========== 公告 ========== */
  const notices = ref([]);

  async function fetchNotices() {
    try {
      const res = await getNotices();
      notices.value = res.list || [];
    } catch { /* 静默 */ }
  }

  function dismissNotices() {
    notices.value = [];
  }

  /* ========== 帖子列表 ========== */
  const posts = ref([]);
  const page = ref(1);
  const isLoading = ref(false);
  const isEnd = ref(false);
  const fetchError = ref('');
  const PAGE_SIZE = 20;
  let pendingRequest = null;

  /* ── localStorage 读写 ── */
  function loadAllPosts() {
    return getItem('posts') || [];
  }

  function saveAllPosts(arr) {
    setItem('posts', arr);
  }

  /* ── 发布新帖 ── */
  function addPost(postData) {
    const appStore = useAppStore();
    console.log(`[addPost] category="${postData.category}" content="${(postData.content || '').slice(0, 30)}"`);
    const post = {
      id: 'p_' + Date.now(),
      category: postData.category,
      content: postData.content,
      images: postData.images || [],
      author: {
        nickname: appStore.user.nickname || '邻里用户',
        avatar: appStore.user.avatar || '',
        building: appStore.user.building || '未绑定楼栋'
      },
      created_at: new Date().toISOString(),
      like_count: 0,
      comment_count: 0,
      isLiked: false,
      isTop: false,
      status: 'unreplied',
      comments: []
    };

    const allPosts = loadAllPosts();
    allPosts.unshift(post);
    saveAllPosts(allPosts);

    // 同步到内存列表（仅当匹配当前 tab 时才乐观插入，否则由 onActivated 的重新加载处理）
    const formatted = formatPost(post);
    const curTab = activeTabValue.value;
    if (curTab === 'all' || curTab === post.category) {
      posts.value.unshift(formatted);
    }
    hasPublished.value = true;

    return formatted;
  }

  /* ── 从 localStorage 加载帖子列表 ── */
  async function fetchPosts(reset = false) {
    if (isLoading.value) return;

    // 重置时先清空，确保 UI 立即响应
    if (reset) {
      posts.value = [];
      page.value = 1;
      isEnd.value = false;
      fetchError.value = '';
    }

    const p = reset ? 1 : page.value;

    const requestKey = `${activeTabValue.value}_${p}`;
    if (pendingRequest === requestKey) return;
    pendingRequest = requestKey;

    isLoading.value = true;

    try {
      const allPosts = loadAllPosts();

      // 按分类过滤
      const filtered = activeTabValue.value === 'all'
        ? allPosts
        : allPosts.filter(post => post.category === activeTabValue.value);

      console.log(`[fetchPosts] tab="${activeTabValue.value}" total=${allPosts.length} filtered=${filtered.length} posts=`, filtered.map(p => ({ id: p.id, category: p.category, content: (p.content || '').slice(0, 20) })));

      // 客户端分页
      const start = (p - 1) * PAGE_SIZE;
      const list = filtered.slice(start, start + PAGE_SIZE).map(formatPost);

      posts.value = reset ? list : [...posts.value, ...list];
      page.value = p + 1;
      isEnd.value = start + PAGE_SIZE >= filtered.length;
    } catch (err) {
      fetchError.value = '加载失败，请下拉重试';
      if (reset) posts.value = [];
    } finally {
      isLoading.value = false;
      pendingRequest = null;
    }
  }

  function clearError() { fetchError.value = ''; }

  /* ── 点赞（乐观更新 + localStorage 持久化）── */
  async function toggleLike(postId) {
    const post = posts.value.find(p => p.id === postId);
    if (!post) return;

    post.isLiked = !post.isLiked;
    post.like_count += post.isLiked ? 1 : -1;
    if (post.like_count < 0) post.like_count = 0;

    // 同步到 localStorage
    const allPosts = loadAllPosts();
    const idx = allPosts.findIndex(p => p.id === postId);
    if (idx !== -1) {
      allPosts[idx].isLiked = post.isLiked;
      allPosts[idx].like_count = post.like_count;
      saveAllPosts(allPosts);
    }
  }

  /** 获取单个帖子（供详情页用） */
  function getPostById(id) {
    const allPosts = loadAllPosts();
    const raw = allPosts.find(p => p.id === id);
    return raw ? formatPost(raw) : null;
  }

  /** 添加评论到帖子 */
  function addComment(postId, comment) {
    const allPosts = loadAllPosts();
    const idx = allPosts.findIndex(p => p.id === postId);
    if (idx !== -1) {
      if (!allPosts[idx].comments) allPosts[idx].comments = [];
      allPosts[idx].comments.unshift(comment);
      allPosts[idx].comment_count = allPosts[idx].comments.length;
      saveAllPosts(allPosts);

      // 同步内存
      const memPost = posts.value.find(p => p.id === postId);
      if (memPost) {
        memPost.comment_count = allPosts[idx].comment_count;
      }
    }
  }

  /* ========== 工具函数 ========== */
  const tabNameMap = {
    help: '求助', idle: '闲置', chat: '交流',
    hospital: '医院便民', policy: '政策解读', anti_fraud: '防诈骗',
    general: '互助交流'
  };

  function formatPost(item) {
    return {
      ...item,
      timeAgo: timeAgo(item.created_at),
      tabName: tabNameMap[item.category] || tabNameMap[item.tab] || '互助交流',
      showExpand: (item.content || '').length > 150,
      isExpanded: false,
      isTop: !!item.is_top
    };
  }

  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
    if (diff < 604800) return Math.floor(diff / 86400) + '天前';
    const d = new Date(dateStr);
    return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  /* ========== 发布回调 ========== */
  const hasPublished = ref(false);

  function onPublished() {
    hasPublished.value = true;
  }

  return {
    isLargeFont, initFontMode, toggleFontMode,
    tabs, currentTab, activeTabValue, switchTab,
    notices, fetchNotices, dismissNotices,
    posts, page, isLoading, isEnd, fetchError, fetchPosts, clearError,
    addPost, getPostById, toggleLike, addComment,
    hasPublished, onPublished
  };
});
