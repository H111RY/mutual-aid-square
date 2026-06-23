import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getItem, setItem } from '@/storage/core'
import { useAppStore } from '@/stores/app'
import { auth, db, _ } from '@/cloudbase'

export const useSquareStore = defineStore('square', () => {
  /* ========== 字体模式 ========== */
  const isLargeFont = ref(false)

  function initFontMode() {
    isLargeFont.value = getItem('font_large') === '1'
    applyFontMode()
  }

  function toggleFontMode() {
    isLargeFont.value = !isLargeFont.value
    setItem('font_large', isLargeFont.value ? '1' : '0')
    applyFontMode()
  }

  function applyFontMode() {
    document.body.classList.toggle('font-large', isLargeFont.value)
  }

  /* ========== Tab 分类 ========== */
  const tabs = [
    { name: '全部', value: 'all' },
    { name: '求助', value: 'help' },
    { name: '闲置', value: 'idle' },
    { name: '交流', value: 'chat' }
  ]

  const currentTab = ref(0)
  const activeTabValue = computed(() => tabs[currentTab.value].value)

  function switchTab(index) {
    if (index === currentTab.value) return
    currentTab.value = index
  }

  /* ========== 公告 ========== */
  const notices = ref([])

  async function fetchNotices() {
    try {
      const { data } = await db.collection('notices')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()
      notices.value = data.map(n => ({
        id: n._id,
        title: n.title || '',
        content: n.content || '',
        createdAt: n.createdAt
      }))
    } catch { /* 静默 */ }
  }

  function dismissNotices() {
    notices.value = []
  }

  /* ========== 帖子列表 ========== */
  const posts = ref([])
  const page = ref(1)
  const isLoading = ref(false)
  const isEnd = ref(false)
  const fetchError = ref('')
  const PAGE_SIZE = 20

  /* ── 发布新帖 ── */
  async function addPost(postData) {
    const appStore = useAppStore()
    const loginState = await auth.getLoginState()
    if (!loginState) throw new Error('请先登录')

    const uid = loginState.user.uid
    const doc = {
      category: postData.category,
      content: postData.content,
      images: postData.images || [],
      authorId: uid,
      authorNickname: appStore.user.nickname || '新用户',
      authorAvatar: appStore.user.avatar || '',
      authorBuilding: appStore.user.building || '',
      likeCount: 0,
      commentCount: 0,
      isTop: false,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }

    const result = await db.collection('posts').add(doc)

    const formatted = formatPost({
      _id: result.id,
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    const curTab = activeTabValue.value
    if (curTab === 'all' || curTab === postData.category) {
      posts.value.unshift(formatted)
    }
    hasPublished.value = true

    return formatted
  }

  /* ── 加载帖子列表 ── */
  async function fetchPosts(reset = false) {
    if (isLoading.value) return

    if (reset) {
      posts.value = []
      page.value = 1
      isEnd.value = false
      fetchError.value = ''
    }

    const p = reset ? 1 : page.value

    isLoading.value = true

    try {
      let query = db.collection('posts')

      if (activeTabValue.value !== 'all') {
        query = query.where({ category: activeTabValue.value })
      }

      const { data } = await query
        .orderBy('createdAt', 'desc')
        .skip((p - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .get()

      // 获取当前用户点赞状态
      let likedPostIds = new Set()
      const loginState = await auth.getLoginState()
      if (loginState) {
        const postIds = data.map(d => d._id)
        if (postIds.length > 0) {
          const { data: likesData } = await db.collection('likes')
            .where({
              userId: loginState.user.uid,
              postId: db.command.in(postIds)
            })
            .get()
          likesData.forEach(l => likedPostIds.add(l.postId))
        }
      }

      const list = data.map(item => formatPost({
        ...item,
        isLiked: likedPostIds.has(item._id)
      }))

      posts.value = reset ? list : [...posts.value, ...list]
      page.value = p + 1
      isEnd.value = list.length < PAGE_SIZE
    } catch (err) {
      console.error('[fetchPosts]', err)
      fetchError.value = '加载失败，请下拉重试'
      if (reset) posts.value = []
    } finally {
      isLoading.value = false
    }
  }

  function clearError() { fetchError.value = '' }

  /* ── 点赞（乐观更新 + CloudBase 持久化）── */
  async function toggleLike(postId) {
    const post = posts.value.find(p => p.id === postId)
    if (!post) return

    const loginState = await auth.getLoginState()
    if (!loginState) {
      const appStore = useAppStore()
      appStore.showToast('请先登录', 'error')
      return
    }

    const uid = loginState.user.uid
    const { data: existing } = await db.collection('likes')
      .where({ postId, userId: uid })
      .get()

    const wasLiked = existing.length > 0
    post.isLiked = !wasLiked
    post.likeCount += post.isLiked ? 1 : -1
    if (post.likeCount < 0) post.likeCount = 0

    try {
      if (existing.length > 0) {
        await db.collection('likes').doc(existing[0]._id).remove()
      } else {
        await db.collection('likes').add({ postId, userId: uid, createdAt: db.serverDate() })
      }
      // 同步更新帖子 likeCount
      const delta = wasLiked ? -1 : 1
      await db.collection('posts').doc(postId).update({
        likeCount: _.inc(delta)
      })
    } catch {
      // 回滚
      post.isLiked = wasLiked
      post.likeCount += wasLiked ? 1 : -1
    }
  }

  /** 获取单个帖子（供详情页用） */
  async function getPostById(id) {
    const { data: postData } = await db.collection('posts').doc(id).get()
    if (!postData || postData.length === 0) return null

    const post = postData[0]

    const { data: comments } = await db.collection('comments')
      .where({ postId: id })
      .orderBy('createdAt', 'desc')
      .get()

    const loginState = await auth.getLoginState()
    let isLiked = false
    if (loginState) {
      const { data: likesData } = await db.collection('likes')
        .where({ postId: id, userId: loginState.user.uid })
        .get()
      isLiked = likesData.length > 0
    }

    return formatPost({
      ...post,
      isLiked,
      comments: comments.map(c => ({
        id: c._id,
        content: c.content,
        author: {
          nickname: c.authorNickname || '新用户',
          avatar: c.authorAvatar || ''
        },
        created_at: c.createdAt
      }))
    })
  }

  /** 添加评论到帖子 */
  async function addComment(postId, comment) {
    const appStore = useAppStore()
    const loginState = await auth.getLoginState()
    if (!loginState) throw new Error('请先登录')

    await db.collection('comments').add({
      postId,
      authorId: loginState.user.uid,
      authorNickname: appStore.user.nickname || '新用户',
      authorAvatar: appStore.user.avatar || '',
      content: comment.content,
      createdAt: db.serverDate()
    })

    // 原子更新帖子评论数
    await db.collection('posts').doc(postId).update({
      commentCount: _.inc(1)
    })

    // 乐观更新内存中的 comment_count
    const memPost = posts.value.find(p => p.id === postId)
    if (memPost) {
      memPost.commentCount = (memPost.commentCount || 0) + 1
    }
  }

  /* ========== 工具函数 ========== */
  const tabNameMap = {
    help: '求助', idle: '闲置', chat: '交流',
    hospital: '医院便民', policy: '政策解读', anti_fraud: '防诈骗',
    general: '互助交流'
  }

  function formatPost(item) {
    return {
      ...item,
      id: item._id || item.id,
      timeAgo: timeAgo(item.createdAt || item.created_at),
      tabName: tabNameMap[item.category] || '互助交流',
      showExpand: (item.content || '').length > 150,
      isExpanded: false,
      isTop: !!item.isTop,
      is_top: !!item.isTop,
      like_count: item.likeCount || 0,
      comment_count: item.commentCount || 0,
      likeCount: item.likeCount || 0,
      commentCount: item.commentCount || 0,
      created_at: item.createdAt || item.created_at,
      author: buildAuthor(item)
    }
  }

  function timeAgo(dateStr) {
    if (!dateStr) return ''
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return '刚刚'
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
    if (diff < 604800) return Math.floor(diff / 86400) + '天前'
    const d = new Date(dateStr)
    return (d.getMonth() + 1) + '月' + d.getDate() + '日'
  }

  function buildAuthor(item) {
    if (item.author) return item.author
    return {
      nickname: item.authorNickname || '新用户',
      avatar: item.authorAvatar || '',
      building: item.authorBuilding || ''
    }
  }

  /* ========== 发布回调 ========== */
  const hasPublished = ref(false)

  function onPublished() {
    hasPublished.value = true
  }

  return {
    isLargeFont, initFontMode, toggleFontMode,
    tabs, currentTab, activeTabValue, switchTab,
    notices, fetchNotices, dismissNotices,
    posts, page, isLoading, isEnd, fetchError, fetchPosts, clearError,
    addPost, getPostById, toggleLike, addComment,
    hasPublished, onPublished
  }
})
