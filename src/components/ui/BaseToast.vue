<template>
  <teleport to="body">
    <transition-group name="toast-list" tag="div" class="toast-container">
      <div
        v-for="item in items"
        :key="item.id"
        :class="['toast-item', `toast-${item.type}`]"
      >
        <span class="toast-icon">{{ iconMap[item.type] }}</span>
        <span class="toast-msg">{{ item.message }}</span>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup>
import { ref } from 'vue';

const items = ref([]);
let idCounter = 0;

const iconMap = {
  success: '✓', error: '✕', warning: '!', info: 'i'
};

function show(message, type = 'info', duration = 2500) {
  const id = ++idCounter;
  items.value.push({ id, message, type });
  setTimeout(() => {
    items.value = items.value.filter(i => i.id !== id);
  }, duration);
}

defineExpose({ show });
</script>

<style scoped>
.toast-container {
  position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
  z-index: 2000;
  display: flex; flex-direction: column; gap: 8px;
  pointer-events: none;
}
.toast-item {
  display: flex; align-items: center; gap: var(--space-2);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: var(--text-base); font-weight: var(--font-medium);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  min-width: 200px; max-width: 400px;
}

.toast-success { background: #E8F5E9; color: var(--green-700); }
.toast-error   { background: #FFEBEE; color: var(--red-700); }
.toast-warning { background: #FFF8E1; color: var(--amber-700); }
.toast-info    { background: var(--brand-50); color: var(--brand-700); }

.toast-icon {
  font-weight: var(--font-bold); font-size: var(--text-lg);
  width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
  border-radius: 50%; flex-shrink: 0;
}
.toast-success .toast-icon { background: var(--green-500); color: #fff; }
.toast-error   .toast-icon { background: var(--red-500); color: #fff; }
.toast-warning .toast-icon { background: var(--amber-500); color: #fff; }
.toast-info    .toast-icon { background: var(--brand-400); color: #fff; }

.toast-msg { flex: 1; line-height: var(--leading-normal); }

/* Transition */
.toast-list-enter-active { transition: all var(--duration-normal) var(--ease-out); }
.toast-list-leave-active { transition: all var(--duration-fast) var(--ease-in-out); }
.toast-list-enter-from { opacity: 0; transform: translateY(-12px); }
.toast-list-leave-to   { opacity: 0; transform: translateY(-8px); }
</style>
