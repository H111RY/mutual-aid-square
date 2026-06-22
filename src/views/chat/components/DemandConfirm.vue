<template>
  <div class="demand-card">
    <div class="demand-header">
      <span class="demand-icon">{{ cardIcon }}</span>
      <span class="demand-title">{{ card.title || '需求确认' }}</span>
    </div>
    <div class="demand-fields">
      <div v-for="field in card.fields" :key="field.key" class="demand-field">
        <label class="field-label">{{ field.label }}</label>
        <template v-if="field.type === 'text'">
          <input v-model="formData[field.key]" class="field-input" :placeholder="'请输入' + field.label" />
        </template>
        <template v-else-if="field.type === 'date'">
          <input v-model="formData[field.key]" type="date" class="field-input" />
        </template>
        <template v-else-if="field.type === 'checkbox'">
          <div class="checkbox-group">
            <label v-for="opt in (field.options || [])" :key="opt" class="checkbox-label">
              <input type="checkbox" :value="opt" v-model="formData[field.key]" />
              <span>{{ opt }}</span>
            </label>
          </div>
        </template>
      </div>
    </div>
    <div class="demand-actions">
      <BaseButton variant="outline" size="sm" @click="$emit('cancel')">取消</BaseButton>
      <BaseButton variant="primary" size="sm" @click="handleSubmit">确认发送</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const props = defineProps({
  card: { type: Object, required: true }
});
const emit = defineEmits(['submit', 'cancel']);

const cardIcon = computed(() => {
  return props.card.type === 'hospital' ? '🏥' : props.card.type === 'policy' ? '📋' : '📝';
});

const formData = reactive({});

function handleSubmit() {
  emit('submit', { ...formData });
}
</script>

<style scoped>
.demand-card {
  background: var(--blue-50); border: 1px solid var(--blue-500);
  border-radius: var(--radius-md); padding: var(--space-4); margin: var(--space-3) var(--space-4);
}
.demand-header {
  display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);
}
.demand-icon { font-size: 20px; }
.demand-title { font-size: var(--text-lg); font-weight: var(--font-bold); color: var(--blue-500); }

.demand-fields { display: flex; flex-direction: column; gap: var(--space-3); }
.demand-field { }
.field-label {
  display: block; font-size: var(--text-sm); font-weight: var(--font-semibold);
  color: var(--text-secondary); margin-bottom: 4px;
}
.field-input {
  width: 100%; padding: var(--space-2) var(--space-3);
  font-size: var(--text-base); border: 1px solid var(--border-light);
  border-radius: var(--radius-sm); outline: none; font-family: inherit; box-sizing: border-box;
}
.field-input:focus { border-color: var(--blue-500); }
.checkbox-group { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.checkbox-label {
  display: flex; align-items: center; gap: 4px;
  font-size: var(--text-base); cursor: pointer;
}

.demand-actions {
  display: flex; justify-content: flex-end; gap: var(--space-2); margin-top: var(--space-3);
}
</style>
