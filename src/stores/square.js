import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getItem, setItem } from '@/storage/core'
import { useAppStore } from '@/stores/app'
import { getUserId, AV } from '@/leancloud'

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
      const query = new AV.Query('notices')
      query.descending('createdAt')
      query.limit(10)
      const data = await query.find()
      notices.value = data.map(n => ({
        id: n.id,
        title: n.get('title') || '',
        content: n.get('content') || '',
        createdAt: n.get('createdAt')
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
    console.log('[addPost] ========== 开始发布 ==========')
    const appStore = useAppStore()
    const uid = getUserId()
    console.log('[addPost] 当前用户 UID:', uid)
    if (!uid) throw new Error('请先登录')

    const post = new AV.Object('Posts')
    post.set({
      category: postData.category,
      content: postData.content,
      images: postData.images || [],
      authorId: uid,
      authorNickname: appStore.user.nickname || '新用户',
      authorAvatar: appStore.user.avatar || '',
      authorBuilding: appStore.user.building || '',
      likeCount: 0,
      commentCount: 0,
      isTop: false
    })
    console.log('[addPost] 组装完成，帖子数据:', JSON.stringify(post.toJSON(), null, 2))

    console.log('[addPost] 准备调用 post.save() ...')
    try {
      await post.save()
      console.log('[addPost] 写入成功！objectId:', post.id)
    } catch (e) {
      console.error('[addPost] 写入失败！错误:', e)
      console.error('[addPost] 错误详情:', e.message, e.code, e.stack)
      throw e
    }

    const plain = avToPlain(post)
    const formatted = formatPost(plain)
    console.log('[addPost] 格式化完成，本地帖子 ID:', formatted.id)

    const curTab = activeTabValue.value
    if (curTab === 'all' || curTab === postData.category) {
      posts.value.unshift(formatted)
    }
    hasPublished.value = true

    console.log('[addPost] ========== 发布流程结束 ==========')
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
      const query = new AV.Query('Posts')

      if (activeTabValue.value !== 'all') {
        query.equalTo('category', activeTabValue.value)
      }

      query.descending('createdAt')
      query.skip((p - 1) * PAGE_SIZE)
      query.limit(PAGE_SIZE)

      const data = await query.find()

      // 获取当前用户点赞状态
      let likedPostIds = new Set()
      const uid = getUserId()
      if (uid && data.length > 0) {
        const postIds = data.map(d => d.id)
        const likeQuery = new AV.Query('Likes')
        likeQuery.equalTo('userId', uid)
        likeQuery.containedIn('postId', postIds)
        const likesData = await likeQuery.find()
        likesData.forEach(l => likedPostIds.add(l.get('postId')))
      }

      const list = data.map(item => {
        const plain = avToPlain(item)
        return formatPost({ ...plain, isLiked: likedPostIds.has(item.id) })
      })

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

  /* ── 点赞（乐观更新 + LeanCloud 持久化）── */
  async function toggleLike(postId) {
    const post = posts.value.find(p => p.id === postId)
    if (!post) return

    const uid = getUserId()
    if (!uid) {
      const appStore = useAppStore()
      appStore.showToast('请先登录', 'error')
      return
    }

    const likeQuery = new AV.Query('Likes')
    likeQuery.equalTo('postId', postId)
    likeQuery.equalTo('userId', uid)
    const existing = await likeQuery.first()

    const wasLiked = !!existing
    post.isLiked = !wasLiked
    post.likeCount += post.isLiked ? 1 : -1
    if (post.likeCount < 0) post.likeCount = 0

    try {
      if (existing) {
        await existing.destroy()
      } else {
        const like = new AV.Object('Likes')
        like.set({ postId, userId: uid })
        await like.save()
      }
      // 同步更新帖子 likeCount
      const delta = wasLiked ? -1 : 1
      const postObj = AV.Object.createWithoutData('Posts', postId)
      postObj.increment('likeCount', delta)
      await postObj.save()
    } catch {
      // 回滚
      post.isLiked = wasLiked
      post.likeCount += wasLiked ? 1 : -1
    }
  }

  /** 获取单个帖子（供详情页用） */
  async function getPostById(id) {
    try {
      const post = await new AV.Query('Posts').get(id)
      const plain = avToPlain(post)

      const commentQuery = new AV.Query('Comments')
      commentQuery.equalTo('postId', id)
      commentQuery.descending('createdAt')
      const comments = await commentQuery.find()

      const uid = getUserId()
      let isLiked = false
      if (uid) {
        const likeQuery = new AV.Query('Likes')
        likeQuery.equalTo('postId', id)
        likeQuery.equalTo('userId', uid)
        const like = await likeQuery.first()
        isLiked = !!like
      }

      return formatPost({
        ...plain,
        isLiked,
        comments: comments.map(c => ({
          id: c.id,
          content: c.get('content'),
          author: {
            nickname: c.get('authorNickname') || '新用户',
            avatar: c.get('authorAvatar') || ''
          },
          created_at: c.get('createdAt')
        }))
      })
    } catch {
      return null
    }
  }

  /** 添加评论到帖子 */
  async function addComment(postId, comment) {
    const appStore = useAppStore()
    const uid = getUserId()
    if (!uid) throw new Error('请先登录')

    const c = new AV.Object('Comments')
    c.set({
      postId,
      authorId: uid,
      authorNickname: appStore.user.nickname || '新用户',
      authorAvatar: appStore.user.avatar || '',
      content: comment.content
    })
    await c.save()

    // 原子更新帖子评论数
    const postObj = AV.Object.createWithoutData('Posts', postId)
    postObj.increment('commentCount', 1)
    await postObj.save()

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

  /** AV.Object → 普通对象 */
  function avToPlain(obj) {
    return {
      _id: obj.id,
      ...obj.attributes,
      createdAt: obj.get('createdAt') ? obj.get('createdAt').toISOString() : new Date().toISOString(),
      updatedAt: obj.get('updatedAt') ? obj.get('updatedAt').toISOString() : new Date().toISOString()
    }
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
