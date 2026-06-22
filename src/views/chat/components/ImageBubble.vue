<template>
  <div
    :class="['image-bubble', { mine }]"
    @click="previewVisible = true"
  >
    <div :class="['img-wrapper', { loading: isSending }]">
      <BaseImage
        :src="thumbSrc"
        :alt="'图片消息'"
        ratio="auto"
        fit="cover"
      />
      <div v-if="isSending" class="sending-overlay">
        <span class="mini-spinner"></span>
      </div>
    </div>
    <!-- 全屏预览 -->
    <Teleport to="body">
      <div v-if="previewVisible" class="img-preview-mask" @click="previewVisible = false">
        <img :src="originalSrc" class="preview-img" @click.stop />
        <button class="preview-close" @click="previewVisible = false">✕</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Teleport } from 'vue';
import BaseImage from '@/components/ui/BaseImage.vue';

const props = defineProps({
  msg: { type: Object, required: true },
  mine: { type: Boolean, default: false }
});

const previewVisible = ref(false);

const originalSrc = computed(() => props.msg.extra?.original || props.msg.content);
const thumbSrc = computed(() => props.msg.extra?.thumb || props.msg.content);
const isSending = computed(() => props.msg._status === 'sending');
</script>

<style scoped>
.image-bubble { cursor: pointer; max-width: 240px; }
.image-bubble.mine { margin-left: auto; }

.img-wrapper {
  border-radius: var(--radius-md); overflow: hidden;
  position: relative; max-height: 240px;
}
.img-wrapper.loading { opacity: 0.5; }

.sending-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.15);
}
.mini-spinner {
  width: 24px; height: 24px;
  border: 3px solid rgba(255,255,255,0.5);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 全屏预览 */
.img-preview-mask {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center;
}
.preview-img {
  max-width: 95vw; max-height: 95vh;
  object-fit: contain; border-radius: var(--radius-sm);
}
.preview-close {
  position: absolute; top: var(--space-4); right: var(--space-4);
  width: var(--tap-min); height: var(--tap-min);
  border-radius: 50%; background: rgba(255,255,255,0.15); color: #fff;
  font-size: 20px; display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer;
}
</style>
