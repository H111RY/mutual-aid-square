<template>
  <div class="page-container">
    <router-view v-slot="{ Component, route }">
      <template v-if="route.name === 'Login' || route.name === 'NicknameSetup'">
        <component :is="Component" />
      </template>
      <template v-else>
        <transition :name="'page-' + (route.meta.direction || 'forward')" mode="out-in">
          <keep-alive :include="keepAliveList">
            <component :is="Component" :key="route.meta.keepAlive ? undefined : route.fullPath" />
          </keep-alive>
        </transition>
      </template>
    </router-view>
  </div>

  <!-- 底部 Tab 导航（仅在主页面显示） -->
  <BottomTabNav v-if="showTabBar" />
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSquareStore } from '@/stores/square';
import { useAppStore } from '@/stores/app';
import { getRouteList } from '@/router';
import BottomTabNav from '@/components/layout/BottomTabNav.vue';

const route = useRoute();
const router = useRouter();
const square = useSquareStore();
const app = useAppStore();

// 底部 Tab 栏只在主页面显示
const showTabBar = computed(() => {
  const name = route.name;
  return name === 'SquareHome' || name === 'CommunicationHome' || name === 'ProfileHome';
});

// 收集所有标记 keepAlive 的组件名
const keepAliveList = computed(() => {
  return getRouteList()
    .filter(r => r.keepAlive)
    .map(r => r.name);
});

onMounted(() => {
  square.initFontMode();
  app.init();
  app.restoreSession();

  window.addEventListener('auth:expired', () => {
    router.push({ name: 'Login', query: { redirect: route.fullPath } });
  });
});
</script>

<style>
/* ── 页面容器（为绝对定位过渡提供定位参照 + 撑起高度）── */
.page-container {
  position: relative;
  min-height: 100vh;
}

/* ── 页面过渡动画 ── */
.page-forward-enter-active,
.page-forward-leave-active,
.page-back-enter-active,
.page-back-leave-active {
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
}

/* 前进：新页从右侧滑入，旧页向左缩退 */
.page-forward-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.page-forward-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 后退：新页从左侧滑入，旧页向右退出 */
.page-back-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}
.page-back-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
