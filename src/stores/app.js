import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getItem, setItem, removeItem } from '@/storage/core'
import { getUserId, initAuth, AV } from '@/leancloud'

/**
 * 全局应用状态 — UI 层共享状态
 */
export const useAppStore = defineStore('app', () => {
  /* ==================================================================
     ── 用户信息 ──
     ================================================================== */
  const user = ref({
    id: '',
    nickname: '',
    avatar: '',
    building: '',
    role: 'resident'
  })

  const isLoggedIn = computed(() => true)

  function setUser(info) {
    user.value = { ...user.value, ...info }
  }

  function clearUser() {
    user.value = { id: '', nickname: '', avatar: '', building: '', role: 'resident' }
  }

  /**
   * 应用启动时自动初始化：
   * 1. LeanCloud 匿名登录（失败则本地后备 UID）
   * 2. 查询用户资料
   */
  async function restoreSession() {
    const uid = await initAuth()
    setUser({ id: uid })

    try {
      const query = new AV.Query('users')
      query.equalTo('uid', uid)
      const profile = await query.first()
      if (profile) {
        setUser({
          id: uid,
          nickname: profile.get('nickname') || '',
          avatar: profile.get('avatar') || '',
          building: profile.get('building') || ''
        })
      }
    } catch {
      // 数据库不可用时使用空资料
    }
  }

  /* ==================================================================
     ── Toast 通知队列 ──
     ================================================================== */
  const toasts = ref([])
  let toastId = 0
  const TOAST_DURATION = 3000

  function showToast(message, type = 'info') {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), TOAST_DURATION)
    return id
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  /* ==================================================================
     ── 全局 Loading 计数器 ──
     ================================================================== */
  const loadingStack = ref(0)
  const isGlobalLoading = computed(() => loadingStack.value > 0)

  function startLoading() { loadingStack.value++ }
  function stopLoading() { if (loadingStack.value > 0) loadingStack.value-- }

  /* ==================================================================
     ── 网络状态 ──
     ================================================================== */
  const isOnline = ref(navigator.onLine)

  function initNetworkListener() {
    window.addEventListener('online', () => { isOnline.value = true })
    window.addEventListener('offline', () => { isOnline.value = false })
  }

  /* ==================================================================
     ── 侧栏 / 抽屉 ──
     ================================================================== */
  const sidebarVisible = ref(false)

  function toggleSidebar() {
    sidebarVisible.value = !sidebarVisible.value
  }

  /* ==================================================================
     ── 主题扩展（深色 / 浅色）──
     ================================================================== */
  const colorScheme = ref('light')
  const effectiveScheme = computed(() => {
    if (colorScheme.value === 'auto') {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return colorScheme.value
  })

  function setColorScheme(scheme) {
    colorScheme.value = scheme
    setItem('color_scheme', scheme)
    applyColorScheme()
  }

  function initColorScheme() {
    const saved = getItem('color_scheme')
    if (saved) colorScheme.value = saved
    applyColorScheme()
  }

  function applyColorScheme() {
    document.documentElement.setAttribute('data-color-scheme', effectiveScheme.value)
  }

  /* ==================================================================
     ── 页面切换方向 ──
     ================================================================== */
  const pageDirection = ref('forward')

  function setPageDirection(dir) { pageDirection.value = dir }

  /* ==================================================================
     ── 初始化 ──
     ================================================================== */
  function init() {
    initNetworkListener()
    initColorScheme()
  }

  return {
    user, isLoggedIn, setUser, clearUser, restoreSession,
    toasts, showToast, removeToast,
    isGlobalLoading, startLoading, stopLoading,
    isOnline, initNetworkListener,
    sidebarVisible, toggleSidebar,
    colorScheme, effectiveScheme, setColorScheme, initColorScheme,
    pageDirection, setPageDirection,
    init
  }
})
