<template>
  <div class="building-page" :class="{ 'large-font': squareStore.isLargeFont }">
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="header-title">楼栋切换</h1>
      <button class="help-btn" @click="showHelp = !showHelp">?</button>
    </header>

    <!-- 帮助提示 -->
    <div v-if="showHelp" class="help-banner">
      <span class="help-icon">💡</span>
      <span>切换楼栋后广场信息和群聊内容会自动更新，换楼栋就像换频道，不影响原来的消息</span>
    </div>

    <div class="building-content">
      <!-- 当前楼栋 -->
      <section class="section">
        <h2 class="section-label">当前楼栋</h2>
        <div class="current-building-card">
          <div class="cb-icon">🏢</div>
          <div class="cb-info">
            <h3 class="cb-name">{{ currentBuildingName }}</h3>
            <span class="cb-members">{{ currentBuildingMembers }} 位成员</span>
          </div>
          <span class="cb-badge">当前</span>
        </div>
      </section>

      <!-- 已绑定楼栋列表 -->
      <section class="section" v-if="userStore.boundBuildings.length > 0">
        <h2 class="section-label">已绑定楼栋（{{ userStore.boundBuildings.length }}/3）</h2>
        <div class="building-list">
          <div
            v-for="b in userStore.boundBuildings"
            :key="b.id"
            :class="['building-card', { 'is-current': b.is_current }]"
          >
            <div class="bc-left">
              <span class="bc-icon">🏢</span>
              <div class="bc-info">
                <span class="bc-name">{{ b.full_name }}</span>
                <span class="bc-meta">{{ b.member_count }} 位成员</span>
              </div>
            </div>
            <div class="bc-actions">
              <BaseButton
                v-if="!b.is_current"
                variant="primary"
                size="sm"
                @click="switchBuilding(b)"
              >切换至此</BaseButton>
              <BaseButton
                v-if="!b.is_current"
                variant="ghost"
                size="sm"
                class="unbind-btn"
                @click="confirmUnbind(b)"
              >解绑</BaseButton>
            </div>
            <span v-if="b.is_current" class="current-label">当前</span>
          </div>
        </div>
      </section>

      <!-- 添加楼栋 -->
      <section class="section">
        <BaseButton
          v-if="userStore.canAddMore"
          variant="outline"
          size="lg"
          block
          class="add-btn"
          @click="showSearch = true"
        >＋ 添加楼栋</BaseButton>
        <div v-else class="max-hint">最多绑定 3 个楼栋</div>
      </section>

      <!-- 搜索弹窗 -->
      <Teleport to="body">
        <div v-if="showSearch" class="search-overlay" @click.self="showSearch = false">
          <div class="search-modal">
            <div class="search-modal-header">
              <h3>搜索楼栋</h3>
              <button class="close-btn" @click="showSearch = false">✕</button>
            </div>
            <input
              v-model="searchKeyword"
              type="text"
              class="search-input"
              placeholder="输入楼栋号，如 7号楼"
              @input="filterBuildings"
            />
            <div class="search-results">
              <div
                v-for="b in filteredBuildings"
                :key="b.id"
                class="search-item"
                @click="bindBuilding(b)"
              >
                <span class="si-icon">🏢</span>
                <span class="si-name">{{ b.full_name }}</span>
                <span class="si-meta">{{ b.member_count }} 人</span>
              </div>
              <div v-if="filteredBuildings.length === 0 && searchKeyword" class="search-empty">
                未找到匹配的楼栋
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- 绑定确认弹窗 -->
      <DeleteConfirm
        :visible="bindVisible"
        title="确认绑定"
        :message="'确认绑定 ' + (pendingBuilding?.full_name || '') + '？绑定后可在该楼栋群聊中发言'"
        confirm-text="确认绑定"
        icon="🏢"
        @confirm="doBind"
        @cancel="bindVisible = false"
      />

      <!-- 解绑确认弹窗 -->
      <DeleteConfirm
        :visible="unbindVisible"
        title="确认解绑"
        :message="'解绑后你将退出 ' + (pendingBuilding?.full_name || '') + ' 的群聊，确定？'"
        confirm-text="确认解绑"
        @confirm="doUnbind"
        @cancel="unbindVisible = false"
      />
    </div>

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSquareStore } from '@/stores/square';
import { useUserStore } from '@/stores/user';
import { useAppStore } from '@/stores/app';
import BaseButton from '@/components/ui/BaseButton.vue';
import DeleteConfirm from './components/DeleteConfirm.vue';

const squareStore = useSquareStore();
const userStore = useUserStore();
const app = useAppStore();

const showHelp = ref(false);
const showSearch = ref(false);
const searchKeyword = ref('');
const bindVisible = ref(false);
const unbindVisible = ref(false);
const pendingBuilding = ref(null);

const filteredBuildings = computed(() => {
  return [];
});

const currentBuildingName = computed(() => {
  const cur = userStore.currentBuilding;
  return cur ? cur.full_name : (app.user.building || '未绑定楼栋');
});

const currentBuildingMembers = computed(() => {
  const cur = userStore.currentBuilding;
  return cur ? cur.member_count : 0;
});

function bindBuilding(b) {
  pendingBuilding.value = b;
  bindVisible.value = true;
  showSearch.value = false;
  searchKeyword.value = '';
}

function doBind() {
  if (pendingBuilding.value) {
    const isFirst = userStore.boundBuildings.length === 0;
    userStore.addBuilding({
      ...pendingBuilding.value,
      is_current: isFirst,
      bound_at: new Date().toISOString()
    });
    if (isFirst) {
      app.setUser({ building: pendingBuilding.value.full_name });
    }
    app.showToast('已绑定 ' + pendingBuilding.value.full_name);
  }
  bindVisible.value = false;
  pendingBuilding.value = null;
}

function switchBuilding(b) {
  userStore.setCurrentBuilding(b.id);
  app.setUser({ building: b.full_name });
  app.showToast('已切换到 ' + b.full_name);
}

function confirmUnbind(b) {
  pendingBuilding.value = b;
  unbindVisible.value = true;
}

function doUnbind() {
  if (pendingBuilding.value) {
    userStore.removeBuilding(pendingBuilding.value.id);
    app.showToast('已解绑 ' + pendingBuilding.value.full_name);
  }
  unbindVisible.value = false;
  pendingBuilding.value = null;
}
</script>

<style scoped>
.building-page {
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
.back-btn, .help-btn {
  width: var(--tap-min); height: var(--tap-min);
  display: flex; align-items: center; justify-content: center;
  border: none; background: none; cursor: pointer;
  color: var(--text-primary); border-radius: 50%;
  font-size: var(--text-xl); font-weight: var(--font-bold);
}
.back-btn:active, .help-btn:active { background: var(--gray-100); }
.header-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }

.help-banner {
  display: flex; align-items: flex-start; gap: var(--space-2);
  margin: var(--space-4); padding: var(--space-3); background: var(--brand-50);
  border-radius: var(--radius-md); border: 1px solid var(--brand-100);
  font-size: var(--text-sm); color: var(--text-secondary);
}
.help-icon { flex-shrink: 0; }

.building-content { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4); }

.section { display: flex; flex-direction: column; gap: var(--space-2); }
.section-label {
  font-size: var(--text-base); font-weight: var(--font-semibold);
  color: var(--text-secondary); margin: 0;
}

.current-building-card {
  display: flex; align-items: center; gap: var(--space-4);
  background: var(--brand-50); border: 2px solid var(--brand-400);
  border-radius: var(--radius-lg); padding: var(--space-5);
}
.cb-icon { font-size: var(--text-3xl); }
.cb-info { flex: 1; }
.cb-name { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0 0 2px; }
.cb-members { font-size: var(--text-sm); color: var(--text-secondary); }
.cb-badge {
  font-size: var(--text-xs); font-weight: var(--font-bold);
  background: var(--brand-400); color: #fff;
  padding: 4px 12px; border-radius: var(--radius-full);
}

.building-list { display: flex; flex-direction: column; gap: var(--space-3); }
.building-card {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--bg-card); border: 1px solid var(--border-light);
  border-radius: var(--radius-md); padding: var(--space-4);
  transition: all var(--duration-fast);
}
.building-card.is-current { border-color: var(--brand-400); background: var(--brand-50); }
.bc-left { display: flex; align-items: center; gap: var(--space-3); }
.bc-icon { font-size: var(--text-2xl); }
.bc-info { display: flex; flex-direction: column; }
.bc-name { font-size: var(--text-base); font-weight: var(--font-semibold); }
.bc-meta { font-size: var(--text-sm); color: var(--text-muted); }
.bc-actions { display: flex; gap: var(--space-2); flex-shrink: 0; }
.unbind-btn { color: var(--red-500) !important; }
.current-label {
  font-size: var(--text-xs); font-weight: var(--font-bold);
  color: var(--brand-400); flex-shrink: 0;
}

.add-btn { min-height: 56px; font-size: var(--text-lg); }
.max-hint {
  text-align: center; padding: var(--space-4); color: var(--text-muted);
  font-size: var(--text-base);
}

/* Search modal */
.search-overlay {
  position: fixed; inset: 0; z-index: 400;
  background: var(--bg-overlay);
  display: flex; align-items: flex-end; justify-content: center;
}
.search-modal {
  background: var(--bg-card);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  width: 100%; max-width: var(--content-max);
  max-height: 70vh; overflow-y: auto;
  padding: var(--space-4);
}
.search-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-4);
}
.search-modal-header h3 { margin: 0; font-size: var(--text-lg); }
.close-btn {
  width: var(--tap-min); height: var(--tap-min); border: none; background: var(--gray-100);
  border-radius: 50%; cursor: pointer; font-size: var(--text-base);
}
.search-input {
  width: 100%; height: var(--tap-comfortable);
  padding: 0 var(--space-4);
  font-size: var(--text-lg); font-family: inherit;
  border: 2px solid var(--border-normal);
  border-radius: var(--radius-md); outline: none;
  box-sizing: border-box;
}
.search-input:focus { border-color: var(--brand-400); }

.search-results { margin-top: var(--space-3); }
.search-item {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) 0; border-bottom: 1px solid var(--border-light);
  cursor: pointer; min-height: var(--tap-comfortable);
}
.search-item:active { background: var(--gray-50); }
.si-icon { font-size: var(--text-xl); }
.si-name { flex: 1; font-size: var(--text-base); font-weight: var(--font-medium); }
.si-meta { font-size: var(--text-sm); color: var(--text-muted); }
.search-empty { text-align: center; padding: var(--space-8); color: var(--text-muted); }

.safe-bottom { height: var(--space-10); }
</style>
