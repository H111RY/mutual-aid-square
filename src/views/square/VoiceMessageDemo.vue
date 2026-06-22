<template>
  <div class="demo-page" :class="{ 'large-font': largeFont }">
    <!-- ====== Header ====== -->
    <header class="demo-header">
      <BaseButton variant="ghost" size="sm" @click="$router.push('/square')">← 返回广场</BaseButton>
      <h1 class="demo-title">语音消息演示</h1>
      <BaseButton variant="ghost" size="sm" @click="largeFont = !largeFont">
        {{ largeFont ? '缩小字体' : '放大字体' }}
      </BaseButton>
    </header>

    <div class="demo-body">

      <!-- ============ SECTION 1: Architecture ============ -->
      <section class="section">
        <h2 class="section-title">双路径语音架构</h2>
        <BaseCard flat>
          <div class="arch-diagram">
            <div class="arch-user">
              <div class="arch-icon">👤</div>
              <span>用户语音输入</span>
            </div>
            <div class="arch-split"></div>
            <div class="arch-paths">
              <div class="arch-path path-a">
                <div class="path-label">路径 A（优先）</div>
                <div class="path-steps">
                  <span class="step">Web Speech API</span>
                  <span class="arrow">→</span>
                  <span class="step">实时流式识别</span>
                  <span class="arrow">→</span>
                  <span class="step">onResult 回调</span>
                </div>
                <div class="path-info">continuous=true · interimResults · 实时</div>
              </div>
              <div class="arch-divider">
                <span class="or-tag">或</span>
              </div>
              <div class="arch-path path-b">
                <div class="path-label">路径 B（降级）</div>
                <div class="path-steps">
                  <span class="step">MediaRecorder</span>
                  <span class="arrow">→</span>
                  <span class="step">录音上传</span>
                  <span class="arrow">→</span>
                  <span class="step">服务端 ASR</span>
                </div>
                <div class="path-info">长按录音 · 上滑取消 · 预览确认 · 进度上传</div>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>

      <!-- ============ SECTION 2: Voice Recorder ============ -->
      <section class="section">
        <h2 class="section-title">语音录制</h2>
        <BaseCard>
          <VoiceRecorder
            :path="voicePath"
            :status="voiceStatus"
            :duration="duration"
            :volume="volume"
            :interim-text="interimText"
            :final-text="finalText"
            :current-lang="currentLang"
            :error-message="errorMessage"
            :dialects="dialects"
            :upload-progress="uploadProgress"
            :audio-url="audioUrl"
            :max-duration="maxDuration"
            @toggle="toggleVoice"
            @start="startVoice"
            @stop="onStopVoice"
            @set-dialect="setDialect"
            @clear="clearVoice"
            @cancel="cancelFallbackRecording"
            @confirm="onConfirmVoice"
            @retry="retryRecording"
          />
        </BaseCard>
      </section>

      <!-- ============ SECTION 3: Chat Simulation ============ -->
      <section class="section">
        <h2 class="section-title">语音消息聊天模拟</h2>
        <BaseCard flat class="chat-card">
          <!-- Chat header -->
          <div class="chat-header">
            <span class="chat-peer-avatar">李</span>
            <div>
              <div class="chat-peer-name">李大伯 · 5号楼2单元</div>
              <div class="chat-peer-hint">语音消息可暂停续播、重复播放</div>
            </div>
            <BaseBadge v-if="unplayedCount" color="danger" class="unread-dot">{{ unplayedCount }}</BaseBadge>
          </div>

          <!-- Messages -->
          <div class="chat-messages" ref="msgContainer">
            <div v-for="msg in chatMessages" :key="msg.id" :class="['msg-row', msg.mine ? 'mine' : 'other']">
              <template v-if="msg.msg_type === 'voice'">
                <!-- Voice bubble -->
                <div
                  :class="['voice-bubble', { mine: msg.mine, unplayed: !msg.played && !msg.mine }]"
                  @click="onChatVoiceClick(msg)"
                >
                  <!-- Play/Pause button -->
                  <span :class="['play-indicator', { playing: isPlaying && playingId === msg.id }]">
                    <svg v-if="!isPlaying || playingId !== msg.id" viewBox="0 0 24 24" width="28" height="28">
                      <polygon points="6,2 20,12 6,22" :fill="msg.mine ? '#fff' : '#4A90D9'" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" width="28" height="28">
                      <rect x="5" y="2" width="5" height="20" rx="1" :fill="msg.mine ? '#fff' : '#4A90D9'" />
                      <rect x="14" y="2" width="5" height="20" rx="1" :fill="msg.mine ? '#fff' : '#4A90D9'" />
                    </svg>
                  </span>

                  <!-- Waveform -->
                  <div class="voice-waveform">
                    <span
                      v-for="(h, i) in (isPlaying && playingId === msg.id ? waveformData : msg.waveform || defaultWaveform)"
                      :key="i"
                      class="wave-bar"
                      :style="{
                        height: h + 'px',
                        background: barColor(msg, i),
                        opacity: barOpacity(msg, i)
                      }"
                    ></span>
                  </div>

                  <!-- Duration -->
                  <span class="voice-duration" :class="{ mine: msg.mine }">{{ fmtDur(msg.duration) }}</span>

                  <!-- Unplayed dot -->
                  <span v-if="!msg.played && !msg.mine" class="unplayed-dot"></span>
                </div>
              </template>
              <template v-else>
                <div :class="['text-bubble', msg.mine ? 'mine' : 'other']">{{ msg.content }}</div>
              </template>
              <div class="msg-time">{{ msg.time }}</div>
            </div>

            <!-- Recording toast -->
            <div v-if="recordingMsg" class="msg-row mine">
              <div class="voice-bubble mine recording-bubble">
                <span class="rec-dot-live"></span>
                <div class="voice-waveform">
                  <span v-for="i in 12" :key="i" class="wave-bar" :style="{ height: liveWaveHeight(i) + 'px', background: 'rgba(255,255,255,0.7)' }"></span>
                </div>
                <span class="voice-duration mine">{{ formatTime(duration) }}</span>
                <span class="cancel-hint">上滑取消</span>
              </div>
            </div>
          </div>

          <!-- Chat Input -->
          <div class="chat-input-bar">
            <button class="input-btn" title="发送图片">📷</button>
            <div class="msg-textarea-placeholder">点击右侧麦克风按钮录制语音消息</div>
            <button
              :class="['input-btn voice-btn', { recording: voiceStatus === 'listening' }]"
              :title="voiceStatus === 'listening' ? '录音中...' : '录制语音'"
              @click="onMicClick"
            >{{ voiceStatus === 'listening' ? '🔴' : '🎤' }}</button>
            <button class="send-btn" @click="sendSimulatedText">发送</button>
          </div>
        </BaseCard>
      </section>

      <!-- ============ SECTION 4: Playback Lab ============ -->
      <section class="section">
        <h2 class="section-title">播放控制实验室</h2>
        <BaseCard>
          <div class="playback-lab">
            <!-- Current sample -->
            <div class="lab-sample-info">
              <span class="lab-label">当前样本：</span>
              <select v-model="selectedSample" class="lab-select" @change="loadSample">
                <option v-for="s in samples" :key="s.id" :value="s.id">{{ s.label }}（{{ s.dur }}秒）</option>
              </select>
            </div>

            <!-- Main playback controls -->
            <div class="lab-controls">
              <!-- Large play/pause -->
              <button class="lab-play-btn" @click="onLabPlayPause">
                <svg v-if="!labPlaying" viewBox="0 0 48 48" width="48" height="48">
                  <circle cx="24" cy="24" r="22" fill="var(--brand-400)" />
                  <polygon points="18,12 36,24 18,36" fill="#fff" />
                </svg>
                <svg v-else viewBox="0 0 48 48" width="48" height="48">
                  <circle cx="24" cy="24" r="22" fill="var(--amber-500)" />
                  <rect x="16" y="12" width="7" height="24" rx="1.5" fill="#fff" />
                  <rect x="25" y="12" width="7" height="24" rx="1.5" fill="#fff" />
                </svg>
              </button>

              <!-- Progress -->
              <div class="lab-progress-area">
                <div
                  class="lab-progress-track"
                  ref="progressTrack"
                  @click="onProgressClick"
                >
                  <div class="lab-progress-fill" :style="{ width: labProgress + '%' }"></div>
                  <div class="lab-progress-thumb" :style="{ left: labProgress + '%' }"></div>
                </div>
                <div class="lab-time-row">
                  <span class="lab-time">{{ fmtTime(labCurrent) }}</span>
                  <span class="lab-time">{{ fmtTime(labDuration) }}</span>
                </div>
              </div>

              <!-- Speed -->
              <div class="lab-speed-row">
                <span class="lab-label">播放速度：</span>
                <div class="speed-chips">
                  <button
                    v-for="r in [0.75, 1, 1.5, 2]"
                    :key="r"
                    :class="['speed-chip', { active: labSpeed === r }]"
                    @click="setLabSpeed(r)"
                  >{{ r }}x</button>
                </div>
              </div>
            </div>

            <!-- Waveform visualizer -->
            <div class="lab-visualizer">
              <div class="lab-bars">
                <span
                  v-for="(h, i) in (labPlaying ? waveformData : sampleWaveform)"
                  :key="i"
                  class="lab-bar"
                  :style="{
                    height: h + 'px',
                    background: labBarColor(i)
                  }"
                ></span>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>

      <!-- ============ SECTION 5: State Machine ============ -->
      <section class="section">
        <h2 class="section-title">语音录制状态机</h2>
        <BaseCard flat>
          <div class="state-machine">
            <div class="state-nodes">
              <div v-for="s in states" :key="s.key" :class="['state-node', 'state-' + s.key, { active: voiceStatus === s.key }]">
                <div class="state-dot"></div>
                <span class="state-label">{{ s.label }}</span>
              </div>
            </div>
            <div class="state-lines">
              <svg viewBox="0 0 800 60" class="state-svg">
                <!-- idle → listening -->
                <line x1="50" y1="30" x2="175" y2="30" stroke="var(--brand-300)" stroke-width="2" marker-end="url(#arrowBlue)" />
                <!-- listening → preview (fallback path) -->
                <line x1="310" y1="30" x2="435" y2="30" stroke="var(--amber-400)" stroke-width="2" stroke-dasharray="6,3" marker-end="url(#arrowAmber)" />
                <!-- listening → idle -->
                <line x1="270" y1="42" x2="70" y2="42" stroke="var(--gray-400)" stroke-width="2" marker-end="url(#arrowGray)" />
                <text x="130" y="54" fill="var(--text-muted)" font-size="11">点击结束</text>
                <!-- preview → uploading -->
                <line x1="570" y1="30" x2="695" y2="30" stroke="var(--brand-400)" stroke-width="2" marker-end="url(#arrowBlue)" />
                <!-- uploading → idle -->
                <line x1="735" y1="42" x2="735" y2="20" stroke="var(--gray-400)" stroke-width="2" />
                <line x1="735" y1="20" x2="70" y2="20" stroke="var(--gray-400)" stroke-width="2" marker-end="url(#arrowGray)" />
                <text x="400" y="18" fill="var(--text-muted)" font-size="11">识别完成</text>

                <defs>
                  <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <polygon points="0,0 8,4 0,8" fill="var(--brand-300)" />
                  </marker>
                  <marker id="arrowAmber" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <polygon points="0,0 8,4 0,8" fill="var(--amber-400)" />
                  </marker>
                  <marker id="arrowGray" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <polygon points="0,0 8,4 0,8" fill="var(--gray-400)" />
                  </marker>
                </defs>
              </svg>
            </div>
          </div>
        </BaseCard>
      </section>

      <!-- ============ SECTION 6: Elderly-Friendly Showcase ============ -->
      <section class="section">
        <h2 class="section-title">适老化设计要点</h2>
        <div class="elderly-grid">
          <BaseCard flat v-for="item in elderlyFeatures" :key="item.title">
            <div class="elderly-item">
              <span class="elderly-icon">{{ item.icon }}</span>
              <div>
                <h4 class="elderly-title">{{ item.title }}</h4>
                <p class="elderly-desc">{{ item.desc }}</p>
              </div>
            </div>
          </BaseCard>
        </div>
      </section>

      <!-- ============ SECTION 7: Debug Panel ============ -->
      <section class="section">
        <BaseCard flat>
          <template #header>
            <h3 class="panel-title">调试面板</h3>
          </template>
          <div class="debug-grid">
            <div class="debug-item">
              <span class="debug-label">识别路径</span>
              <BaseBadge :color="voicePath === 'webspeech' ? 'success' : voicePath === 'fallback' ? 'warning' : 'default'">
                {{ voicePath === 'webspeech' ? 'Web Speech' : voicePath === 'fallback' ? '降级录音' : '未知' }}
              </BaseBadge>
            </div>
            <div class="debug-item">
              <span class="debug-label">状态</span>
              <BaseBadge :color="statusColor">{{ voiceStatus }}</BaseBadge>
            </div>
            <div class="debug-item">
              <span class="debug-label">录音时长</span>
              <span class="debug-value">{{ duration }}s / {{ maxDuration }}s</span>
            </div>
            <div class="debug-item">
              <span class="debug-label">音量</span>
              <div class="mini-volume">
                <div class="mini-volume-fill" :style="{ width: volume + '%' }"></div>
              </div>
            </div>
            <div class="debug-item">
              <span class="debug-label">当前语言</span>
              <span class="debug-value">{{ currentLang }}</span>
            </div>
            <div class="debug-item">
              <span class="debug-label">识别文字</span>
              <span class="debug-value">{{ finalText.length }} 字</span>
            </div>
            <div class="debug-item">
              <span class="debug-label">播放状态</span>
              <span class="debug-value">{{ isPlaying ? (playingId ? '播放中 #' + playingId : '播放中') : '暂停' }}</span>
            </div>
            <div class="debug-item">
              <span class="debug-label">播放进度</span>
              <span class="debug-value">{{ Math.round(labProgress) }}%</span>
            </div>
            <div class="debug-item">
              <span class="debug-label">播放速度</span>
              <span class="debug-value">{{ labSpeed }}x</span>
            </div>
            <div class="debug-item">
              <span class="debug-label">聊天消息数</span>
              <span class="debug-value">{{ chatMessages.length }}</span>
            </div>
            <div class="debug-item">
              <span class="debug-label">大字模式</span>
              <BaseBadge :color="largeFont ? 'success' : 'default'">{{ largeFont ? '开启' : '关闭' }}</BaseBadge>
            </div>
          </div>
          <div v-if="errorMessage" class="debug-error">
            <strong>错误：</strong>{{ errorMessage }}
          </div>
          <div v-if="finalText" class="debug-result">
            <strong>最终识别：</strong>{{ finalText }}
          </div>
        </BaseCard>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue';
import { useVoiceInput } from '@/composables/useVoiceInput';
import { useSimulatedVoicePlayback } from '@/composables/useSimulatedVoicePlayback';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import VoiceRecorder from './components/VoiceRecorder.vue';

/* ==================================================================
   ── Voice Input Composable ──
   ================================================================== */
const {
  status: voiceStatus, duration, volume,
  interimText, finalText, currentLang, errorMessage,
  dialects, path: voicePath, uploadProgress, audioUrl, maxDuration,
  toggle: toggleVoice, start: startVoice, stop: stopVoice,
  setDialect, clearText: clearVoice,
  confirmAndRecognize, retryRecording, cancelFallbackRecording
} = useVoiceInput({
  lang: 'zh-CN',
  onResult: () => {},
  onInterim: () => {},
  onError: () => {}
});

/* ==================================================================
   ── Simulated Voice Playback ──
   ================================================================== */
const {
  playingId, isPlaying, currentTime: playCurrent, duration: playDuration,
  progress: playProgress, playbackRate: labSpeed, waveformData,
  play, pause, resume, stop: stopPlayback, seekTo, setPlaybackRate
} = useSimulatedVoicePlayback();

/* ── Playback Lab state ── */
const labPlaying = ref(false);
const labCurrent = ref(0);
const labDuration = ref(0);
const labProgress = ref(0);
const selectedSample = ref('s1');
const sampleWaveform = ref([]);
let labPlayTimer = null;
let labPlayStart = 0;
let labPlayOffset = 0;

const samples = [
  { id: 's1', label: '问候语音', dur: 2.5 },
  { id: 's2', label: '求助语音', dur: 4.0 },
  { id: 's3', label: '回复语音', dur: 3.2 },
  { id: 's4', label: '通知语音', dur: 5.5 }
];

function loadSample() {
  const s = samples.find(x => x.id === selectedSample.value);
  if (s) {
    stopLabPlayback();
    labDuration.value = s.dur;
    labCurrent.value = 0;
    labProgress.value = 0;
    // Generate waveform preview
    const bars = [];
    for (let i = 0; i < 24; i++) {
      bars.push(Math.max(6, Math.sin(i * 0.9) * 28 + 32 + Math.random() * 16));
    }
    sampleWaveform.value = bars;
  }
}

function onLabPlayPause() {
  if (labPlaying.value) {
    // Pause
    labPlayOffset += (Date.now() - labPlayStart) / 1000 * labSpeed.value;
    clearInterval(labPlayTimer);
    labPlayTimer = null;
    labPlaying.value = false;
    // Also pause the actual audio
    pause();
  } else {
    // Play
    const dur = labDuration.value;
    play('lab', dur, () => {
      labPlaying.value = false;
      labCurrent.value = dur;
      labProgress.value = 100;
      clearInterval(labPlayTimer);
      labPlayTimer = null;
    });
    labPlayStart = Date.now();
    labPlaying.value = true;
    labPlayTimer = setInterval(() => {
      const elapsed = labPlayOffset + (Date.now() - labPlayStart) / 1000 * labSpeed.value;
      labCurrent.value = Math.min(elapsed, labDuration.value);
      labProgress.value = Math.min(100, (elapsed / labDuration.value) * 100);
      if (labProgress.value >= 99.9) {
        labPlaying.value = false;
        labCurrent.value = labDuration.value;
        clearInterval(labPlayTimer);
        labPlayTimer = null;
      }
    }, 60);
  }
}

function stopLabPlayback() {
  clearInterval(labPlayTimer);
  labPlayTimer = null;
  labPlaying.value = false;
  labCurrent.value = 0;
  labProgress.value = 0;
  labPlayOffset = 0;
  stopPlayback();
}

function setLabSpeed(r) {
  labSpeed.value = r;
  setPlaybackRate(r);
  // Recalculate start time for smooth transition
  if (labPlaying.value) {
    labPlayOffset = labCurrent.value;
    labPlayStart = Date.now();
  }
}

function onProgressClick(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = ((e.clientX - rect.left) / rect.width) * 100;
  seekTo(pct);
  labProgress.value = pct;
  labCurrent.value = (pct / 100) * labDuration.value;
  labPlayOffset = labCurrent.value;
  labPlayStart = Date.now();
}

function labBarColor(i) {
  if (!labPlaying.value) return 'var(--brand-400)';
  const playedBars = Math.floor((labProgress.value / 100) * 24);
  return i <= playedBars ? 'var(--brand-400)' : 'var(--gray-300)';
}

/* ==================================================================
   ── Chat Simulation ──
   ================================================================== */
const largeFont = ref(false);
const msgContainer = ref(null);
const recordingMsg = ref(false);
const defaultWaveform = Array.from({ length: 16 }, () => Math.max(6, Math.random() * 36 + 12));

const chatMessages = ref([
  {
    id: 'm1', mine: false, msg_type: 'text',
    content: '你好！请问明天下午方便帮我取一下快递吗？', time: '14:10',
    sender: { nickname: '李大伯', building: '5号楼2单元', avatar: '' }
  },
  {
    id: 'm2', mine: true, msg_type: 'text',
    content: '可以的，大概几点？', time: '14:12',
  },
  {
    id: 'm3', mine: false, msg_type: 'voice',
    content: '', duration: 3.2, played: false, time: '14:13',
    waveform: Array.from({ length: 16 }, () => Math.max(8, Math.sin(Date.now() / 1000) * 24 + 28 + Math.random() * 12)),
    sender: { nickname: '李大伯', building: '5号楼2单元' }
  },
  {
    id: 'm4', mine: true, msg_type: 'voice',
    content: '', duration: 2.1, played: true, time: '14:15',
    waveform: Array.from({ length: 16 }, () => Math.max(6, Math.random() * 30 + 20)),
  },
  {
    id: 'm5', mine: false, msg_type: 'text',
    content: '好的，太感谢了！大概3点左右可以吗？', time: '14:17',
  },
  {
    id: 'm6', mine: true, msg_type: 'voice',
    content: '', duration: 1.8, played: true, time: '14:18',
    waveform: Array.from({ length: 16 }, () => Math.max(6, Math.random() * 28 + 18)),
  },
]);

const unplayedCount = computed(() => chatMessages.value.filter(m => !m.mine && m.msg_type === 'voice' && !m.played).length);

function onChatVoiceClick(msg) {
  if (msg.msg_type !== 'voice') return;

  const dur = msg.duration || 3;
  play(msg.id, dur, () => {
    msg.played = true;
  });

  // Track for lab sync
  const cleanup = watch([isPlaying, playingId], ([p, id]) => {
    if (!p && id !== msg.id) {
      msg.played = true;
      cleanup();
    }
  });
}

function barColor(msg, i) {
  if (isPlaying.value && playingId.value === msg.id) {
    const playedBars = Math.floor((playProgress.value / 100) * 16);
    return i <= playedBars ? (msg.mine ? 'rgba(255,255,255,0.9)' : 'var(--brand-400)') : (msg.mine ? 'rgba(255,255,255,0.35)' : 'var(--gray-300)');
  }
  return msg.mine ? 'rgba(255,255,255,0.55)' : 'var(--brand-300)';
}

function barOpacity(msg, i) {
  if (isPlaying.value && playingId.value === msg.id) return 1;
  return msg.played ? 0.8 : 1;
}

function fmtDur(d) {
  if (!d) return '0″';
  const s = Math.floor(d);
  return s >= 60 ? Math.floor(s / 60) + '′' + (s % 60) + '″' : s + '″';
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}秒`;
}

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `0:${String(sec).padStart(2, '0')}`;
}

function liveWaveHeight(i) {
  return Math.max(4, Math.sin(Date.now() / 250 + i * 0.7) * 18 + 22 + volume.value * 0.25);
}

/* ── Mic button handler ── */
function onMicClick() {
  if (voiceStatus.value === 'listening') {
    stopVoice();
    recordingMsg.value = false;
  } else {
    startVoice();
    recordingMsg.value = true;
  }
}

function onStopVoice() {
  recordingMsg.value = false;
  stopVoice();
}

function onConfirmVoice() {
  // Simulate adding a voice message to chat
  const msg = {
    id: 'm' + Date.now(),
    mine: true,
    msg_type: 'voice',
    content: '',
    duration: duration.value || 3,
    played: true,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    waveform: Array.from({ length: 16 }, () => Math.max(6, Math.random() * 28 + 18)),
  };
  chatMessages.value.push(msg);
  confirmAndRecognize();
  nextTick(() => scrollChatBottom());
}

function sendSimulatedText() {
  const texts = ['好的，收到！', '没问题，我一会儿就到', '谢谢你的帮助！', '我确认一下时间'];
  const msg = {
    id: 'm' + Date.now(),
    mine: true,
    msg_type: 'text',
    content: texts[Math.floor(Math.random() * texts.length)],
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  };
  chatMessages.value.push(msg);
  nextTick(() => scrollChatBottom());

  // Auto-reply
  setTimeout(() => {
    const replies = ['好的，明白了', '谢谢！', '收到了，到时候见'];
    const reply = {
      id: 'mr' + Date.now(),
      mine: false,
      msg_type: Math.random() < 0.5 ? 'text' : 'voice',
      content: replies[Math.floor(Math.random() * replies.length)],
      duration: 1.5 + Math.random() * 3,
      played: false,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      waveform: Array.from({ length: 16 }, () => Math.max(6, Math.random() * 32 + 14)),
    };
    chatMessages.value.push(reply);
    nextTick(() => scrollChatBottom());
  }, 800 + Math.random() * 1500);
}

function scrollChatBottom() {
  const el = msgContainer.value;
  if (el) el.scrollTop = el.scrollHeight;
}

onMounted(() => {
  loadSample();
  nextTick(() => scrollChatBottom());
});

/* ==================================================================
   ── Computed ──
   ================================================================== */
const statusColor = computed(() => {
  const map = {
    idle: 'default', listening: 'danger', preview: 'info',
    uploading: 'warning', processing: 'warning', error: 'danger', unsupported: 'danger'
  };
  return map[voiceStatus.value] || 'default';
});

const states = [
  { key: 'idle', label: '待机' },
  { key: 'listening', label: '录音中' },
  { key: 'preview', label: '预览' },
  { key: 'uploading', label: '上传' },
  { key: 'processing', label: '识别中' },
  { key: 'error', label: '错误' },
];

const elderlyFeatures = [
  { icon: '🔘', title: '大播放按钮 ≥ 44px', desc: '语音播放按钮最小 44px，大字体模式 56px，确保老年人准确点击' },
  { icon: '📊', title: '粗进度条 ≥ 6px', desc: '播放进度条高度 8px，远超过常规 2-3px，视觉清晰可见' },
  { icon: '🔴', title: '未播放红点提醒', desc: '未播放的语音消息显示红色圆点，确保老年人不会遗漏重要语音留言' },
  { icon: '🔄', title: '支持暂停续播', desc: '点击播放/暂停，从上次位置继续，老年人可反复收听理解内容' },
  { icon: '⏱️', title: '时长标签加粗', desc: '语音时长以粗体数字显示，一眼看清消息长度' },
  { icon: '🎤', title: '长按录音 + 上滑取消', desc: '按住说话松手发送，上滑取消，降低误操作风险；最长 60 秒自动停止' },
];
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: var(--space-10);
}

/* ── Header ── */
.demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--space-4);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  position: sticky; top: 0; z-index: 100;
}
.demo-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }

/* ── Body ── */
.demo-body {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* ── Sections ── */
.section { display: flex; flex-direction: column; gap: var(--space-3); }
.section-title {
  font-size: var(--text-lg); font-weight: var(--font-bold);
  margin: 0; color: var(--text-primary);
  padding-left: var(--space-2);
  border-left: 3px solid var(--brand-400);
}

/* ============================
   Architecture Diagram
   ============================ */
.arch-diagram {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-4);
  flex-wrap: wrap;
}
.arch-user {
  display: flex; flex-direction: column; align-items: center;
  gap: var(--space-2); flex-shrink: 0;
}
.arch-icon { font-size: 40px; }
.arch-split {
  width: 2px; height: 80px;
  background: linear-gradient(to bottom, var(--brand-400), var(--amber-400));
  border-radius: 1px;
}
.arch-paths { flex: 1; display: flex; flex-direction: column; gap: var(--space-2); min-width: 300px; }
.arch-path {
  padding: var(--space-3); border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}
.path-a { background: rgba(74,144,217,0.04); border-color: var(--brand-200); }
.path-b { background: rgba(255,167,38,0.04); border-color: var(--amber-200); }
.path-label {
  font-size: var(--text-xs); font-weight: var(--font-bold);
  color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase;
}
.path-steps {
  display: flex; align-items: center; gap: var(--space-2);
  font-size: var(--text-sm); font-weight: var(--font-medium);
  flex-wrap: wrap;
}
.path-a .path-steps .step { color: var(--brand-600); }
.path-b .path-steps .step { color: var(--amber-700); }
.arrow { color: var(--text-muted); }
.path-info {
  font-size: var(--text-xs); color: var(--text-muted); margin-top: 4px;
}
.arch-divider {
  display: flex; align-items: center; justify-content: center;
}
.or-tag {
  padding: 2px 12px; font-size: var(--text-xs);
  background: var(--gray-100); border-radius: var(--radius-full);
  color: var(--text-muted); font-weight: var(--font-medium);
}

/* ============================
   Chat Simulation
   ============================ */
.chat-card { overflow: hidden; }
.chat-header {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--gray-50);
  border-bottom: 1px solid var(--border-light);
}
.chat-peer-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--brand-100); color: var(--brand-500);
  display: flex; align-items: center; justify-content: center;
  font-size: var(--text-lg); font-weight: var(--font-bold);
  flex-shrink: 0;
}
.chat-peer-name { font-size: var(--text-base); font-weight: var(--font-semibold); }
.chat-peer-hint { font-size: var(--text-xs); color: var(--text-muted); }
.unread-dot { margin-left: auto; }

.chat-messages {
  height: 360px; overflow-y: auto;
  padding: var(--space-4);
  display: flex; flex-direction: column; gap: var(--space-2);
  background: var(--bg-page);
}
.msg-row { display: flex; flex-direction: column; max-width: 80%; }
.msg-row.mine { align-self: flex-end; align-items: flex-end; }
.msg-row.other { align-self: flex-start; align-items: flex-start; }
.msg-time {
  font-size: var(--text-xs); color: var(--text-muted);
  margin-top: 2px; padding: 0 var(--space-1);
}

/* Text bubbles */
.text-bubble {
  padding: var(--space-2) var(--space-4);
  border-radius: 18px;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  max-width: 100%;
  word-break: break-word;
}
.text-bubble.mine { background: var(--brand-400); color: #fff; border-bottom-right-radius: 6px; }
.text-bubble.other { background: var(--bg-card); color: var(--text-primary); border-bottom-left-radius: 6px; border: 1px solid var(--border-light); }

/* Voice bubbles */
.voice-bubble {
  display: flex; align-items: center; gap: var(--space-2);
  min-width: 160px; max-width: 260px;
  padding: var(--space-2) var(--space-3);
  border-radius: 18px;
  cursor: pointer; user-select: none;
  position: relative; transition: all var(--duration-fast);
}
.voice-bubble.mine {
  background: var(--brand-400);
  border-bottom-right-radius: 6px;
}
.voice-bubble:not(.mine) {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-bottom-left-radius: 6px;
}
.voice-bubble:not(.mine).unplayed {
  border-color: var(--red-300);
  background: var(--red-50);
}
.voice-bubble:hover { transform: scale(1.02); }
.voice-bubble:active { transform: scale(0.97); }

.recording-bubble {
  animation: recPulse 1.5s ease-in-out infinite;
  border: 2px dashed var(--red-300);
  cursor: default;
}

.play-indicator {
  min-width: 36px; min-height: 36px;
  display: flex; align-items: center; justify-content: center;
  transition: transform var(--duration-fast);
  flex-shrink: 0;
}
.play-indicator.playing { animation: pulsePlay 0.8s ease-in-out infinite; }
@keyframes pulsePlay { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }

.voice-waveform {
  display: flex; align-items: flex-end; gap: 2px;
  flex: 1; height: 36px;
}
.wave-bar {
  flex: 1; border-radius: 1.5px;
  transition: height 0.2s ease, background 0.3s ease, opacity 0.3s ease;
  min-height: 4px;
}

.voice-duration {
  font-size: var(--text-xs); font-weight: var(--font-bold);
  color: var(--text-muted); min-width: 28px; text-align: center;
  flex-shrink: 0;
}
.voice-duration.mine { color: rgba(255,255,255,0.75); }

.unplayed-dot {
  position: absolute; top: -4px; right: -4px;
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--red-500);
  border: 2px solid #fff;
}

.rec-dot-live {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--red-500);
  animation: blink 1s infinite;
  flex-shrink: 0;
}
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
@keyframes recPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(198,40,40,0.2); }
  50% { box-shadow: 0 0 0 8px rgba(198,40,40,0); }
}

.cancel-hint {
  font-size: 10px; color: rgba(255,255,255,0.5);
  position: absolute; top: -18px; left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

/* Chat Input */
.chat-input-bar {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-card);
  border-top: 1px solid var(--border-light);
}
.msg-textarea-placeholder {
  flex: 1; padding: var(--space-2) var(--space-3);
  font-size: var(--text-base); color: var(--text-muted);
  background: var(--gray-50); border-radius: var(--radius-md);
  min-height: var(--tap-min); display: flex; align-items: center;
}
.input-btn {
  min-width: var(--tap-min); min-height: var(--tap-min);
  border-radius: 50%; border: none; background: var(--gray-100);
  font-size: 22px; cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  transition: background var(--duration-fast);
}
.input-btn:active { background: var(--gray-200); }
.voice-btn.recording {
  background: var(--red-50);
  animation: recPulse 1.2s ease-in-out infinite;
}
.send-btn {
  min-width: 56px; min-height: var(--tap-min);
  padding: 0 var(--space-4); font-size: var(--text-base);
  font-weight: var(--font-semibold); font-family: inherit;
  background: var(--brand-400); color: #fff;
  border: none; border-radius: var(--radius-md); cursor: pointer;
}
.send-btn:active { background: var(--brand-500); }

/* ============================
   Playback Lab
   ============================ */
.playback-lab {
  display: flex; flex-direction: column; gap: var(--space-5);
  padding: var(--space-2);
}
.lab-sample-info { display: flex; align-items: center; gap: var(--space-3); }
.lab-label { font-size: var(--text-sm); color: var(--text-muted); }
.lab-select {
  padding: 4px 12px; font-size: var(--text-base);
  border: 1px solid var(--border-normal); border-radius: var(--radius-sm);
  font-family: inherit; background: var(--bg-card);
}

.lab-controls {
  display: flex; align-items: center; gap: var(--space-4);
  flex-wrap: wrap;
}
.lab-play-btn {
  border: none; background: none; cursor: pointer;
  transition: transform var(--duration-fast);
  padding: 0; flex-shrink: 0;
}
.lab-play-btn:hover { transform: scale(1.08); }
.lab-play-btn:active { transform: scale(0.95); }

.lab-progress-area { flex: 1; min-width: 200px; }
.lab-progress-track {
  width: 100%; height: 10px;
  background: var(--gray-200);
  border-radius: 5px;
  position: relative;
  cursor: pointer;
}
.lab-progress-fill {
  height: 100%; border-radius: 5px;
  background: linear-gradient(90deg, var(--brand-400), var(--brand-500));
  transition: width 0.1s linear;
}
.lab-progress-thumb {
  position: absolute; top: -5px;
  width: 20px; height: 20px;
  border-radius: 50%;
  background: var(--brand-500);
  box-shadow: 0 2px 8px rgba(74,144,217,0.3);
  transform: translateX(-50%);
  transition: left 0.1s linear;
}
.lab-time-row {
  display: flex; justify-content: space-between;
  margin-top: 4px;
}
.lab-time { font-size: var(--text-xs); color: var(--text-muted); font-variant-numeric: tabular-nums; }

.lab-speed-row { display: flex; align-items: center; gap: var(--space-3); }
.speed-chips { display: flex; gap: 6px; }
.speed-chip {
  padding: 4px 16px; font-size: var(--text-sm); font-family: inherit;
  border: 1px solid var(--border-normal); border-radius: var(--radius-full);
  background: var(--bg-card); cursor: pointer;
  transition: all var(--duration-fast);
}
.speed-chip:hover { border-color: var(--brand-400); }
.speed-chip.active {
  background: var(--brand-400); color: #fff;
  border-color: var(--brand-400); font-weight: var(--font-bold);
}

.lab-visualizer {
  background: var(--gray-50);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}
.lab-bars {
  display: flex; align-items: flex-end; justify-content: center;
  gap: 4px; height: 60px;
}
.lab-bar {
  width: 6px; border-radius: 3px; min-height: 4px;
  transition: height 0.2s ease, background 0.3s ease;
}

/* ============================
   State Machine
   ============================ */
.state-machine { padding: var(--space-4); overflow-x: auto; }
.state-nodes {
  display: flex; gap: var(--space-2);
  justify-content: space-around;
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
}
.state-node {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: all var(--duration-normal);
  min-width: 70px;
}
.state-node.active { background: var(--brand-50); }
.state-node.active .state-dot { background: var(--brand-500); box-shadow: 0 0 0 6px rgba(74,144,217,0.2); }
.state-node.active .state-label { color: var(--brand-500); font-weight: var(--font-bold); }
.state-dot {
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--gray-300);
  transition: all var(--duration-normal);
}
.state-label {
  font-size: var(--text-xs); color: var(--text-muted);
  white-space: nowrap;
}
.state-lines { overflow-x: auto; }
.state-svg {
  width: 100%; min-width: 600px; height: 50px;
}

/* Error state */
.state-error.active .state-dot { background: var(--red-500); box-shadow: 0 0 0 6px rgba(198,40,40,0.2); }
.state-error.active .state-label { color: var(--red-500); }

/* ============================
   Elderly Features
   ============================ */
.elderly-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}
.elderly-item {
  display: flex; gap: var(--space-3); align-items: flex-start;
}
.elderly-icon { font-size: 28px; flex-shrink: 0; }
.elderly-title {
  font-size: var(--text-base); font-weight: var(--font-bold);
  margin: 0 0 2px;
}
.elderly-desc {
  font-size: var(--text-sm); color: var(--text-secondary);
  margin: 0; line-height: var(--leading-relaxed);
}

/* ============================
   Debug Panel
   ============================ */
.panel-title { font-size: var(--text-base); font-weight: var(--font-bold); margin: 0; }
.debug-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-3);
}
.debug-item { display: flex; align-items: center; gap: var(--space-2); }
.debug-label { font-size: var(--text-sm); color: var(--text-muted); min-width: 72px; }
.debug-value { font-size: var(--text-base); font-weight: var(--font-medium); }
.mini-volume {
  width: 60px; height: 6px; background: var(--gray-200);
  border-radius: 3px; overflow: hidden;
}
.mini-volume-fill {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, var(--green-500), var(--amber-500), var(--red-500));
  transition: width 0.1s ease;
}
.debug-error {
  margin-top: var(--space-3); padding: var(--space-3);
  background: var(--red-50); border-radius: var(--radius-sm);
  font-size: var(--text-sm); color: var(--red-700);
}
.debug-result {
  margin-top: var(--space-3); padding: var(--space-3);
  background: var(--green-50); border-radius: var(--radius-sm);
  font-size: var(--text-base);
}

/* ============================
   Large Font Mode
   ============================ */
.large-font {
  --text-xs: 15px;
  --text-sm: 17px;
  --text-base: 20px;
  --text-lg: 24px;
  --text-xl: 30px;
  --tap-min: 56px;
}
.large-font .voice-bubble { min-width: 200px; max-width: 320px; }
.large-font .play-indicator { min-width: 48px; min-height: 48px; }
.large-font .lab-progress-track { height: 14px; }
.large-font .lab-progress-thumb { width: 28px; height: 28px; top: -7px; }
.large-font .wave-bar { border-radius: 2.5px; }

@media (max-width: 640px) {
  .demo-body { padding: var(--space-3); gap: var(--space-4); }
  .arch-diagram { flex-direction: column; }
  .arch-split { width: 80px; height: 2px; }
  .chat-messages { height: 280px; }
  .elderly-grid { grid-template-columns: 1fr; }
  .debug-grid { grid-template-columns: 1fr 1fr; }
  .lab-controls { flex-direction: column; align-items: stretch; }
  .state-node { min-width: 50px; padding: var(--space-1) var(--space-2); }
}
</style>
