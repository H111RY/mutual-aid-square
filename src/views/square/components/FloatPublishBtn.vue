<template>
  <div class="float-wrapper">
    <BaseButton
      class="float-btn"
      variant="primary"
      round
      @click="router.push('/square/publish')"
      aria-label="发布信息"
    >
      <template #icon><span class="plus-icon">＋</span></template>
      发布
    </BaseButton>
    <transition name="tip-fade">
      <div v-if="showTip" class="publish-tip">按住说话发布信息</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';
import { getItem, setItem } from '@/storage/core';

const router = useRouter();
const showTip = ref(false);

onMounted(() => {
  if (!getItem('publish_tip_seen')) {
    showTip.value = true;
    setTimeout(() => {
      showTip.value = false;
      setItem('publish_tip_seen', '1');
    }, 5000);
  }
});
</script>

<style scoped>
.float-wrapper { position: fixed; right: 32px; bottom: 64px; z-index: 200; }
.float-btn {
  width: 64px; height: 64px; flex-direction: column; gap: 0;
  box-shadow: var(--shadow-float);
  font-size: var(--text-xs);
}
.float-btn:hover { transform: scale(1.06); }
.float-btn:active { transform: scale(0.94); }
.plus-icon { font-size: 26px; font-weight: 300; line-height: 1; }

.publish-tip {
  position: absolute; right: 78px; top: 50%; transform: translateY(-50%);
  background: var(--gray-800); color: #fff;
  padding: 10px 18px; border-radius: 10px;
  font-size: var(--text-sm); white-space: nowrap; pointer-events: none;
}
.publish-tip::after {
  content: ''; position: absolute; right: -8px; top: 50%; transform: translateY(-50%);
  width: 0; height: 0; border-top: 7px solid transparent;
  border-bottom: 7px solid transparent; border-left: 10px solid var(--gray-800);
}
.tip-fade-enter-active { transition: all 0.4s var(--ease-out); }
.tip-fade-leave-active { transition: all 0.3s var(--ease-in-out); }
.tip-fade-enter-from, .tip-fade-leave-to { opacity: 0; transform: translateY(-50%) translateX(12px); }
</style>
