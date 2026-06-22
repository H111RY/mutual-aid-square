<template>
  <Teleport to="body">
    <transition name="viewer-fade">
      <div v-if="visible" class="image-viewer-overlay" @click.self="$emit('close')">
        <!-- 顶部工具栏 -->
        <div class="viewer-toolbar">
          <span class="viewer-counter">{{ currentIndex + 1 }} / {{ images.length }}</span>
          <button class="viewer-close-btn" @click="$emit('close')" aria-label="关闭">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- 图片主体 -->
        <div class="viewer-stage" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
          <button
            v-if="images.length > 1"
            class="viewer-nav prev"
            @click.stop="navigate(-1)"
            aria-label="上一张"
          >
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
              <polyline points="15,4 7,12 15,20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <div class="viewer-image-wrap" :style="{ transform: `scale(${scale}) translate(${tx}px, ${ty}px)` }">
            <BaseImage
              :src="currentImage"
              alt="预览图片"
              fit="contain"
              class="viewer-image"
            />
          </div>

          <button
            v-if="images.length > 1"
            class="viewer-nav next"
            @click.stop="navigate(1)"
            aria-label="下一张"
          >
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
              <polyline points="9,4 17,12 9,20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- 底部缩略图导航 -->
        <div v-if="images.length > 1" class="viewer-thumbs">
          <button
            v-for="(img, idx) in images"
            :key="idx"
            :class="['thumb-dot', { active: idx === currentIndex }]"
            @click="currentIndex = idx"
            :aria-label="'第' + (idx + 1) + '张'"
          ></button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import BaseImage from '@/components/ui/BaseImage.vue';

const props = defineProps({
  images:    { type: Array, default: () => [] },
  modelValue: { type: Boolean, default: false },
  startIndex: { type: Number, default: 0 }
});

const emit = defineEmits(['update:modelValue', 'close']);

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
});

const currentIndex = ref(props.startIndex);
const scale = ref(1);
const tx = ref(0);
const ty = ref(0);

const currentImage = computed(() => props.images[currentIndex.value]?.original || props.images[currentIndex.value]?.thumb || '');

// ── 键盘导航 ──
function onKeydown(e) {
  if (!visible.value) return;
  if (e.key === 'Escape') { emit('close'); }
  if (e.key === 'ArrowLeft') { navigate(-1); }
  if (e.key === 'ArrowRight') { navigate(1); }
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));

watch(() => props.modelValue, (v) => {
  if (v) {
    currentIndex.value = props.startIndex;
    scale.value = 1; tx.value = 0; ty.value = 0;
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

function navigate(dir) {
  const next = currentIndex.value + dir;
  if (next >= 0 && next < props.images.length) {
    currentIndex.value = next;
    scale.value = 1; tx.value = 0; ty.value = 0;
  }
}

// ── 触摸滑动 ──
let touchStartX = 0;
let touchStartY = 0;

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function onTouchMove(e) {
  // 双指缩放
  if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    scale.value = Math.max(1, Math.min(3, dist / 200));
  }
}

function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 80 && scale.value === 1) {
    navigate(dx > 0 ? -1 : 1);
  }
}
</script>

<style scoped>
.image-viewer-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ── 动画 ── */
.viewer-fade-enter-active,
.viewer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.viewer-fade-enter-from,
.viewer-fade-leave-to {
  opacity: 0;
}

/* ── 工具栏 ── */
.viewer-toolbar {
  position: absolute;
  top: 0; left: 0; right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  z-index: 10;
}
.viewer-counter {
  font-size: var(--text-base);
  color: #fff;
  font-weight: var(--font-medium);
  background: rgba(0,0,0,0.4);
  padding: 4px 14px;
  border-radius: var(--radius-full);
}
.viewer-close-btn {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.4);
  border: none; border-radius: 50%;
  color: #fff; cursor: pointer;
  transition: background var(--duration-fast);
}
.viewer-close-btn:hover { background: rgba(255,255,255,0.2); }

/* ── 图片舞台 ── */
.viewer-stage {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.viewer-image-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  padding: 0 48px;
}
.viewer-image {
  max-width: 100%;
  max-height: 80vh;
}

/* ── 导航按钮 ── */
.viewer-nav {
  position: absolute;
  top: 50%;
  z-index: 5;
  width: 56px; height: 56px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.15);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transform: translateY(-50%);
  transition: background var(--duration-fast);
}
.viewer-nav:hover { background: rgba(255,255,255,0.3); }
.viewer-nav.prev { left: var(--space-2); }
.viewer-nav.next { right: var(--space-2); }

/* ── 底部缩略图点 ── */
.viewer-thumbs {
  display: flex;
  gap: 8px;
  padding: var(--space-3);
  justify-content: center;
}
.thumb-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.5);
  background: transparent;
  cursor: pointer;
  transition: all var(--duration-fast);
  padding: 0;
}
.thumb-dot.active {
  background: #fff;
  border-color: #fff;
  transform: scale(1.2);
}
</style>
