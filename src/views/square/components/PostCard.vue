<template>
  <BaseCard :class="['post-card', { 'is-top': post.isTop }]" @click="$emit('detail')">
    <!-- 置顶角标 -->
    <BaseBadge v-if="post.isTop" color="primary" class="pin-badge">置顶</BaseBadge>

    <!-- 头部 -->
    <template #header>
      <div class="card-header">
        <BaseAvatar :src="post.author.avatar" :name="post.author.nickname" size="md" />
        <div class="user-info">
          <span class="nickname">{{ post.author.nickname }}</span>
          <span class="building">{{ post.author.building }}</span>
        </div>
        <div class="card-meta">
          <span class="time">{{ post.timeAgo }}</span>
          <BaseBadge :color="catColor(post.category || post.tab)">{{ post.tabName }}</BaseBadge>
        </div>
      </div>
    </template>

    <!-- 正文 -->
    <div class="card-body">
      <p :class="['content-text', { 'text-clamp-3': !post.isExpanded && post.showExpand }]">
        {{ post.content }}
      </p>
      <BaseButton
        v-if="post.showExpand"
        variant="ghost"
        size="sm"
        @click.stop="$emit('expand')"
      >
        {{ post.isExpanded ? '收起 ▲' : '展开 ▼' }}
      </BaseButton>
    </div>

    <!-- 图片九宫格 -->
    <div v-if="post.images && post.images.length > 0" class="card-images">
      <div :class="['image-grid', 'col-' + (post.images.length === 1 ? '1' : '3')]">
        <div
          v-for="(img, idx) in post.images"
          :key="idx"
          class="image-item"
          @click.stop="previewImage(img.original || img.thumb, idx)"
        >
          <BaseImage :src="img.thumb" :alt="'图片' + (idx + 1)" ratio="1/1" />
        </div>
      </div>
    </div>

    <!-- 底部互动 -->
    <template #footer>
      <div class="card-footer">
        <BaseButton variant="ghost" size="sm" :class="{ liked: post.isLiked }" @click.stop="$emit('like')">
          {{ post.isLiked ? '❤️' : '🤍' }} {{ post.like_count || 0 }}
        </BaseButton>
        <BaseButton variant="ghost" size="sm" @click.stop="$emit('comment')">
          💬 {{ post.comment_count || 0 }}
        </BaseButton>
      </div>
    </template>
    <!-- 全屏图片预览 -->
    <ImageViewer
      v-model="viewerVisible"
      :images="post.images"
      :start-index="viewerStartIdx"
      @close="viewerVisible = false"
    />
  </BaseCard>
</template>

<script setup>
import { ref } from 'vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseAvatar from '@/components/ui/BaseAvatar.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseImage from '@/components/ui/BaseImage.vue';
import ImageViewer from './ImageViewer.vue';

defineProps({ post: { type: Object, required: true } });
defineEmits(['like', 'expand', 'detail', 'comment']);

const catColorMap = {
  help: 'purple', idle: 'cyan', chat: 'brown',
  hospital: 'info', policy: 'success', anti_fraud: 'orange',
  general: 'default', all: 'default'
};
function catColor(cat) { return catColorMap[cat] || 'default'; }

const viewerVisible = ref(false);
const viewerStartIdx = ref(0);

function previewImage(url, idx) {
  viewerStartIdx.value = idx;
  viewerVisible.value = true;
}
</script>

<style scoped>
.post-card { position: relative; cursor: pointer; margin-bottom: var(--space-4); }
.post-card.is-top { border-left: 4px solid var(--brand-400); }

.pin-badge {
  position: absolute; top: 0; right: 0;
  border-radius: 0 var(--radius-md) 0 var(--radius-md) !important;
  padding: 4px 16px !important;
}

.card-header {
  display: flex; align-items: center; gap: var(--space-4);
  cursor: pointer;
}
.user-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.nickname  { font-size: var(--text-lg); font-weight: var(--font-semibold); }
.building  { font-size: var(--text-sm); color: var(--text-muted); }
.card-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.time      { font-size: var(--text-sm); color: var(--text-muted); }

.card-body { cursor: pointer; padding: var(--space-4); }
.content-text {
  font-size: var(--text-lg); line-height: var(--leading-relaxed);
  white-space: pre-wrap; word-break: break-word; margin: 0;
}
.text-clamp-3 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }

.card-images { padding: 0 var(--space-4) var(--space-4); }
.image-grid { display: grid; gap: var(--space-2); }
.image-grid.col-3 { grid-template-columns: repeat(3, 1fr); }
.image-grid.col-1 { grid-template-columns: 1fr; }
.image-item { cursor: pointer; border-radius: var(--radius-sm); overflow: hidden; }
.image-grid.col-1 .image-item { max-height: 480px; }

.card-footer {
  display: flex; justify-content: space-around; gap: var(--space-2);
}
.liked { color: var(--red-500) !important; }
</style>
