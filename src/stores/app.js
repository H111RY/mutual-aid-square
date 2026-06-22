import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getItem, setItem, removeItem } from '@/storage/core';

/**
 * 全局应用状态 — UI 层共享状态
 *
 * 管理：用户信息、Toast 通知队列、全局 Loading、网络状态、侧栏、
 *       主题（扩展字体模式以外的外观偏好）
 */
export const useAppStore = defineStore('app', () => {
  /* ==================================================================
     ── 用户信息 ──
     ================================================================== */
  const user = ref({
    id: '',
    nickname: '',
    avatar: '',
    building: '',      // 楼栋号
    role: 'resident'   // 'resident' | 'admin' | 'volunteer'
  });

  const isLoggedIn = computed(() => !!user.value.id);

  function setUser(info) {
    user.value = { ...user.value, ...info };
  }

  function clearUser() {
    user.value = { id: '', nickname: '', avatar: '', building: '', role: 'resident' };
  }

  async function login(phone, code) {
    const { loginByPhone } = await import('@/api/auth');
    const res = await loginByPhone(phone, code);
    if (res.token) {
      setItem('token', res.token, { engine: 'session' });
      setItem('user', res.user, { engine: 'session' });
      setUser(res.user);
    }
    return res;
  }

  function logout() {
    removeItem('token', 'session');
    removeItem('user', 'session');
    clearUser();
  }

  function restoreSession() {
    const token = getItem('token', 'session');
    if (token) {
      const savedUser = getItem('user', 'session');
      if (savedUser) setUser(savedUser);
    }
  }

  /* ==================================================================
     ── Toast 通知队列 ──
     ================================================================== */
  const toasts = ref([]);
  let toastId = 0;
  const TOAST_DURATION = 3000;

  function showToast(message, type = 'info') {
    const id = ++toastId;
    toasts.value.push({ id, message, type });
    setTimeout(() => removeToast(id), TOAST_DURATION);
    return id;
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  /* ==================================================================
     ── 全局 Loading 计数器（支持并发请求）──
     ================================================================== */
  const loadingStack = ref(0);
  const isGlobalLoading = computed(() => loadingStack.value > 0);

  function startLoading() { loadingStack.value++; }
  function stopLoading() { if (loadingStack.value > 0) loadingStack.value--; }

  /* ==================================================================
     ── 网络状态 ──
     ================================================================== */
  const isOnline = ref(navigator.onLine);

  function initNetworkListener() {
    window.addEventListener('online', () => { isOnline.value = true; });
    window.addEventListener('offline', () => { isOnline.value = false; });
  }

  /* ==================================================================
     ── 侧栏 / 抽屉 ──
     ================================================================== */
  const sidebarVisible = ref(false);

  function toggleSidebar() {
    sidebarVisible.value = !sidebarVisible.value;
  }

  /* ==================================================================
     ── 主题扩展（深色 / 浅色）──
     ================================================================== */
  const colorScheme = ref('light');  // 'light' | 'dark' | 'auto'
  const effectiveScheme = computed(() => {
    if (colorScheme.value === 'auto') {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return colorScheme.value;
  });

  function setColorScheme(scheme) {
    colorScheme.value = scheme;
    setItem('color_scheme', scheme);
    applyColorScheme();
  }

  function initColorScheme() {
    const saved = getItem('color_scheme');
    if (saved) colorScheme.value = saved;
    applyColorScheme();
  }

  function applyColorScheme() {
    document.documentElement.setAttribute('data-color-scheme', effectiveScheme.value);
  }

  /* ==================================================================
     ── 页面切换方向（用于过渡动画）──
     ================================================================== */
  const pageDirection = ref('forward');   // 'forward' | 'back'

  function setPageDirection(dir) { pageDirection.value = dir; }

  /* ==================================================================
     ── 初始化 ──
     ================================================================== */
  function init() {
    initNetworkListener();
    initColorScheme();
  }

  return {
    // 用户
    user, isLoggedIn, setUser, clearUser, login, logout, restoreSession,
    // Toast
    toasts, showToast, removeToast,
    // Loading
    isGlobalLoading, startLoading, stopLoading,
    // 网络
    isOnline, initNetworkListener,
    // 侧栏
    sidebarVisible, toggleSidebar,
    // 主题
    colorScheme, effectiveScheme, setColorScheme, initColorScheme,
    // 页面方向
    pageDirection, setPageDirection,
    // 初始化
    init
  };
});
