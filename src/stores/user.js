import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getItem, setItem } from '@/storage/core'
import { useAppStore } from '@/stores/app'
import { getUserId, db } from '@/cloudbase'

/**
 * 用户个人中心状态
 */
export const useUserStore = defineStore('user', () => {
  /* ==================================================================
     ── 用户统计 ──
     ================================================================== */
  const stats = ref({
    total_posts: 0,
    resolved_posts: 0,
    favorited_posts: 0,
    total_feedback: 0
  })

  function setStats(data) {
    stats.value = { ...stats.value, ...data }
  }

  /* ==================================================================
     ── 我的发布 ──
     ================================================================== */
  const myPosts = ref([])
  const myPostsLoading = ref(false)
  const myPostsPage = ref(1)
  const myPostsIsEnd = ref(false)
  const myPostsFilter = ref('all')

  const postCategories = [
    { name: '全部', value: 'all' },
    { name: '求助', value: 'help' },
    { name: '闲置', value: 'idle' },
    { name: '交流', value: 'chat' },
    { name: '医院便民', value: 'hospital' },
    { name: '政策解读', value: 'policy' },
    { name: '防诈骗', value: 'anti_fraud' }
  ]

  const filteredMyPosts = computed(() => {
    if (myPostsFilter.value === 'all') return myPosts.value
    return myPosts.value.filter(p => p.category === myPostsFilter.value)
  })

  function setMyPosts(list, reset = false) {
    myPosts.value = reset ? list : [...myPosts.value, ...list]
  }

  async function removeMyPost(id) {
    myPosts.value = myPosts.value.filter(p => p.id !== id)
    try {
      await db.collection('posts').doc(id).remove()
    } catch {
      loadMyPosts()
    }
  }

  async function updateMyPost(id, data) {
    const idx = myPosts.value.findIndex(p => p.id === id)
    if (idx !== -1) myPosts.value[idx] = { ...myPosts.value[idx], ...data }

    try {
      const updateData = {}
      if (data.content) updateData.content = data.content
      if (data.category) updateData.category = data.category
      if (data.images) updateData.images = data.images
      await db.collection('posts').doc(id).update(updateData)
    } catch {
      loadMyPosts()
    }
  }

  function setMyPostsFilter(filter) {
    myPostsFilter.value = filter
  }

  async function loadMyPosts() {
    const uid = getUserId()
    if (!uid) return

    myPostsLoading.value = true
    try {
      const { data } = await db.collection('posts')
        .where({ authorId: uid })
        .orderBy('createdAt', 'desc')
        .get()

      myPosts.value = data.map(p => ({
        id: p._id,
        objectId: p._id,
        category: p.category,
        content: p.content,
        images: p.images || [],
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        likeCount: p.likeCount || 0,
        commentCount: p.commentCount || 0,
        isTop: p.isTop || false,
        status: p.status || 'unreplied'
      }))
      stats.value.total_posts = myPosts.value.length
      stats.value.resolved_posts = myPosts.value.filter(p => p.status === 'resolved').length
    } catch (err) {
      console.error('[loadMyPosts]', err)
    } finally {
      myPostsLoading.value = false
    }
  }

  /* ==================================================================
     ── 消息通知设置 ──
     ================================================================== */
  const notificationSettings = ref({
    comment_notify: true,
    like_notify: true,
    reply_notify: true,
    anti_fraud_push: true,
    anti_fraud_sound: true,
    anti_fraud_volume: 80,
    do_not_disturb: false,
    dnd_start: '22:00',
    dnd_end: '07:00',
    group_digest: false,
    voice_notify: false,
    voice_volume: 60
  })

  function setNotificationSettings(data) {
    notificationSettings.value = { ...notificationSettings.value, ...data }
  }

  function toggleNotify(key) {
    if (key === 'anti_fraud_push') return
    notificationSettings.value[key] = !notificationSettings.value[key]
  }

  /* ==================================================================
     ── 楼栋管理 ──
     ================================================================== */
  const boundBuildings = ref([])
  const currentBuildingId = ref('')
  const MAX_BUILDINGS = 3

  const currentBuilding = computed(() =>
    boundBuildings.value.find(b => b.is_current) || null
  )

  const canAddMore = computed(() =>
    boundBuildings.value.length < MAX_BUILDINGS
  )

  function setBuildings(list) {
    boundBuildings.value = list
    const cur = list.find(b => b.is_current)
    if (cur) currentBuildingId.value = cur.id
  }

  function addBuilding(building) {
    boundBuildings.value.push(building)
  }

  function removeBuilding(id) {
    boundBuildings.value = boundBuildings.value.filter(b => b.id !== id)
  }

  function setCurrentBuilding(id) {
    boundBuildings.value.forEach(b => {
      b.is_current = b.id === id
    })
    currentBuildingId.value = id
  }

  /* ==================================================================
     ── 适老化偏好 ──
     ================================================================== */
  const preferences = ref({
    large_font: false,
    high_contrast: false,
    voice_input_priority: false,
    voice_auto_read: false,
    speech_rate: 1.0,
    speech_pitch: 'mid',
    long_press_confirm: false,
    haptic_feedback: true,
    show_button_hints: true
  })

  function setPreferences(data) {
    preferences.value = { ...preferences.value, ...data }
  }

  function togglePreference(key) {
    preferences.value[key] = !preferences.value[key]
  }

  /* ==================================================================
     ── 反馈 ──
     ================================================================== */
  const myFeedback = ref([])

  function setFeedback(list) {
    myFeedback.value = list
  }

  function addFeedback(item) {
    myFeedback.value.unshift(item)
  }

  /* ==================================================================
     ── 使用指南数据 ──
     ================================================================== */
  const guideCategories = [
    { value: 'hospital', name: '医院便民', icon: '🏥' },
    { value: 'policy', name: '政策解读', icon: '📋' },
    { value: 'anti_fraud', name: '防诈预警', icon: '🛡️' },
    { value: 'publish', name: '广场发布', icon: '📝' },
    { value: 'chat', name: '私信群聊', icon: '💬' }
  ]

  const guideData = {
    hospital: [
      { title: '找到医院便民入口', desc: '在互助广场首页，点击顶部的"医院便民"标签' },
      { title: '浏览医院信息', desc: '可以看到附近医院的地址、电话、特色科室' },
      { title: '联系医院联系人', desc: '点击绿色电话按钮，直接拨打医院联系电话' },
      { title: '使用需求确认卡片', desc: '在看病求助帖里，点击"需求确认"按钮，填写您的需求' },
      { title: '查看已解决案例', desc: '标记"已解决"的医院求助，会显示绿色对勾' }
    ],
    policy: [
      { title: '找到政策解读入口', desc: '在互助广场首页，点击顶部的"政策解读"标签' },
      { title: '查看最新政策', desc: '社区工作人员会及时发布最新的惠民政策' },
      { title: '收藏重要政策', desc: '点击政策帖子的收藏按钮，方便以后查找' },
      { title: '咨询政策问题', desc: '在政策帖子下方留言，社区工作人员会回复您' }
    ],
    anti_fraud: [
      { title: '识别诈骗信息', desc: '看到"转账"、"汇款"、"验证码"等字样要提高警惕' },
      { title: '收到预警通知', desc: '平台检测到可疑信息时，会弹出红色预警提示' },
      { title: '举报可疑信息', desc: '点击帖子或消息右上角的举报按钮，平台会及时处理' },
      { title: '查看防诈知识', desc: '在防诈骗标签下，定期浏览防诈案例和知识' },
      { title: '保护个人信息', desc: '不要在广场公开您的身份证号、银行卡号等隐私信息' }
    ],
    publish: [
      { title: '选择发布类型', desc: '点击广场底部红色加号，选择求助、闲置或交流类型' },
      { title: '填写内容', desc: '简单描述您的需求，也可以点击麦克风语音输入' },
      { title: '上传图片', desc: '点击图片按钮拍照或从相册选择，图片会自动压缩' },
      { title: '发布信息', desc: '确认内容无误后，点击底部蓝色"发布"按钮' },
      { title: '标记已解决', desc: '问题解决后，在我的发布中找到该帖，点击"标记已解决"' }
    ],
    chat: [
      { title: '进入私信', desc: '在广场上点击别人头像 → "发私信"；或在沟通广场点击"私信"' },
      { title: '发送消息', desc: '输入文字，或长按麦克风按钮录音发送' },
      { title: '发送图片', desc: '点击图片按钮选择图片，支持拍照和相册' },
      { title: '加入群聊', desc: '完成楼栋选择后，自动加入楼栋专属群聊' },
      { title: '群聊消息设置', desc: '在个人中心 → 消息设置中，可以设置免打扰和汇总推送' }
    ]
  }

  const faqList = [
    { q: '怎么知道有人回复我了？', a: '消息中心会出现红点提示，点击即可查看回复内容' },
    { q: '怎么换到其他楼栋？', a: '进入个人中心 → 楼栋切换，搜索并绑定新楼栋即可' },
    { q: '字太小看不清怎么办？', a: '进入个人中心 → 基础设置，打开"大字模式"，全平台字体会变大' },
    { q: '怎么举报骚扰消息？', a: '在聊天页面右上角点击举报按钮，提交后社区会及时处理' },
    { q: '怎么删除已发布的内容？', a: '进入个人中心 → 我的发布，找到该内容长按或点击删除按钮' },
    { q: '免打扰是什么？', a: '开启后指定时间段内不推送消息通知，保证休息不受打扰' }
  ]

  return {
    stats, setStats,
    myPosts, myPostsLoading, myPostsPage, myPostsIsEnd, myPostsFilter,
    postCategories, filteredMyPosts,
    setMyPosts, removeMyPost, updateMyPost, setMyPostsFilter, loadMyPosts,
    notificationSettings, setNotificationSettings, toggleNotify,
    boundBuildings, currentBuildingId, currentBuilding, canAddMore,
    setBuildings, addBuilding, removeBuilding, setCurrentBuilding,
    preferences, setPreferences, togglePreference,
    myFeedback, setFeedback, addFeedback,
    guideCategories, guideData, faqList
  }
})
