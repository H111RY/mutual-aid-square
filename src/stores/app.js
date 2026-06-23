import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getItem, setItem, removeItem } from '@/storage/core'
import { db, getUserId, setCurrentPhone, clearCurrentPhone, ensureAuth } from '@/cloudbase'

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

  const isLoggedIn = computed(() => !!user.value.id)

  function setUser(info) {
    user.value = { ...user.value, ...info }
  }

  function clearUser() {
    user.value = { id: '', nickname: '', avatar: '', building: '', role: 'resident' }
  }

  async function login(phone, code) {
    const { signInWithSms } = await import('@/api/auth')

    // 1. 确保有 CloudBase 匿名登录会话
    await ensureAuth()

    // 2. 测试模式验证码校验
    const { uid } = await signInWithSms(phone, code)

    // 3. 持久化手机号（会话级别）
    setCurrentPhone(phone)

    // 4. 查询是否有已有资料
    const { data } = await db.collection('users').where({ uid }).get()

    if (data.length > 0) {
      const profile = data[0]
      setUser({
        id: uid,
        nickname: profile.nickname || '',
        avatar: profile.avatar || '',
        building: profile.building || ''
      })
      return { isNewUser: false }
    }

    setUser({ id: uid })
    return { isNewUser: true }
  }

  async function logout() {
    clearCurrentPhone()
    clearUser()
  }

  async function restoreSession() {
    const uid = getUserId()
    if (!uid) return false

    // 确保 CloudBase 匿名会话有效
    await ensureAuth()

    const { data } = await db.collection('users').where({ uid }).get()

    if (data.length > 0) {
      const profile = data[0]
      setUser({
        id: uid,
        nickname: profile.nickname || '',
        avatar: profile.avatar || '',
        building: profile.building || ''
      })
      return true
    }

    // 有手机号但无资料（异常情况）
    return false
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
    user, isLoggedIn, setUser, clearUser, login, logout, restoreSession,
    toasts, showToast, removeToast,
    isGlobalLoading, startLoading, stopLoading,
    isOnline, initNetworkListener,
    sidebarVisible, toggleSidebar,
    colorScheme, effectiveScheme, setColorScheme, initColorScheme,
    pageDirection, setPageDirection,
    init
  }
})
