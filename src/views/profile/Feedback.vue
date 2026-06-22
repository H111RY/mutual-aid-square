<template>
  <div class="feedback-page" :class="{ 'large-font': squareStore.isLargeFont }">
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="header-title">意见反馈</h1>
      <span class="header-spacer"></span>
    </header>

    <div class="feedback-content">
      <!-- 成功页 -->
      <div v-if="submitted" class="success-page">
        <div class="success-icon">
          <svg viewBox="0 0 48 48" width="80" height="80" fill="none">
            <circle cx="24" cy="24" r="22" stroke="var(--green-500)" stroke-width="3"/>
            <path d="M14 25L21 32L34 17" stroke="var(--green-500)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="success-title">感谢您的反馈！</h2>
        <p class="success-desc">工作人员将在 1-3 个工作日内回复您</p>
        <BaseButton variant="primary" size="lg" @click="newFeedback">继续反馈</BaseButton>
      </div>

      <!-- 反馈表单 -->
      <div v-else>
        <!-- 反馈类型 -->
        <section class="form-section">
          <label class="section-label">反馈类型</label>
          <div class="type-selector">
            <button
              v-for="t in feedbackTypes"
              :key="t.value"
              :class="['type-chip', { active: form.type === t.value }]"
              @click="form.type = t.value"
            >
              <span class="type-icon">{{ t.icon }}</span>
              <span class="type-name">{{ t.label }}</span>
            </button>
          </div>
        </section>

        <!-- 反馈内容 -->
        <section class="form-section">
          <label class="section-label">详细描述</label>
          <textarea
            v-model="form.content"
            class="feedback-textarea"
            rows="5"
            placeholder="请描述您遇到的问题或建议..."
          ></textarea>
        </section>

        <!-- 联系方式 -->
        <section class="form-section">
          <label class="section-label">联系方式（选填）</label>
          <input
            v-model="form.contact"
            type="text"
            class="contact-input"
            placeholder="手机号或微信号"
          />
          <p class="privacy-hint">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
              <path d="M12 2L3 7V12C3 17.5 6.8 22.7 12 24C17.2 22.7 21 17.5 21 12V7L12 2Z" stroke="var(--green-600)" stroke-width="2"/>
              <path d="M8 12L11 15L16 9" stroke="var(--green-600)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            您的联系方式仅用于问题跟进，不会公开
          </p>
        </section>

        <!-- 提交按钮 -->
        <BaseButton
          variant="primary"
          size="lg"
          block
          :disabled="!form.content.trim()"
          @click="submitFeedback"
        >提交反馈</BaseButton>

        <!-- 反馈历史 -->
        <section class="history-section" v-if="userStore.myFeedback.length > 0">
          <h3 class="history-title">我的反馈历史</h3>
          <div
            v-for="fb in userStore.myFeedback"
            :key="fb.id"
            class="feedback-card"
          >
            <div class="fb-top">
              <span :class="['fb-type', 'fb-' + fb.type]">{{ typeName(fb.type) }}</span>
              <span :class="['fb-status', 'fs-' + fb.status]">{{ statusName(fb.status) }}</span>
              <span class="fb-time">{{ timeAgo(fb.created_at) }}</span>
            </div>
            <p class="fb-content">{{ fb.content }}</p>
            <div v-if="fb.admin_reply" class="fb-reply">
              <span class="reply-label">管理员回复：</span>
              <span class="reply-text">{{ fb.admin_reply }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useSquareStore } from '@/stores/square';
import { useUserStore } from '@/stores/user';
import { useAppStore } from '@/stores/app';
import BaseButton from '@/components/ui/BaseButton.vue';

const squareStore = useSquareStore();
const userStore = useUserStore();
const app = useAppStore();

const submitted = ref(false);

const feedbackTypes = [
  { label: '建议', value: 'suggestion', icon: '💡' },
  { label: '问题', value: 'problem', icon: '🐛' },
  { label: '投诉', value: 'complaint', icon: '📢' },
  { label: '其他', value: 'other', icon: '💬' }
];

const form = reactive({
  type: 'suggestion',
  content: '',
  contact: ''
});

function submitFeedback() {
  if (!form.content.trim()) return;
  userStore.addFeedback({
    id: 'fb_' + Date.now(),
    type: form.type,
    content: form.content,
    contact: form.contact,
    status: 'pending',
    created_at: new Date().toISOString()
  });
  submitted.value = true;
}

function newFeedback() {
  submitted.value = false;
  form.type = 'suggestion';
  form.content = '';
  form.contact = '';
}

function typeName(t) {
  const map = { suggestion: '建议', problem: '问题', complaint: '投诉', other: '其他' };
  return map[t] || t;
}

function statusName(s) {
  const map = { pending: '待处理', processing: '处理中', replied: '已回复', resolved: '已解决' };
  return map[s] || s;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
  if (diff < 604800) return Math.floor(diff / 86400) + '天前';
  const d = new Date(dateStr);
  return (d.getMonth() + 1) + '/' + d.getDate();
}
</script>

<style scoped>
.feedback-page {
  min-height: 100vh;
  background: var(--bg-page);
  max-width: var(--content-max);
  margin: 0 auto;
}
.page-header {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--space-4);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
}
.back-btn {
  width: var(--tap-min); height: var(--tap-min);
  display: flex; align-items: center; justify-content: center;
  border: none; background: none; cursor: pointer;
  color: var(--text-primary); border-radius: 50%;
}
.back-btn:active { background: var(--gray-100); }
.header-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }
.header-spacer { width: var(--tap-min); }

.feedback-content { padding: var(--space-4); }

/* Success page */
.success-page {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: var(--space-12) var(--space-4);
}
.success-icon { margin-bottom: var(--space-4); }
.success-title {
  font-size: var(--text-2xl); font-weight: var(--font-bold);
  color: var(--text-primary); margin: 0 0 var(--space-2);
}
.success-desc {
  font-size: var(--text-lg); color: var(--text-secondary);
  margin: 0 0 var(--space-6);
}

/* Form sections */
.form-section { margin-bottom: var(--space-5); }
.section-label {
  display: block; font-size: var(--text-base); font-weight: var(--font-semibold);
  color: var(--text-primary); margin-bottom: var(--space-2);
}

.type-selector { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2); }
.type-chip {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-1);
  padding: var(--space-3); border-radius: var(--radius-md);
  border: 2px solid var(--border-light); background: var(--bg-card);
  cursor: pointer; font-family: inherit; transition: all var(--duration-fast);
}
.type-chip.active { border-color: var(--brand-400); background: var(--brand-50); }
.type-icon { font-size: var(--text-xl); }
.type-name { font-size: var(--text-sm); font-weight: var(--font-medium); color: var(--text-primary); }

.feedback-textarea {
  width: 100%; padding: var(--space-4);
  font-size: var(--text-base); font-family: inherit;
  line-height: var(--leading-relaxed);
  border: 2px solid var(--border-normal); border-radius: var(--radius-md);
  resize: vertical; outline: none; box-sizing: border-box;
}
.feedback-textarea:focus { border-color: var(--brand-400); }

.contact-input {
  width: 100%; height: var(--tap-comfortable);
  padding: 0 var(--space-4); font-size: var(--text-base); font-family: inherit;
  border: 2px solid var(--border-normal); border-radius: var(--radius-md);
  outline: none; box-sizing: border-box;
}
.contact-input:focus { border-color: var(--brand-400); }

.privacy-hint {
  display: flex; align-items: center; gap: var(--space-1);
  font-size: var(--text-xs); color: var(--text-muted);
  margin: var(--space-2) 0 0;
}

/* History */
.history-section { margin-top: var(--space-8); }
.history-title {
  font-size: var(--text-lg); font-weight: var(--font-bold);
  color: var(--text-primary); margin: 0 0 var(--space-3);
  padding-left: var(--space-2); border-left: 3px solid var(--brand-400);
}
.feedback-card {
  background: var(--bg-card); border: 1px solid var(--border-light);
  border-radius: var(--radius-md); padding: var(--space-4);
  margin-bottom: var(--space-2);
}
.fb-top { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2); }
.fb-type {
  font-size: var(--text-xs); padding: 2px 8px; border-radius: var(--radius-sm);
  font-weight: var(--font-semibold);
}
.fb-suggestion { background: var(--blue-50); color: var(--blue-500); }
.fb-problem { background: var(--amber-50); color: var(--amber-700); }
.fb-complaint { background: var(--red-50); color: var(--red-500); }
.fb-other { background: var(--gray-100); color: var(--gray-600); }
.fb-status { font-size: var(--text-xs); font-weight: var(--font-medium); }
.fs-pending { color: var(--amber-500); }
.fs-processing { color: var(--blue-500); }
.fs-replied { color: var(--brand-500); }
.fs-resolved { color: var(--green-500); }
.fb-time { font-size: var(--text-xs); color: var(--text-muted); margin-left: auto; }
.fb-content { font-size: var(--text-base); color: var(--text-primary); line-height: var(--leading-relaxed); margin: 0 0 var(--space-2); }
.fb-reply {
  background: var(--brand-50); border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3); font-size: var(--text-sm);
}
.reply-label { font-weight: var(--font-semibold); color: var(--brand-500); }
.reply-text { color: var(--text-secondary); }

.safe-bottom { height: var(--space-10); }
</style>
