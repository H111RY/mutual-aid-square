<template>
  <div class="image-uploader">
    <!-- ====== 拖拽上传区 ====== -->
    <div
      v-if="images.length < maxCount"
      :class="['upload-zone', { dragging: isDragging }]"
      @click="$refs.fileInput?.click()"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <div class="upload-zone-content">
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" class="upload-zone-icon">
          <rect x="6" y="8" width="36" height="32" rx="4" stroke="currentColor" stroke-width="2.5"/>
          <circle cx="17" cy="19" r="3" fill="currentColor"/>
          <path d="M6 32L16 22L24 30L32 20L42 28V36C42 38.2 40.2 40 38 40H10C7.8 40 6 38.2 6 36V32Z" fill="currentColor" opacity="0.3"/>
        </svg>
        <span class="upload-zone-text">{{ isDragging ? '松开即可上传' : '点击或拖拽上传图片' }}</span>
        <span class="upload-zone-hint">支持 JPG、PNG、WebP，最多 {{ maxCount }} 张</span>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        class="file-input-hidden"
        @change="onFileChange"
      />
    </div>

    <!-- ====== 图片预览网格 ====== -->
    <div v-if="images.length > 0" class="preview-grid">
      <div
        v-for="img in images"
        :key="img.id"
        :class="['preview-item', 'status-' + img.status]"
        @click="img.status === 'done' ? openPreview(img) : null"
      >
        <!-- 图片 -->
        <img
          v-if="img.preview || img.thumb"
          :src="img.preview || img.thumb"
          class="preview-img"
          alt=""
        />

        <!-- 状态遮罩层 -->
        <div v-if="img.status === 'compressing'" class="status-overlay">
          <div class="compressing-spinner"></div>
          <span class="status-text">压缩中</span>
        </div>

        <div v-else-if="img.status === 'uploading'" class="status-overlay">
          <div class="progress-ring-wrap">
            <svg viewBox="0 0 48 48" width="48" height="48" class="progress-ring">
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
              <circle
                cx="24" cy="24" r="20"
                fill="none"
                stroke="#fff"
                stroke-width="3"
                stroke-linecap="round"
                :stroke-dasharray="2 * Math.PI * 20"
                :stroke-dashoffset="2 * Math.PI * 20 * (1 - img.progress / 100)"
                class="progress-arc"
              />
            </svg>
            <span class="progress-text">{{ img.progress }}%</span>
          </div>
        </div>

        <div v-else-if="img.status === 'error'" class="status-overlay error-overlay">
          <span class="error-icon">!</span>
          <span class="status-text error-text">{{ img.errorMsg || '失败' }}</span>
          <BaseButton
            variant="primary"
            size="sm"
            class="retry-btn"
            @click.stop="retryImage(img.id)"
          >重试</BaseButton>
        </div>

        <!-- 删除按钮 -->
        <button
          v-if="img.status !== 'uploading'"
          class="remove-btn"
          @click.stop="removeImage(img.id)"
          aria-label="删除图片"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- 继续添加按钮 -->
      <div
        v-if="images.length < maxCount"
        class="preview-item add-more"
        @click="$refs.fileInput?.click()"
      >
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="add-more-text">{{ images.length }}/{{ maxCount }}</span>
      </div>
    </div>

    <!-- ====== 上传中提示 ====== -->
    <div v-if="isUploading" class="uploading-bar">
      <span class="uploading-dot"></span>
      <span>正在上传 {{ uploadingCount }} 张图片...</span>
    </div>

    <!-- ====== 全屏预览 ====== -->
    <ImageViewer
      v-model="viewerVisible"
      :images="doneImages"
      :start-index="viewerStartIndex"
      @close="viewerVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import ImageViewer from './ImageViewer.vue';

const props = defineProps({
  images:        { type: Array, default: () => [] },
  isUploading:   { type: Boolean, default: false },
  uploadingCount: { type: Number, default: 0 },
  doneImages:    { type: Array, default: () => [] },
  maxCount:      { type: Number, default: 9 }
});

const emit = defineEmits(['add', 'remove', 'retry']);

const isDragging = ref(false);
const fileInput = ref(null);
const viewerVisible = ref(false);
const viewerStartIndex = ref(0);

function onFileChange(e) {
  if (e.target.files.length > 0) {
    emit('add', e.target.files);
    e.target.value = '';
  }
}

function onDrop(e) {
  isDragging.value = false;
  if (e.dataTransfer.files.length > 0) {
    emit('add', e.dataTransfer.files);
  }
}

function openPreview(img) {
  const idx = props.doneImages.findIndex(i => i.id === img.id);
  viewerStartIndex.value = idx >= 0 ? idx : 0;
  viewerVisible.value = true;
}
</script>

<style scoped>
.image-uploader {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* ── 上传区域 ── */
.upload-zone {
  border: 2px dashed var(--border-normal);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  cursor: pointer;
  transition: all var(--duration-fast);
  background: var(--gray-50);
  position: relative;
}
.upload-zone:hover,
.upload-zone.dragging {
  border-color: var(--brand-400);
  background: var(--brand-50);
}
.upload-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  pointer-events: none;
}
.upload-zone-icon {
  color: var(--brand-400);
}
.upload-zone-text {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}
.upload-zone-hint {
  font-size: var(--text-sm);
  color: var(--text-muted);
}
.file-input-hidden {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

/* ── 预览网格 ── */
.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--gray-200);
  cursor: pointer;
}
.preview-item.status-done { cursor: pointer; }
.preview-item.status-uploading,
.preview-item.status-compressing { cursor: default; }

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── 状态遮罩 ── */
.status-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}
.status-text {
  font-size: var(--text-sm);
  color: #fff;
  font-weight: var(--font-medium);
}

/* 压缩中旋转 */
.compressing-spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 上传进度环 */
.progress-ring-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.progress-ring {
  transform: rotate(-90deg);
}
.progress-arc {
  transition: stroke-dashoffset 0.3s ease;
}
.progress-text {
  position: absolute;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: #fff;
}

/* 错误状态 */
.error-overlay {
  background: rgba(198, 40, 40, 0.75);
}
.error-icon {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #fff;
  color: var(--red-500);
  display: flex; align-items: center; justify-content: center;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
}
.error-text {
  text-align: center; max-width: 90%; line-height: 1.3;
}
.retry-btn {
  margin-top: var(--space-1);
}

/* ── 删除按钮 ── */
.remove-btn {
  position: absolute;
  top: 4px; right: 4px;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background var(--duration-fast);
  z-index: 3;
}
.remove-btn:hover { background: rgba(198, 40, 40, 0.8); }

/* ── 继续添加 ── */
.add-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  border: 2px dashed var(--border-normal);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--duration-fast);
  background: var(--gray-50);
}
.add-more:hover {
  border-color: var(--brand-400);
  color: var(--brand-400);
}
.add-more-text {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

/* ── 上传中状态栏 ── */
.uploading-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--brand-50);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--brand-600);
}
.uploading-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--brand-500);
  animation: blink 1s infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
