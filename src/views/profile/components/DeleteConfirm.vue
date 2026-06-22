<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-icon">{{ icon }}</div>
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-actions">
          <BaseButton variant="ghost" size="lg" @click="$emit('cancel')">{{ cancelText }}</BaseButton>
          <BaseButton variant="danger" size="lg" :loading="loading" @click="$emit('confirm')">{{ confirmText }}</BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import BaseButton from '@/components/ui/BaseButton.vue';

defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '确定执行此操作？' },
  icon: { type: String, default: '⚠️' },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  loading: { type: Boolean, default: false }
});

defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } }

.modal-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-8) var(--space-6);
  max-width: var(--content-max);
  width: 100%;
  text-align: center;
  animation: popIn 0.25s var(--ease-out);
}
@keyframes popIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-icon { font-size: 48px; margin-bottom: var(--space-3); }
.modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2);
}
.modal-message {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0 0 var(--space-6);
  line-height: var(--leading-relaxed);
}
.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

/* large font */
:global(.font-large) .modal-card { max-width: 400px; padding: var(--space-10) var(--space-8); }
</style>
