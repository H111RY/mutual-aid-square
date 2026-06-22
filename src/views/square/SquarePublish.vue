<template>
  <div class="publish-page">
    <!-- ====== 顶部导航 ====== -->
    <header class="publish-header">
      <BaseButton variant="ghost" size="sm" @click="handleBack">← 返回</BaseButton>
      <h1 class="header-title">发布信息</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- ====== 语音输入区（双路径自适应） ====== -->
    <div class="voice-hero">
      <VoiceRecorder
        :path="voicePath"
        :status="voiceStatus"
        :duration="duration"
        :volume="volume"
        :interim-text="interimText"
        :final-text="finalText"
        :current-lang="currentLang"
        :error-message="errorMessage"
        :dialects="dialects"
        :upload-progress="uploadProgress"
        :audio-url="audioUrl"
        :max-duration="maxDuration"
        @toggle="toggleVoice"
        @start="startVoice"
        @stop="stopVoice"
        @set-dialect="setDialect"
        @clear="clearVoice"
        @cancel="cancelFallbackRecording"
        @confirm="confirmAndRecognize"
        @retry="retryRecording"
      />
    </div>

    <!-- ====== 分类选择 ====== -->
    <div class="section">
      <label class="section-label">选择分类</label>
      <div class="category-row">
        <BaseButton
          v-for="cat in categories"
          :key="cat.value"
          :variant="form.category === cat.value ? 'primary' : 'outline'"
          size="sm"
          round
          @click="form.category = cat.value"
        >{{ cat.name }}</BaseButton>
      </div>
    </div>

    <!-- ====== 文字编辑区 ====== -->
    <div class="section">
      <BaseTextarea
        v-model="form.content"
        label="文字编辑（可二次修改语音结果）"
        placeholder="语音识别的文字会显示在这里，也可以直接打字..."
        :rows="5"
      />
    </div>

    <!-- ====== 图片上传 ====== -->
    <div class="section">
      <div class="section-header">
        <label class="section-label">上传图片</label>
        <span class="section-count">{{ images.length }} / 9</span>
      </div>
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
    </div>

    <!-- ====== 提交栏 ====== -->
    <div class="submit-bar">
      <BaseButton
        variant="primary"
        size="lg"
        block
        :disabled="!canSubmit || submitting"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '发布中...' : '发布信息' }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSquareStore } from '@/stores/square';
import { useVoiceInput } from '@/composables/useVoiceInput';
import { useImageUpload } from '@/composables/useImageUpload';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseTextarea from '@/components/ui/BaseTextarea.vue';
import VoiceRecorder from './components/VoiceRecorder.vue';
import ImageUploader from './components/ImageUploader.vue';

const router = useRouter();
const store = useSquareStore();

const categories = [
  { name: '交流', value: 'chat' },
  { name: '求助', value: 'help' },
  { name: '闲置', value: 'idle' }
];

const form = reactive({ category: 'chat', content: '' });
const submitting = ref(false);
const hasDraft = ref(false);

/* ── 语音输入 ── */
const {
  status: voiceStatus,
  duration,
  volume,
  interimText,
  finalText,
  currentLang,
  errorMessage,
  dialects,
  path: voicePath,
  uploadProgress,
  audioUrl,
  maxDuration,
  toggle: toggleVoice,
  start: startVoice,
  stop: stopVoice,
  setDialect,
  clearText: clearVoice,
  confirmAndRecognize,
  retryRecording,
  cancelFallbackRecording
} = useVoiceInput({
  lang: 'zh-CN',
  onResult: (fullText) => {
    form.content = fullText;
    hasDraft.value = true;
  },
  onInterim: (interim) => {
    // 实时中间结果显示在 VoiceRecorder 中
  },
  onError: (msg) => {
    // 错误显示在 VoiceRecorder 中
  }
});

/* ── 图片上传 ── */
const {
  images, isUploading, uploadingCount, doneImages, hasError,
  addImages, removeImage, retryImage, getUploadedImages
} = useImageUpload({ maxCount: 9, maxWidth: 1920, quality: 0.8 });

/* ── 提交 ── */
const canSubmit = computed(() => form.content.trim().length > 0);

async function handleSubmit() {
  if (!canSubmit.value || submitting.value) return;
  submitting.value = true;
  try {
    const imageData = getUploadedImages();
    store.addPost({
      category: form.category,
      content: form.content,
      ...(imageData.length > 0 && { images: imageData })
    });
    router.back();
  } catch (err) {
    alert('发布失败，请重试');
  } finally {
    submitting.value = false;
  }
}

/* ── 返回 ── */
function handleBack() {
  if (hasDraft.value && form.content.trim()) {
    if (confirm('有未发布的内容，确定离开吗？')) {
      router.back();
    }
  } else {
    router.back();
  }
}
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 120px;
}

/* 头部 */
.publish-header {
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
.header-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }
.header-spacer { width: 60px; }

/* 语音区 — 页面核心，占视觉重心 */
.voice-hero {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  padding: var(--space-2) 0;
}

/* 通用分区 */
.section {
  padding: var(--space-4);
  max-width: var(--content-max);
  margin: 0 auto;
}
.section-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

/* 分类 */
.category-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}
.section-count {
  font-size: var(--text-sm);
  color: var(--text-muted);
  background: var(--gray-100);
  padding: 2px 10px;
  border-radius: var(--radius-full);
}

/* 提交栏 */
.submit-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding: var(--space-4); background: var(--bg-card); border-top: 1px solid var(--border-light);
}
</style>
