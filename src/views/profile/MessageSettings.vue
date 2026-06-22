<template>
  <div class="msg-settings-page" :class="{ 'large-font': squareStore.isLargeFont }">
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="header-title">消息设置</h1>
      <span class="header-spacer"></span>
    </header>

    <div class="settings-content">
      <!-- 广场互动提醒 -->
      <SettingsSection title="广场互动" desc="有人和您互动时通过消息提醒">
        <ToggleItem
          v-model="ns.comment_notify"
          icon="💬"
          label="评论提醒"
          hint="有人评论我的帖子时通知"
          @update:model-value="saveSettings"
        />
        <ToggleItem
          v-model="ns.like_notify"
          icon="👍"
          label="点赞提醒"
          hint="有人点赞我的帖子时通知"
          @update:model-value="saveSettings"
        />
        <ToggleItem
          v-model="ns.reply_notify"
          icon="↩️"
          label="回复提醒"
          hint="有人回复我的评论时通知"
          @update:model-value="saveSettings"
        />
      </SettingsSection>

      <!-- 防诈专属提醒 -->
      <SettingsSection title="防诈专属提醒" desc="安全保障配置，保护您的财产安全">
        <ToggleItem
          v-model="ns.anti_fraud_push"
          icon="🛡️"
          label="防诈预警推送"
          hint="收到可疑信息时推送预警"
          disabled
          forced
          forced-hint="不可关闭"
        />
        <ToggleItem
          v-model="ns.anti_fraud_sound"
          icon="🔊"
          label="防诈预警声音"
          hint="收到防诈预警时播放特殊提示音"
          @update:model-value="saveSettings"
        />
        <VolumeSlider
          v-model="ns.anti_fraud_volume"
          icon="🔉"
          label="预警音量"
          @update:model-value="saveSettings"
        />
      </SettingsSection>

      <!-- 免打扰设置 -->
      <SettingsSection title="免打扰" desc="设置休息时间的通知管理策略">
        <ToggleItem
          v-model="ns.do_not_disturb"
          icon="🌙"
          label="开启免打扰"
          hint="开启后指定时段内不推送消息通知"
          @update:model-value="saveSettings"
        />
        <TimeRangePicker
          v-if="ns.do_not_disturb"
          :start="ns.dnd_start"
          :end="ns.dnd_end"
          hint="免打扰时段内的消息在时段结束后汇总推送"
          @update:start="ns.dnd_start = $event; saveSettings()"
          @update:end="ns.dnd_end = $event; saveSettings()"
        />
        <ToggleItem
          v-model="ns.group_digest"
          icon="📋"
          label="群聊消息汇总推送"
          hint="免打扰时段结束后一次性推送所有群聊消息"
          @update:model-value="saveSettings"
        />
      </SettingsSection>

      <!-- 语音通知 -->
      <SettingsSection title="语音通知" desc="新消息时语音播报提醒">
        <ToggleItem
          v-model="ns.voice_notify"
          icon="📢"
          label="新消息语音播报"
          hint="收到新消息时自动朗读通知"
          @update:model-value="saveSettings"
        />
        <VolumeSlider
          v-model="ns.voice_volume"
          icon="🔊"
          label="播报音量"
          @update:model-value="saveSettings"
        />
      </SettingsSection>
    </div>

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useSquareStore } from '@/stores/square';
import { useUserStore } from '@/stores/user';
import { useAppStore } from '@/stores/app';
import SettingsSection from './components/SettingsSection.vue';
import ToggleItem from './components/ToggleItem.vue';
import VolumeSlider from './components/VolumeSlider.vue';
import TimeRangePicker from './components/TimeRangePicker.vue';

const squareStore = useSquareStore();
const userStore = useUserStore();
const app = useAppStore();

const ns = reactive(userStore.notificationSettings);

function saveSettings() {
  // 即时保存
  userStore.setNotificationSettings({ ...ns });
}
</script>

<style scoped>
.msg-settings-page {
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

.safe-bottom { height: var(--space-10); }
</style>
