<template>
  <div class="guide-page" :class="{ 'large-font': squareStore.isLargeFont }">
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="header-title">使用指南</h1>
      <span class="header-spacer"></span>
    </header>

    <div class="guide-content">
      <!-- 模式切换 -->
      <div class="mode-toggle">
        <button :class="['mode-btn', { active: mode === 'text' }]" @click="mode = 'text'">图文版</button>
        <button :class="['mode-btn', { active: mode === 'voice' }]" @click="mode = 'voice'">语音版</button>
      </div>

      <!-- 分类 Tab -->
      <div class="guide-tabs-wrapper">
        <div class="guide-tabs">
          <button
            v-for="cat in userStore.guideCategories"
            :key="cat.value"
            :class="['guide-tab', { active: activeCategory === cat.value }]"
            @click="activeCategory = cat.value"
          >
            <span class="gt-icon">{{ cat.icon }}</span>
            <span class="gt-name">{{ cat.name }}</span>
          </button>
        </div>
      </div>

      <!-- 指南步骤 -->
      <div class="steps-container">
        <div
          v-for="(step, idx) in currentSteps"
          :key="idx"
          class="guide-step"
        >
          <div class="step-number">{{ idx + 1 }}</div>
          <div class="step-body">
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
          </div>
          <button
            v-if="mode === 'voice'"
            class="step-speak-btn"
            @click="speakStep(step)"
            :disabled="isSpeaking"
          >🔊</button>
        </div>

        <div v-if="currentSteps.length === 0" class="guide-empty">
          该分类暂无指南内容
        </div>
      </div>

      <!-- 常见问题 FAQ -->
      <section class="faq-section">
        <h2 class="faq-title">常见问题</h2>
        <div
          v-for="(faq, idx) in userStore.faqList"
          :key="idx"
          class="faq-item"
          @click="toggleFaq(idx)"
        >
          <div class="faq-q">
            <span class="faq-q-mark">Q</span>
            <span class="faq-q-text">{{ faq.q }}</span>
            <span class="faq-toggle">{{ expandedFaqs.includes(idx) ? '▲' : '▼' }}</span>
          </div>
          <div v-show="expandedFaqs.includes(idx)" class="faq-a">
            <span class="faq-a-mark">A</span>
            <span class="faq-a-text">{{ faq.a }}</span>
          </div>
        </div>
      </section>
    </div>

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSquareStore } from '@/stores/square';
import { useUserStore } from '@/stores/user';

const squareStore = useSquareStore();
const userStore = useUserStore();

const mode = ref('text');
const activeCategory = ref('hospital');
const expandedFaqs = ref([]);
const isSpeaking = ref(false);

const currentSteps = computed(() => {
  return userStore.guideData[activeCategory.value] || [];
});

function toggleFaq(idx) {
  const pos = expandedFaqs.value.indexOf(idx);
  if (pos === -1) expandedFaqs.value.push(idx);
  else expandedFaqs.value.splice(pos, 1);
}

function speakStep(step) {
  if (!('speechSynthesis' in window)) return;
  isSpeaking.value = true;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(step.title + '。' + step.desc);
  utter.rate = userStore.preferences.speech_rate || 1.0;
  const pitchMap = { low: 0.7, mid: 1.0, high: 1.3 };
  utter.pitch = pitchMap[userStore.preferences.speech_pitch] || 1.0;
  utter.onend = () => { isSpeaking.value = false; };
  window.speechSynthesis.speak(utter);
}
</script>

<style scoped>
.guide-page {
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

.guide-content { padding: var(--space-4); }

.mode-toggle {
  display: flex; background: var(--gray-100);
  border-radius: var(--radius-md); padding: 4px;
  margin-bottom: var(--space-4);
}
.mode-btn {
  flex: 1; padding: 10px; border-radius: var(--radius-sm);
  border: none; background: transparent;
  font-family: inherit; font-size: var(--text-base);
  font-weight: var(--font-medium); color: var(--text-secondary);
  cursor: pointer; transition: all var(--duration-fast);
}
.mode-btn.active { background: var(--bg-card); color: var(--brand-500); box-shadow: var(--shadow-sm); }

.guide-tabs-wrapper { overflow-x: auto; margin-bottom: var(--space-4); }
.guide-tabs { display: flex; gap: var(--space-2); white-space: nowrap; }
.guide-tab {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-1);
  padding: var(--space-2) var(--space-3); border-radius: var(--radius-md);
  border: 2px solid var(--border-light); background: var(--bg-card);
  font-family: inherit; cursor: pointer; transition: all var(--duration-fast);
  min-width: 72px;
}
.guide-tab.active { border-color: var(--brand-400); background: var(--brand-50); }
.gt-icon { font-size: var(--text-xl); }
.gt-name { font-size: var(--text-xs); font-weight: var(--font-medium); color: var(--text-secondary); }

.steps-container { margin-bottom: var(--space-6); }
.guide-step {
  display: flex; align-items: flex-start; gap: var(--space-3);
  background: var(--bg-card); border: 1px solid var(--border-light);
  border-radius: var(--radius-md); padding: var(--space-4);
  margin-bottom: var(--space-2);
}
.step-number {
  width: var(--tap-min); height: var(--tap-min); border-radius: 50%;
  background: var(--brand-400); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: var(--text-lg); font-weight: var(--font-bold);
  flex-shrink: 0;
}
.step-body { flex: 1; min-width: 0; }
.step-title {
  font-size: var(--text-base); font-weight: var(--font-bold);
  color: var(--text-primary); margin: 0 0 var(--space-1);
}
.step-desc {
  font-size: var(--text-base); color: var(--text-secondary);
  line-height: var(--leading-relaxed); margin: 0;
}
.step-speak-btn {
  width: var(--tap-comfortable); height: var(--tap-comfortable); border-radius: 50%;
  border: 2px solid var(--border-light); background: var(--bg-card);
  font-size: var(--text-xl); cursor: pointer; flex-shrink: 0;
  transition: all var(--duration-fast);
}
.step-speak-btn:hover { background: var(--brand-50); border-color: var(--brand-400); }
.step-speak-btn:active { transform: scale(0.92); }
.step-speak-btn:disabled { opacity: 0.5; }

.guide-empty { text-align: center; padding: var(--space-8); color: var(--text-muted); }

.faq-section { margin-top: var(--space-6); }
.faq-title {
  font-size: var(--text-lg); font-weight: var(--font-bold);
  color: var(--text-primary); margin: 0 0 var(--space-3);
  padding-left: var(--space-2); border-left: 3px solid var(--brand-400);
}
.faq-item {
  background: var(--bg-card); border: 1px solid var(--border-light);
  border-radius: var(--radius-md); margin-bottom: var(--space-2);
  cursor: pointer; overflow: hidden;
}
.faq-q {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
}
.faq-q-mark {
  width: var(--text-xl); height: var(--text-xl); border-radius: 50%;
  background: var(--brand-400); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: var(--text-xs); font-weight: var(--font-bold); flex-shrink: 0;
}
.faq-q-text { flex: 1; font-size: var(--text-base); font-weight: var(--font-medium); color: var(--text-primary); }
.faq-toggle { font-size: var(--text-xs); color: var(--text-muted); flex-shrink: 0; }
.faq-a {
  display: flex; gap: var(--space-3);
  padding: 0 var(--space-4) var(--space-3);
  margin-left: var(--space-6);
}
.faq-a-mark {
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--green-50); color: var(--green-500);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: var(--font-bold); flex-shrink: 0;
}
.faq-a-text { font-size: var(--text-base); color: var(--text-secondary); line-height: var(--leading-relaxed); }

.safe-bottom { height: var(--space-10); }
</style>
