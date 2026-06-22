<template>
  <div class="drawer-mask" @click.self="$emit('close')">
    <div class="drawer-panel">
      <div class="drawer-header">
        <h3 class="drawer-title">群成员 ({{ members.length }})</h3>
        <BaseButton variant="ghost" size="sm" @click="$emit('close')">✕</BaseButton>
      </div>

      <div class="member-search">
        <input
          v-model="searchText"
          class="search-input"
          placeholder="搜索成员昵称或楼栋..."
        />
      </div>

      <div class="member-list">
        <div
          v-for="m in filteredMembers"
          :key="m.uid"
          :class="['member-item', { owner: m.role === 'owner' }]"
        >
          <BaseAvatar :src="m.avatar" :name="m.nickname" size="md" />
          <div class="member-info">
            <span class="member-name">
              {{ m.nickname }}
              <span v-if="m.role === 'owner'" class="role-badge owner">群主</span>
              <span v-else-if="m.role === 'admin'" class="role-badge admin">管理员</span>
            </span>
            <span class="member-building">{{ m.building }}</span>
          </div>
          <!-- 群主操作菜单 -->
          <div v-if="isOwner && m.role !== 'owner'" class="member-actions">
            <BaseButton variant="ghost" size="sm" @click.stop="showActionMenu(m)">⋯</BaseButton>
          </div>
        </div>

        <BaseEmpty v-if="filteredMembers.length === 0" icon="👤" desc="未找到成员" />
      </div>

      <!-- 操作菜单弹窗 -->
      <div v-if="actionTarget" class="action-sheet-mask" @click.self="actionTarget = null">
        <div class="action-sheet">
          <button @click="handleKick">移出群聊</button>
          <button @click="handleBan(30)">禁言 30 分钟</button>
          <button @click="handleBan(120)">禁言 2 小时</button>
          <button @click="handleBan(1440)">禁言 24 小时</button>
          <button @click="handleSetAdmin">{{ actionTarget.role === 'admin' ? '取消管理员' : '设为管理员' }}</button>
          <button class="cancel-btn" @click="actionTarget = null">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAvatar from '@/components/ui/BaseAvatar.vue';
import BaseEmpty from '@/components/ui/BaseEmpty.vue';

const props = defineProps({
  members: { type: Array, default: () => [] },
  isOwner: { type: Boolean, default: false }
});
const emit = defineEmits(['close', 'kick', 'ban', 'set-admin']);

const searchText = ref('');
const actionTarget = ref(null);

const filteredMembers = computed(() => {
  if (!searchText.value) return props.members;
  const q = searchText.value.toLowerCase();
  return props.members.filter(m =>
    m.nickname?.toLowerCase().includes(q) || m.building?.toLowerCase().includes(q)
  );
});

function showActionMenu(member) { actionTarget.value = member; }

function handleKick() {
  if (actionTarget.value) emit('kick', actionTarget.value.uid);
  actionTarget.value = null;
}

function handleBan(minutes) {
  if (actionTarget.value) emit('ban', { uid: actionTarget.value.uid, duration: minutes });
  actionTarget.value = null;
}

function handleSetAdmin() {
  if (actionTarget.value) emit('set-admin', { uid: actionTarget.value.uid, isAdmin: actionTarget.value.role !== 'admin' });
  actionTarget.value = null;
}
</script>

<style scoped>
.drawer-mask {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--bg-overlay);
  display: flex; justify-content: flex-end;
}
.drawer-panel {
  width: 320px; max-width: 85vw; height: 100%;
  background: var(--bg-card); display: flex; flex-direction: column;
}
.drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-4); border-bottom: 1px solid var(--border-light);
  min-height: var(--header-height);
}
.drawer-title { font-size: var(--text-lg); font-weight: var(--font-bold); margin: 0; }

.member-search { padding: var(--space-3) var(--space-4); }
.search-input {
  width: 100%; padding: var(--space-2) var(--space-3);
  font-size: var(--text-base); border: 1px solid var(--border-light);
  border-radius: var(--radius-full); outline: none; font-family: inherit; box-sizing: border-box;
}
.search-input:focus { border-color: var(--brand-400); }

.member-list { flex: 1; overflow-y: auto; }
.member-item {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--border-light);
}
.member-item.owner { background: var(--amber-50); }
.member-info { flex: 1; min-width: 0; }
.member-name { font-size: var(--text-base); font-weight: var(--font-medium); display: flex; align-items: center; gap: var(--space-1); }
.member-building { font-size: var(--text-xs); color: var(--text-muted); }
.role-badge { font-size: 10px; padding: 1px 6px; border-radius: var(--radius-full); }
.role-badge.owner { background: var(--amber-500); color: #fff; }
.role-badge.admin { background: var(--brand-100); color: var(--brand-600); }

.member-actions { flex-shrink: 0; }

/* 操作菜单 */
.action-sheet-mask {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,0.3);
  display: flex; align-items: flex-end;
}
.action-sheet {
  width: 100%; background: var(--bg-card); border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--space-4); display: flex; flex-direction: column; gap: 4px;
}
.action-sheet button {
  min-height: var(--tap-min); border: none; background: none;
  font-size: var(--text-base); cursor: pointer; text-align: center;
  padding: var(--space-3); border-bottom: 1px solid var(--border-light);
  font-family: inherit;
}
.action-sheet button:active { background: var(--gray-50); }
.action-sheet .cancel-btn { color: var(--red-500); font-weight: var(--font-semibold); border-bottom: none; margin-top: var(--space-2); }
</style>
