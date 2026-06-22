<template>
  <div class="demo-page">
    <!-- ====== 顶部导航 ====== -->
    <header class="demo-header">
      <BaseButton variant="ghost" size="sm" @click="$router.push('/square')">← 返回广场</BaseButton>
      <h1 class="demo-title">图片处理演示</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- ====== 演示说明 ====== -->
    <div class="demo-intro">
      <BaseCard flat>
        <div class="intro-grid">
          <div class="intro-item">
            <span class="intro-num">1</span>
            <span>点击上传区域选择图片（或拖拽文件到区域）</span>
          </div>
          <div class="intro-item">
            <span class="intro-num">2</span>
            <span>图片自动压缩后上传到服务器，实时显示进度</span>
          </div>
          <div class="intro-item">
            <span class="intro-num">3</span>
            <span>上传完成后点击图片可全屏预览，支持左右滑动</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 图片上传区 ====== -->
    <div class="section">
      <div class="section-header">
        <label class="section-label">上传图片</label>
        <span class="section-badge">{{ images.length }} / 9</span>
      </div>

      <BaseCard>
        <ImageUploader
          :images="images"
          :is-uploading="isUploading"
          :uploading-count="uploadingCount"
          :done-images="doneImages"
          :max-count="9"
          @add="addImages"
          @remove="removeImage"
          @retry="retryImage"
        />
      </BaseCard>
    </div>

    <!-- ====== 压缩对比（模拟本地预览） ====== -->
    <div v-if="doneImages.length > 0" class="section">
      <BaseCard flat>
        <template #header><h3 class="panel-title">已上传图片数据</h3></template>
        <div class="data-table">
          <div v-for="img in doneImages" :key="img.id" class="data-row">
            <img :src="img.thumb" class="data-thumb" alt="" />
            <div class="data-info">
              <span class="data-label">原图 URL</span>
              <span class="data-url">{{ img.original || '-' }}</span>
              <span class="data-label">缩略图 URL</span>
              <span class="data-url">{{ img.thumb || '-' }}</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== BaseImage 组件展示 ====== -->
    <div class="section">
      <BaseCard flat>
        <template #header><h3 class="panel-title">BaseImage 懒加载演示</h3></template>
        <div class="lazy-grid">
          <div v-for="i in 6" :key="i" class="lazy-item">
            <p class="lazy-label">比例 {{ ['1/1','4/3','16/9','3/4','2/3','1/2'][i-1] }}</p>
            <BaseImage
              :src="doneImages.length > 0 ? doneImages[0].thumb : ''"
              :alt="'演示 ' + i"
              :ratio="['1/1','4/3','16/9','3/4','2/3','1/2'][i - 1]"
              fit="cover"
            />
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- ====== 调试面板 ====== -->
    <div class="section">
      <BaseCard flat>
        <template #header><h3 class="panel-title">状态调试面板</h3></template>
        <div class="debug-grid">
          <div class="debug-item">
            <span class="debug-label">图片总数</span>
            <span class="debug-value">{{ images.length }}</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">已上传完成</span>
            <BaseBadge :color="doneImages.length > 0 ? 'success' : 'default'">{{ doneImages.length }}</BaseBadge>
          </div>
          <div class="debug-item">
            <span class="debug-label">上传中</span>
            <BaseBadge :color="isUploading ? 'warning' : 'default'">{{ isUploading ? uploadingCount + ' 张' : '无' }}</BaseBadge>
          </div>
          <div class="debug-item">
            <span class="debug-label">有错误</span>
            <BaseBadge :color="hasError ? 'danger' : 'default'">{{ hasError ? '是' : '否' }}</BaseBadge>
          </div>
          <div class="debug-item">
            <span class="debug-label">压缩库</span>
            <span class="debug-value">CompressorJS v1.2</span>
          </div>
          <div class="debug-item">
            <span class="debug-label">压缩参数</span>
            <span class="debug-value">quality=0.8, max=1920px</span>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { useImageUpload } from '@/composables/useImageUpload';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseImage from '@/components/ui/BaseImage.vue';
import ImageUploader from './components/ImageUploader.vue';

const {
  images,
  isUploading,
  uploadingCount,
  doneImages,
  hasError,
  addImages,
  removeImage,
  retryImage
} = useImageUpload({ maxCount: 9, maxWidth: 1920, quality: 0.8 });
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: var(--space-10);
}

.demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--space-4);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}
.demo-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }
.header-spacer { width: 60px; }

.demo-intro {
  max-width: var(--content-max);
  margin: var(--space-4) auto 0;
  padding: 0 var(--space-4);
}
.intro-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.intro-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-base);
  color: var(--text-secondary);
}
.intro-num {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: var(--brand-50);
  color: var(--brand-500);
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

/* 分区 */
.section {
  max-width: var(--content-max);
  margin: var(--space-4) auto;
  padding: 0 var(--space-4);
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}
.section-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
}
.section-badge {
  font-size: var(--text-sm);
  color: var(--text-muted);
  background: var(--gray-100);
  padding: 2px 10px;
  border-radius: var(--radius-full);
}

/* 数据表格 */
.panel-title { font-size: var(--text-base); font-weight: var(--font-bold); margin: 0; }
.data-table {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.data-row {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--gray-50);
  border-radius: var(--radius-sm);
}
.data-thumb {
  width: 64px; height: 64px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}
.data-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.data-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.data-url {
  font-size: var(--text-xs);
  color: var(--text-primary);
  word-break: break-all;
  font-family: monospace;
}

/* 懒加载演示 */
.lazy-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}
.lazy-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.lazy-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin: 0;
}

/* 调试面板 */
.debug-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}
.debug-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.debug-label { font-size: var(--text-sm); color: var(--text-muted); min-width: 72px; }
.debug-value { font-size: var(--text-base); font-weight: var(--font-medium); }
</style>
