<template>
  <div class="post-edit-page">
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="header-title">编辑发布</h1>
      <span class="header-spacer"></span>
    </header>

    <div class="edit-content">
      <!-- 分类选择器 -->
      <div class="edit-section">
        <label class="edit-label">分类</label>
        <div class="category-selector">
          <button
            v-for="cat in editableCategories"
            :key="cat.value"
            :class="['cat-chip', { active: form.category === cat.value }]"
            @click="form.category = cat.value"
          >{{ cat.name }}</button>
        </div>
      </div>

      <!-- 内容编辑 -->
      <div class="edit-section">
        <label class="edit-label">内容</label>
        <textarea
          v-model="form.content"
          class="content-textarea"
          rows="6"
          placeholder="编辑您的内容..."
        ></textarea>
      </div>

      <!-- 操作按钮 -->
      <div class="edit-actions">
        <BaseButton variant="ghost" size="lg" @click="$router.back()">取消</BaseButton>
        <BaseButton variant="primary" size="lg" @click="saveEdit">保存修改</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useAppStore } from '@/stores/app';
import BaseButton from '@/components/ui/BaseButton.vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const app = useAppStore();

const editableCategories = [
  { name: '求助', value: 'help' },
  { name: '闲置', value: 'idle' },
  { name: '交流', value: 'chat' },
  { name: '医院便民', value: 'hospital' },
  { name: '政策解读', value: 'policy' },
  { name: '防诈骗', value: 'anti_fraud' }
];

const form = reactive({
  category: 'help',
  content: ''
});

onMounted(() => {
  const postId = route.params.id;
  const post = userStore.myPosts.find(p => p.id === postId);
  if (post) {
    form.category = post.category;
    form.content = post.content;
  }
});

function saveEdit() {
  const postId = route.params.id;
  userStore.updateMyPost(postId, {
    category: form.category,
    content: form.content,
    updated_at: new Date().toISOString()
  });
  app.showToast('修改已保存');
  router.back();
}
</script>

<style scoped>
.post-edit-page {
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

.edit-content { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-5); }

.edit-section { display: flex; flex-direction: column; gap: var(--space-2); }
.edit-label {
  font-size: var(--text-base); font-weight: var(--font-semibold);
  color: var(--text-primary);
}
.category-selector { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.cat-chip {
  padding: var(--space-2) var(--space-4); border-radius: var(--radius-full);
  border: 2px solid var(--border-light); background: var(--bg-card);
  font-family: inherit; font-size: var(--text-base); color: var(--text-secondary);
  cursor: pointer; transition: all var(--duration-fast);
}
.cat-chip.active { background: var(--brand-400); color: #fff; border-color: var(--brand-400); }
.cat-chip:active { transform: scale(0.95); }

.content-textarea {
  width: 100%; padding: var(--space-4);
  font-size: var(--text-base); font-family: inherit; line-height: var(--leading-relaxed);
  border: 2px solid var(--border-normal); border-radius: var(--radius-md);
  resize: vertical; outline: none; box-sizing: border-box;
  color: var(--text-primary);
}
.content-textarea:focus { border-color: var(--brand-400); }

.edit-actions { display: flex; gap: var(--space-3); justify-content: flex-end; padding-top: var(--space-4); }
</style>
