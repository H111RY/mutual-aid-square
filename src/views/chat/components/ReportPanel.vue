<template>
  <div class="report-mask" @click.self="$emit('close')">
    <div class="report-panel">
      <h3 class="report-title">举报</h3>
      <p class="report-target">对象：{{ target?.name || '未知' }}</p>

      <div class="report-types">
        <label
          v-for="t in types"
          :key="t.value"
          :class="['type-option', { selected: selectedType === t.value }]"
        >
          <input type="radio" :value="t.value" v-model="selectedType" hidden />
          <span class="type-icon">{{ t.icon }}</span>
          <span class="type-label">{{ t.label }}</span>
        </label>
      </div>

      <textarea
        v-model="description"
        class="report-desc"
        placeholder="补充说明（选填）..."
        rows="3"
      ></textarea>

      <p class="report-hint">聊天记录将自动附带（已脱敏处理）</p>

      <div class="report-actions">
        <BaseButton variant="outline" @click="$emit('close')">取消</BaseButton>
        <BaseButton variant="primary" :disabled="!selectedType" :loading="submitting" @click="handleSubmit">
          提交举报
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { submitReport } from '@/api/report';
import BaseButton from '@/components/ui/BaseButton.vue';

const props = defineProps({ target: { type: Object, default: () => ({}) } });
const emit = defineEmits(['close']);

const types = [
  { value: 'fraud', label: '诈骗信息', icon: '🚨' },
  { value: 'harassment', label: '骚扰信息', icon: '🚫' },
  { value: 'ad', label: '违规广告', icon: '📢' },
  { value: 'other', label: '其他', icon: '⋯' }
];

const selectedType = ref(null);
const description = ref('');
const submitting = ref(false);

async function handleSubmit() {
  if (!selectedType.value || submitting.value) return;
  submitting.value = true;
  try {
    await submitReport({
      target_type: props.target.type || 'user',
      target_id: props.target.id || '',
      report_type: selectedType.value,
      description: description.value
    });
    alert('举报已提交，社区工作人员将尽快处理');
    emit('close');
  } catch {
    alert('提交失败，请重试');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.report-mask {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--bg-overlay);
  display: flex; align-items: flex-end; justify-content: center;
}
.report-panel {
  width: 100%; max-width: var(--content-max);
  background: var(--bg-card); border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--space-6); padding-bottom: var(--space-8);
  max-height: 80vh; overflow-y: auto;
}
.report-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0 0 var(--space-1); }
.report-target { font-size: var(--text-sm); color: var(--text-muted); margin: 0 0 var(--space-4); }

.report-types { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-2); margin-bottom: var(--space-4); }
.type-option {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3); border: 2px solid var(--border-light); border-radius: var(--radius-md);
  cursor: pointer; transition: border-color var(--duration-fast);
}
.type-option.selected { border-color: var(--brand-400); background: var(--brand-50); }
.type-icon { font-size: 20px; }
.type-label { font-size: var(--text-base); font-weight: var(--font-medium); }

.report-desc {
  width: 100%; padding: var(--space-3); font-size: var(--text-base); font-family: inherit;
  border: 1px solid var(--border-light); border-radius: var(--radius-sm); outline: none;
  resize: none; margin-bottom: var(--space-2); box-sizing: border-box;
}
.report-desc:focus { border-color: var(--brand-400); }

.report-hint { font-size: var(--text-xs); color: var(--text-muted); margin: 0 0 var(--space-4); }

.report-actions { display: flex; justify-content: flex-end; gap: var(--space-3); }
</style>
