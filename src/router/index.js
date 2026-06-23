import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/square'
  },
  {
    path: '/square',
    name: 'SquareHome',
    component: () => import('@/views/square/SquareHome.vue'),
    meta: { title: '互助广场', keepAlive: true, level: 0 }
  },
  {
    path: '/square/publish',
    name: 'SquarePublish',
    component: () => import('@/views/square/SquarePublish.vue'),
    meta: { title: '发布信息', level: 1, requireAuth: true }
  },
  {
    path: '/square/detail/:id',
    name: 'SquareDetail',
    component: () => import('@/views/square/SquareDetail.vue'),
    meta: { title: '帖子详情', level: 1 }
  },

  {
    path: '/communicate',
    name: 'CommunicationHome',
    component: () => import('@/views/chat/CommunicationHome.vue'),
    meta: { title: '沟通广场', keepAlive: true, level: 0 }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/chat/Messages.vue'),
    meta: { title: '消息中心', keepAlive: true, level: 0 }
  },
  {
    path: '/chat',
    name: 'ChatList',
    component: () => import('@/views/chat/ChatList.vue'),
    meta: { title: '私信', keepAlive: true, level: 0 }
  },
  {
    path: '/chat/:conversationId',
    name: 'ChatConversation',
    component: () => import('@/views/chat/ChatConversation.vue'),
    meta: { title: '私信聊天', level: 1 }
  },
  {
    path: '/group',
    name: 'GroupList',
    component: () => import('@/views/chat/GroupList.vue'),
    meta: { title: '楼栋群聊', keepAlive: true, level: 0 }
  },
  {
    path: '/group/:groupId',
    name: 'GroupChat',
    component: () => import('@/views/chat/GroupChat.vue'),
    meta: { title: '群聊', level: 1 }
  },

  {
    path: '/profile',
    name: 'ProfileHome',
    component: () => import('@/views/profile/ProfileHome.vue'),
    meta: { title: '个人中心', keepAlive: true, level: 0 }
  },
  {
    path: '/profile/posts',
    name: 'MyPosts',
    component: () => import('@/views/profile/MyPosts.vue'),
    meta: { title: '我的发布', level: 1 }
  },
  {
    path: '/profile/posts/edit/:id',
    name: 'PostEdit',
    component: () => import('@/views/profile/PostEdit.vue'),
    meta: { title: '编辑发布', level: 2 }
  },
  {
    path: '/profile/settings',
    name: 'MessageSettings',
    component: () => import('@/views/profile/MessageSettings.vue'),
    meta: { title: '消息设置', level: 1 }
  },
  {
    path: '/profile/building',
    name: 'BuildingSwitch',
    component: () => import('@/views/profile/BuildingSwitch.vue'),
    meta: { title: '楼栋切换', level: 1 }
  },
  {
    path: '/profile/preferences',
    name: 'Preferences',
    component: () => import('@/views/profile/Preferences.vue'),
    meta: { title: '基础设置', level: 1 }
  },
  {
    path: '/profile/guide',
    name: 'UserGuide',
    component: () => import('@/views/profile/UserGuide.vue'),
    meta: { title: '使用指南', level: 1 }
  },
  {
    path: '/profile/feedback',
    name: 'Feedback',
    component: () => import('@/views/profile/Feedback.vue'),
    meta: { title: '意见反馈', level: 1 }
  },

  {
    path: '/demo/voice',
    name: 'VoiceDemo',
    component: () => import('@/views/square/VoiceDemo.vue'),
    meta: { title: '语音输入演示', level: 2 }
  },
  {
    path: '/demo/image',
    name: 'ImageDemo',
    component: () => import('@/views/square/ImageDemo.vue'),
    meta: { title: '图片处理演示', level: 2 }
  },
  {
    path: '/demo/state',
    name: 'StateDemo',
    component: () => import('@/views/square/StateDemo.vue'),
    meta: { title: '状态管理演示', level: 2 }
  },
  {
    path: '/demo/route',
    name: 'RouteDemo',
    component: () => import('@/views/square/RouteDemo.vue'),
    meta: { title: '路由设计演示', level: 2 }
  },
  {
    path: '/demo/http',
    name: 'HttpDemo',
    component: () => import('@/views/square/HttpDemo.vue'),
    meta: { title: 'HTTP 设计演示', level: 2 }
  },
  {
    path: '/demo/storage',
    name: 'StorageDemo',
    component: () => import('@/views/square/StorageDemo.vue'),
    meta: { title: '存储设计演示', level: 2 }
  },
  {
    path: '/demo/ui',
    name: 'UIDemo',
    component: () => import('@/views/square/UIDemo.vue'),
    meta: { title: 'UI 组件库', level: 2 }
  },
  {
    path: '/demo/realtime',
    name: 'RealtimeDemo',
    component: () => import('@/views/square/RealtimeDemo.vue'),
    meta: { title: '实时消息演示', level: 2 }
  },
  {
    path: '/demo/voice-message',
    name: 'VoiceMessageDemo',
    component: () => import('@/views/square/VoiceMessageDemo.vue'),
    meta: { title: '语音消息演示', level: 2 }
  },
  {
    path: '/demo/image-processing',
    name: 'ImageProcessingDemo',
    component: () => import('@/views/square/ImageProcessingDemo.vue'),
    meta: { title: '图片处理演示', level: 2 }
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/square/NotFound.vue'),
    meta: { title: '页面未找到', level: 99 }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})

/* ==================================================================
   ── 全局前置守卫（匿名访问 — 无需登录）──
   ================================================================== */

router.beforeEach((to, from, next) => {
  const toLevel = to.meta.level ?? 0
  const fromLevel = from.meta.level ?? 0

  if (!from.name) {
    to.meta.direction = 'forward'
  } else if (toLevel > fromLevel) {
    to.meta.direction = 'forward'
  } else if (toLevel < fromLevel) {
    to.meta.direction = 'back'
  } else {
    to.meta.direction = to.path.length < from.path.length ? 'back' : 'forward'
  }

  document.title = (to.meta.title || '互助广场') + ' - 社区互助平台'

  next()
})

export default router

export function getRouteList() {
  return routes
    .filter(r => r.name && !r.path.startsWith('/:'))
    .map(r => ({
      path: r.path,
      name: r.name,
      title: r.meta?.title || '',
      level: r.meta?.level ?? 0,
      keepAlive: r.meta?.keepAlive || false,
      requireAuth: r.meta?.requireAuth || false
    }))
}
