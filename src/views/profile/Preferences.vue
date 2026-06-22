<template>
  <div class="prefs-page" :class="{ 'large-font': squareStore.isLargeFont }">
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="header-title">基础设置</h1>
      <span class="header-spacer"></span>
    </header>

    <div class="settings-content">
      <!-- 显示设置 -->
      <SettingsSection title="显示" desc="调整显示效果，让阅读更舒适">
        <ToggleItem
          v-model="prefs.large_font"
          icon="🔤"
          label="大字模式"
          hint="开启后全平台字体增大 28%，按钮触控区增大"
          @update:model-value="toggleLargeFont"
        />
        <ToggleItem
          v-model="prefs.high_contrast"
          icon="🎨"
          label="高对比度模式"
          hint="增强文字和背景对比度，超 AAA 级标准"
          @update:model-value="savePrefs"
        />
      </SettingsSection>

      <!-- 语音设置 -->
      <SettingsSection title="语音" desc="调整语音输入和播报偏好">
        <ToggleItem
          v-model="prefs.voice_input_priority"
          icon="🎤"
          label="语音输入优先"
          hint="输入框默认显示大麦克风按钮，方便语音输入"
          @update:model-value="savePrefs"
        />
        <ToggleItem
          v-model="prefs.voice_auto_read"
          icon="📢"
          label="语音自动播报"
          hint="帖子标题和内容旁出现朗读按钮"
          @update:model-value="savePrefs"
        />
        <div class="speed-row">
          <span class="speed-label">语速</span>
          <div class="speed-chips">
            <button
              v-for="rate in speedOptions"
              :key="rate.value"
              :class="['speed-chip', { active: prefs.speech_rate === rate.value }]"
              @click="prefs.speech_rate = rate.value; savePrefs()"
            >{{ rate.label }}</button>
          </div>
        </div>
        <div class="pitch-row">
          <span class="pitch-label">音调</span>
          <div class="pitch-chips">
            <button
              v-for="p in pitchOptions"
              :key="p.value"
              :class="['pitch-chip', { active: prefs.speech_pitch === p.value }]"
              @click="prefs.speech_pitch = p.value; savePrefs()"
            >{{ p.label }}</button>
          </div>
        </div>
      </SettingsSection>

      <!-- 操作设置 -->
      <SettingsSection title="操作" desc="调整操作习惯，让使用更安全">
        <ToggleItem
          v-model="prefs.long_press_confirm"
          icon="👆"
          label="长按确认"
          hint="删除、退出等重要操作需长按 1.5 秒确认"
          @update:model-value="savePrefs"
        />
        <ToggleItem
          v-model="prefs.haptic_feedback"
          icon="📳"
          label="振动反馈"
          hint="点击按钮时轻微振动（需设备支持）"
          @update:model-value="savePrefs"
        />
        <ToggleItem
          v-model="prefs.show_button_hints"
          icon="💡"
          label="按钮提示文字"
          hint="图标按钮下方显示小字说明"
          @update:model-value="savePrefs"
        />
      </SettingsSection>

      <!-- 存储管理 -->
      <SettingsSection title="存储" desc="管理本地缓存数据">
        <div class="storage-info">
          <div class="storage-row">
            <span class="storage-label">缓存大小</span>
            <span class="storage-val">{{ storageSize }}</span>
          </div>
          <BaseButton variant="outline" size="sm" class="clear-btn" @click="showClearConfirm = true">清空缓存</BaseButton>
        </div>
      </SettingsSection>

      <!-- 关于 -->
      <SettingsSection title="关于">
        <div class="about-row">
          <span class="about-label">版本号</span>
          <span class="about-val">v1.0.0</span>
        </div>
        <div class="about-row clickable" @click="$router.push('/profile/guide')">
          <span class="about-label">使用指南</span>
          <span class="about-arrow">→</span>
        </div>
        <div class="about-row clickable">
          <span class="about-label">隐私政策</span>
          <span class="about-arrow">→</span>
        </div>
        <div class="about-row clickable">
          <span class="about-label">用户协议</span>
          <span class="about-arrow">→</span>
        </div>
      </SettingsSection>
    </div>

    <!-- 清空缓存确认 -->
    <DeleteConfirm
      :visible="showClearConfirm"
      title="清空缓存"
      message="将清除图片缓存和聊天记录缓存，设置和草稿会保留。确定清空？"
      confirm-text="确认清空"
      @confirm="clearCache"
      @cancel="showClearConfirm = false"
    />

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useSquareStore } from '@/stores/square';
import { useUserStore } from '@/stores/user';
import { useAppStore } from '@/stores/app';
import BaseButton from '@/components/ui/BaseButton.vue';
import SettingsSection from './components/SettingsSection.vue';
import ToggleItem from './components/ToggleItem.vue';
import DeleteConfirm from './components/DeleteConfirm.vue';

const squareStore = useSquareStore();
const userStore = useUserStore();
const app = useAppStore();

const prefs = reactive(userStore.preferences);

const speedOptions = [
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 }
];

const pitchOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'mid' },
  { label: '高', value: 'high' }
];

const storageSize = computed(() => {
  if ('storage' in navigator && navigator.storage.estimate) {
    return '计算中...';
  }
  return '约 2.3 MB';
});

const showClearConfirm = ref(false);

function toggleLargeFont(val) {
  squareStore.isLargeFont = val;
  userStore.setPreferences({ large_font: val });
}

function savePrefs() {
  userStore.setPreferences({ ...prefs });
}

function clearCache() {
  showClearConfirm.value = false;
  app.showToast('缓存已清空，设置和草稿已保留');
}
</script>

<style scoped>
.prefs-page {
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

.settings-content { padding: var(--space-4); }

.speed-row, .pitch-row {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-light);
}
.speed-label, .pitch-label {
  font-size: var(--text-base); color: var(--text-primary);
  font-weight: var(--font-medium); flex-shrink: 0; min-width: var(--tap-comfortable);
}
.speed-chips, .pitch-chips { display: flex; gap: var(--space-2); }
.speed-chip, .pitch-chip {
  padding: var(--space-1) var(--space-3); border-radius: var(--radius-md);
  border: 2px solid var(--border-light); background: var(--bg-card);
  font-family: inherit; font-size: var(--text-base); color: var(--text-secondary);
  cursor: pointer; transition: all var(--duration-fast);
  min-height: var(--tap-min);
}
.speed-chip.active, .pitch-chip.active {
  background: var(--brand-400); color: #fff; border-color: var(--brand-400);
}

.storage-info {
  padding: var(--space-3) var(--space-4);
  display: flex; align-items: center; justify-content: space-between;
}
.storage-label { font-size: var(--text-base); color: var(--text-primary); font-weight: var(--font-medium); }
.storage-val { font-size: var(--text-base); color: var(--text-secondary); }
.clear-btn { flex-shrink: 0; }

.about-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-light);
  min-height: var(--tap-comfortable);
}
.about-row:last-child { border-bottom: none; }
.about-row.clickable { cursor: pointer; }
.about-row.clickable:active { background: var(--gray-50); }
.about-label { font-size: var(--text-base); color: var(--text-primary); font-weight: var(--font-medium); }
.about-val { font-size: var(--text-base); color: var(--text-muted); }
.about-arrow { font-size: var(--text-base); color: var(--text-muted); }

.safe-bottom { height: var(--space-10); }
</style>
