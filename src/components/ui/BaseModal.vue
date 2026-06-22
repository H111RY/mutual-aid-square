<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="onOverlayClick">
        <div :class="['modal-panel', `modal-${size}`]">
          <div v-if="title || $slots.header" class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button v-if="closable" class="modal-close" @click="close" aria-label="关闭">&times;</button>
          </div>
          <div class="modal-body"><slot /></div>
          <div v-if="$slots.footer" class="modal-footer"><slot name="footer" /></div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { watch } from 'vue';

const props = defineProps({
  visible:  { type: Boolean, default: false },
  title:    { type: String, default: '' },
  size:     { type: String, default: 'md' },
  closable: { type: Boolean, default: true },
  maskClosable: { type: Boolean, default: false }
});
const emit = defineEmits(['update:visible', 'close']);

function close() { emit('update:visible', false); emit('close'); }
function onOverlayClick() { if (props.maskClosable) close(); }

watch(() => props.visible, (v) => {
  if (v) document.body.style.overflow = 'hidden';
  else document.body.style.overflow = '';
});
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-overlay);
  padding: var(--space-4);
}
.modal-panel {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-height: 85vh;
  display: flex; flex-direction: column;
}
.modal-sm { max-width: 360px; }
.modal-md { max-width: 480px; }
.modal-lg { max-width: 640px; }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border-light);
}
.modal-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }
.modal-close {
  font-size: var(--text-2xl); color: var(--text-muted);
  min-width: var(--tap-min); min-height: var(--tap-min);
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; cursor: pointer; border-radius: var(--radius-sm);
}
.modal-close:hover { background: var(--gray-100); }

.modal-body { padding: var(--space-6); overflow-y: auto; flex: 1; }
.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-light);
  display: flex; gap: var(--space-3); justify-content: flex-end;
}

/* Transition */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity var(--duration-normal) var(--ease-out);
}
.modal-fade-enter-active .modal-panel,
.modal-fade-leave-active .modal-panel {
  transition: transform var(--duration-normal) var(--ease-out);
}
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal-panel { transform: scale(0.95) translateY(8px); }
.modal-fade-leave-to .modal-panel   { transform: scale(0.95) translateY(8px); }
</style>
