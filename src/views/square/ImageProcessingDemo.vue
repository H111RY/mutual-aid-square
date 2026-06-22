<template>
  <div class="demo-page" :class="{ 'large-font': largeFont }">
    <!-- ====== Header ====== -->
    <header class="demo-header">
      <BaseButton variant="ghost" size="sm" @click="$router.push('/square')">← 返回广场</BaseButton>
      <h1 class="demo-title">图片处理演示</h1>
      <BaseButton variant="ghost" size="sm" @click="largeFont = !largeFont">
        {{ largeFont ? '缩小字体' : '放大字体' }}
      </BaseButton>
    </header>

    <div class="demo-body">

      <!-- ============ SECTION 1: Architecture Pipeline ============ -->
      <section class="section">
        <h2 class="section-title">图片处理流水线</h2>
        <BaseCard flat>
          <div class="pipeline">
            <div class="pipe-step">
              <div class="pipe-icon">
                <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                  <rect x="2" y="6" width="28" height="20" rx="3" stroke="var(--brand-500)" stroke-width="2"/>
                  <circle cx="11" cy="13" r="2" fill="var(--brand-500)"/>
                  <path d="M2 22L8 16L13 20L18 14L24 18L30 12" stroke="var(--brand-500)" stroke-width="1.5" fill="none"/>
                </svg>
              </div>
              <span class="pipe-label">选择文件</span>
              <span class="pipe-detail">input[file]</span>
            </div>
            <span class="pipe-arrow">→</span>
            <div class="pipe-step">
              <div class="pipe-icon">
                <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                  <rect x="4" y="4" width="24" height="24" rx="4" stroke="var(--amber-500)" stroke-width="2"/>
                  <rect x="10" y="10" width="12" height="12" rx="2" fill="var(--amber-500)" opacity="0.3"/>
                  <line x1="14" y1="22" x2="18" y2="22" stroke="var(--amber-500)" stroke-width="1.5"/>
                </svg>
              </div>
              <span class="pipe-label">前端压缩</span>
              <span class="pipe-detail">CompressorJS</span>
            </div>
            <span class="pipe-arrow">→</span>
            <div class="pipe-step">
              <div class="pipe-icon">
                <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                  <path d="M4 20L12 12L16 16L22 10L28 16" stroke="var(--green-500)" stroke-width="2"/>
                  <line x1="16" y1="16" x2="16" y2="28" stroke="var(--green-500)" stroke-width="2"/>
                </svg>
              </div>
              <span class="pipe-label">上传进度</span>
              <span class="pipe-detail">FormData</span>
            </div>
            <span class="pipe-arrow">→</span>
            <div class="pipe-step">
              <div class="pipe-icon">
                <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                  <circle cx="16" cy="16" r="10" stroke="var(--purple-500)" stroke-width="2"/>
                  <circle cx="16" cy="16" r="4" fill="var(--purple-500)" opacity="0.3"/>
                </svg>
              </div>
              <span class="pipe-label">CDN 存储</span>
              <span class="pipe-detail">缩略图+原图</span>
            </div>
            <span class="pipe-arrow">→</span>
            <div class="pipe-step">
              <div class="pipe-icon">
                <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                  <circle cx="16" cy="16" r="12" stroke="var(--red-500)" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="var(--red-500)"/>
                  <circle cx="20" cy="16" r="3" fill="var(--red-500)" opacity="0.5"/>
                </svg>
              </div>
              <span class="pipe-label">懒加载显示</span>
              <span class="pipe-detail">BaseImage</span>
            </div>
          </div>
          <div class="pipe-params">
            <span class="param-chip">quality=0.8</span>
            <span class="param-chip">maxWidth≤1920px</span>
            <span class="param-chip">convertSize>1MB</span>
            <span class="param-chip">loading="lazy"</span>
          </div>
        </BaseCard>
      </section>

      <!-- ============ SECTION 2: Upload & Compression Lab ============ -->
      <section class="section">
        <h2 class="section-title">压缩对比实验室</h2>
        <div class="lab-layout">
          <!-- Left: Upload -->
          <BaseCard class="lab-upload-card">
            <template #header><h3 class="panel-title">选择图片</h3></template>
            <div
              :class="['lab-drop-zone', { dragging: isDragging, has: comp.originalPreview.value }]"
              @click="openFilePicker"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="onDrop"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                hidden
                @change="onFileSelect"
              />
              <template v-if="!comp.originalPreview.value">
                <svg viewBox="0 0 48 48" width="40" height="40" fill="none" class="drop-icon">
                  <rect x="6" y="8" width="36" height="32" rx="4" stroke="var(--brand-400)" stroke-width="2"/>
                  <circle cx="17" cy="19" r="3" fill="var(--brand-400)"/>
                  <path d="M6 32L16 22L24 30L32 20L42 28" stroke="var(--brand-400)" stroke-width="2" fill="none"/>
                </svg>
                <span class="drop-text">点击或拖拽上传图片</span>
                <span class="drop-hint">JPG / PNG / WebP</span>
              </template>
              <img v-else :src="comp.originalPreview.value" class="drop-preview-img" alt="" />
            </div>

            <!-- Compression controls -->
            <div class="compress-controls">
              <div class="control-row">
                <label class="control-label">压缩质量：<strong>{{ comp.quality.value }}</strong></label>
                <input
                  type="range"
                  :value="comp.quality.value"
                  min="0.1"
                  max="1"
                  step="0.05"
                  class="control-slider"
                  @input="comp.quality.value = +$event.target.value"
                  @change="recompress"
                />
                <div class="range-labels"><span>0.1</span><span>1.0</span></div>
              </div>
              <div class="control-row">
                <label class="control-label">最大宽度：<strong>{{ comp.maxWidth.value }}px</strong></label>
                <input
                  type="range"
                  :value="comp.maxWidth.value"
                  min="200"
                  max="3840"
                  step="100"
                  class="control-slider"
                  @input="comp.maxWidth.value = +$event.target.value"
                  @change="recompress"
                />
                <div class="range-labels"><span>200px</span><span>3840px</span></div>
              </div>
              <BaseButton
                variant="primary"
                size="md"
                :loading="comp.isCompressing.value"
                :disabled="!comp.originalFile.value"
                block
                @click="comp.compress()"
              >
                重新压缩
              </BaseButton>
            </div>
          </BaseCard>

          <!-- Right: Comparison -->
          <BaseCard class="lab-compare-card">
            <template #header><h3 class="panel-title">压缩对比</h3></template>
            <div v-if="!comp.originalPreview.value" class="empty-hint">
              <span class="empty-icon">📷</span>
              <span>选择一张图片开始对比</span>
            </div>
            <div v-else class="compare-grid">
              <!-- Original -->
              <div class="compare-panel">
                <div class="compare-label">原图</div>
                <div class="compare-preview">
                  <img :src="comp.originalPreview.value" alt="原图" />
                </div>
                <div class="compare-stats">
                  <div class="stat-row"><span>文件大小</span><strong>{{ comp.fmtSize(comp.originalSize.value) }}</strong></div>
                  <div class="stat-row"><span>尺寸</span><strong>{{ comp.originalDims.value.w }} × {{ comp.originalDims.value.h }}</strong></div>
                  <div class="stat-row"><span>格式</span><strong>{{ comp.originalFile.value?.type || '-' }}</strong></div>
                </div>
              </div>

              <!-- Arrow -->
              <div class="compare-arrow-area">
                <div class="compare-arrow-icon">
                  <svg viewBox="0 0 48 48" width="36" height="36">
                    <path d="M8 24H36M36 24L28 16M36 24L28 32" stroke="var(--brand-500)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div v-if="comp.compressedSize.value" class="savings-badge">
                  <span class="savings-pct">-{{ comp.savingsPercent.value }}%</span>
                  <span class="savings-kb">省 {{ comp.fmtSize(comp.savingsKB.value) }}</span>
                </div>
              </div>

              <!-- Compressed -->
              <div class="compare-panel">
                <div class="compare-label compressed">压缩后</div>
                <div class="compare-preview">
                  <img v-if="comp.compressedPreview.value" :src="comp.compressedPreview.value" alt="压缩后" />
                  <div v-else-if="comp.isCompressing.value" class="compressing-placeholder">
                    <span class="mini-spinner"></span>
                    <span>压缩中...</span>
                  </div>
                  <span v-else class="click-hint">点击"重新压缩"</span>
                </div>
                <div class="compare-stats" v-if="comp.compressedSize.value">
                  <div class="stat-row"><span>文件大小</span><strong class="saved">{{ comp.fmtSize(comp.compressedSize.value) }}</strong></div>
                  <div class="stat-row"><span>压缩耗时</span><strong>{{ comp.compressTime.value }}ms</strong></div>
                  <div class="stat-row"><span>节省空间</span><strong class="saved">{{ comp.savingsPercent.value }}%</strong></div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </section>

      <!-- ============ SECTION 3: Chat Image Simulation ============ -->
      <section class="section">
        <h2 class="section-title">聊天图片消息模拟</h2>
        <BaseCard flat class="chat-card">
          <div class="chat-header">
            <span class="chat-avatar">王</span>
            <div>
              <div class="chat-name">王阿姨 · 3号楼</div>
              <div class="chat-hint">图片消息：发送中占位 → 点击全屏预览</div>
            </div>
          </div>

          <div class="chat-messages">
            <div v-for="msg in chatMsgs" :key="msg.id" :class="['msg-row', msg.mine ? 'mine' : 'other']">
              <!-- Text messages -->
              <template v-if="msg.type === 'text'">
                <div :class="['text-bubble', msg.mine ? 'mine' : 'other']">{{ msg.content }}</div>
              </template>
              <!-- Image messages -->
              <template v-else>
                <div :class="['image-msg', msg.mine ? 'mine' : 'other']" @click="msg._status === 'sent' && openChatPreview(msg)">
                  <div class="img-msg-wrapper" :class="{ sending: msg._status === 'sending' }">
                    <img :src="msg.thumb" :alt="'图片'" />
                    <div v-if="msg._status === 'sending'" class="sending-overlay">
                      <div class="progress-ring-sm">
                        <svg viewBox="0 0 32 32" width="32" height="32">
                          <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2.5"/>
                          <circle cx="16" cy="16" r="12" fill="none" stroke="#fff" stroke-width="2.5"
                            stroke-dasharray="75" :stroke-dashoffset="75 * (1 - msg.progress / 100)" stroke-linecap="round"/>
                        </svg>
                        <span class="progress-num">{{ msg.progress }}%</span>
                      </div>
                    </div>
                    <div v-if="msg._status === 'failed'" class="error-overlay-img">
                      <span>!</span>
                    </div>
                  </div>
                  <span class="img-msg-size">{{ msg.size }}</span>
                </div>
              </template>
              <span class="msg-time">{{ msg.time }}</span>
            </div>
          </div>

          <!-- Chat input -->
          <div class="chat-bar">
            <label class="bar-btn" title="发送图片">
              📷
              <input type="file" accept="image/*" hidden @change="onChatImageSelect" />
            </label>
            <span class="bar-placeholder">点击 📷 发送图片消息</span>
            <button class="send-btn" @click="addChatText">发送</button>
          </div>
        </BaseCard>
      </section>

      <!-- ============ SECTION 4: Image Viewer Demo ============ -->
      <section class="section">
        <h2 class="section-title">全屏图片预览器</h2>
        <BaseCard>
          <p class="section-desc">点击任意图片进入全屏预览，支持键盘 ← → 切换、Escape 关闭、双指缩放、滑动翻页</p>
          <div class="viewer-gallery">
            <div
              v-for="(img, i) in sampleImages"
              :key="i"
              class="gallery-item"
              @click="openViewer(i)"
            >
              <img :src="img.thumb" :alt="img.title" />
              <span class="gallery-cap">{{ img.title }}</span>
            </div>
          </div>
          <ImageViewer
            v-model="viewerVisible"
            :images="sampleImages"
            :start-index="viewerIndex"
          />
        </BaseCard>
      </section>

      <!-- ============ SECTION 5: Image Transform Preview ============ -->
      <section class="section">
        <h2 class="section-title">图片变换预览（CSS 模拟）</h2>
        <BaseCard>
          <div class="transform-lab">
            <div class="transform-preview-area">
              <img
                :src="sampleImages[0]?.thumb || ''"
                class="transform-img"
                :style="transformStyle"
                alt=""
              />
            </div>
            <div class="transform-controls">
              <div class="transform-row">
                <span class="tf-label">旋转</span>
                <div class="tf-btns">
                  <button :class="['tf-btn', { active: rotation === 0 }]" @click="rotation = 0">0°</button>
                  <button :class="['tf-btn', { active: rotation === 90 }]" @click="rotation = 90">90°</button>
                  <button :class="['tf-btn', { active: rotation === 180 }]" @click="rotation = 180">180°</button>
                  <button :class="['tf-btn', { active: rotation === 270 }]" @click="rotation = 270">270°</button>
                </div>
              </div>
              <div class="transform-row">
                <span class="tf-label">翻转</span>
                <div class="tf-btns">
                  <button :class="['tf-btn', { active: flipH }]" @click="flipH = !flipH">水平</button>
                  <button :class="['tf-btn', { active: flipV }]" @click="flipV = !flipV">垂直</button>
                </div>
              </div>
              <div class="transform-row">
                <span class="tf-label">滤镜</span>
                <div class="tf-btns">
                  <button :class="['tf-btn', { active: filterName === 'none' }]" @click="filterName = 'none'">无</button>
                  <button :class="['tf-btn', { active: filterName === 'grayscale' }]" @click="filterName = 'grayscale'">灰度</button>
                  <button :class="['tf-btn', { active: filterName === 'sepia' }]" @click="filterName = 'sepia'">复古</button>
                  <button :class="['tf-btn', { active: filterName === 'blur' }]" @click="filterName = 'blur'">模糊</button>
                </div>
              </div>
              <div class="transform-row">
                <span class="tf-label">缩放</span>
                <input type="range" :value="zoomLevel" min="0.5" max="2" step="0.1" class="control-slider" @input="zoomLevel = +$event.target.value" />
                <span class="tf-val">{{ zoomLevel }}x</span>
              </div>
            </div>
          </div>
        </BaseCard>
      </section>

      <!-- ============ SECTION 6: Lazy Loading & Ratios ============ -->
      <section class="section">
        <h2 class="section-title">BaseImage 懒加载与比例适配</h2>
        <BaseCard flat>
          <div class="lazy-grid">
            <div v-for="item in lazyItems" :key="item.ratio" class="lazy-cell">
              <span class="lazy-ratio-label">{{ item.ratio }}</span>
              <BaseImage
                :src="item.src"
                :alt="item.ratio"
                :ratio="item.ratio"
                fit="cover"
                fallback-text="示例图片"
              />
            </div>
          </div>
        </BaseCard>
      </section>

      <!-- ============ SECTION 7: Elderly-Friendly Features ============ -->
      <section class="section">
        <h2 class="section-title">适老化设计要点</h2>
        <div class="elderly-grid">
          <BaseCard flat v-for="f in elderlyFeatures" :key="f.title">
            <div class="elderly-item">
              <span class="elderly-icon">{{ f.icon }}</span>
              <div>
                <h4 class="elderly-title">{{ f.title }}</h4>
                <p class="elderly-desc">{{ f.desc }}</p>
              </div>
            </div>
          </BaseCard>
        </div>
      </section>

      <!-- ============ SECTION 8: Debug Panel ============ -->
      <section class="section">
        <BaseCard flat>
          <template #header><h3 class="panel-title">调试面板</h3></template>
          <div class="debug-grid">
            <div class="debug-item">
              <span class="debug-label">原图大小</span>
              <span class="debug-value">{{ comp.fmtSize(comp.originalSize.value) }}</span>
            </div>
            <div class="debug-item">
              <span class="debug-label">压缩后大小</span>
              <span class="debug-value saved">{{ comp.fmtSize(comp.compressedSize.value) }}</span>
            </div>
            <div class="debug-item">
              <span class="debug-label">节省空间</span>
              <BaseBadge :color="comp.savingsPercent.value > 30 ? 'success' : 'warning'">
                {{ comp.savingsPercent.value }}%
              </BaseBadge>
            </div>
            <div class="debug-item">
              <span class="debug-label">压缩耗时</span>
              <span class="debug-value">{{ comp.compressTime.value }}ms</span>
            </div>
            <div class="debug-item">
              <span class="debug-label">压缩质量</span>
              <span class="debug-value">{{ comp.quality.value }}</span>
            </div>
            <div class="debug-item">
              <span class="debug-label">最大宽度</span>
              <span class="debug-value">{{ comp.maxWidth.value }}px</span>
            </div>
            <div class="debug-item">
              <span class="debug-label">压缩中</span>
              <BaseBadge :color="comp.isCompressing.value ? 'warning' : 'default'">
                {{ comp.isCompressing.value ? '是' : '否' }}
              </BaseBadge>
            </div>
            <div class="debug-item">
              <span class="debug-label">聊天消息数</span>
              <span class="debug-value">{{ chatMsgs.length }}</span>
            </div>
            <div class="debug-item">
              <span class="debug-label">旋转角度</span>
              <span class="debug-value">{{ rotation }}°</span>
            </div>
            <div class="debug-item">
              <span class="debug-label">大字模式</span>
              <BaseBadge :color="largeFont ? 'success' : 'default'">{{ largeFont ? '开启' : '关闭' }}</BaseBadge>
            </div>
          </div>
          <div v-if="comp.error.value" class="debug-error">
            <strong>错误：</strong>{{ comp.error.value }}
          </div>
        </BaseCard>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue';
import { useImageCompression } from '@/composables/useImageCompression';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseImage from '@/components/ui/BaseImage.vue';
import ImageViewer from './components/ImageViewer.vue';

/* ==================================================================
   ── Compression Composables ──
   ================================================================== */
const comp = useImageCompression();

/* ==================================================================
   ── UI State ──
   ================================================================== */
const largeFont = ref(false);
const isDragging = ref(false);
const fileInput = ref(null);
const viewerVisible = ref(false);
const viewerIndex = ref(0);

/* ── Transform state ── */
const rotation = ref(0);
const flipH = ref(false);
const flipV = ref(false);
const filterName = ref('none');
const zoomLevel = ref(1);

const transformStyle = computed(() => {
  const sx = (flipH.value ? -1 : 1) * zoomLevel.value;
  const sy = (flipV.value ? -1 : 1) * zoomLevel.value;
  let filter = '';
  switch (filterName.value) {
    case 'grayscale': filter = 'grayscale(1)'; break;
    case 'sepia': filter = 'sepia(0.8)'; break;
    case 'blur': filter = 'blur(3px)'; break;
  }
  return {
    transform: `rotate(${rotation.value}deg) scale(${sx}, ${sy})`,
    filter
  };
});

/* ── File handling ── */
function openFilePicker() { fileInput.value?.click(); }

function onFileSelect(e) {
  const file = e.target.files?.[0];
  if (file) comp.loadAndCompress(file);
  e.target.value = '';
}

function onDrop(e) {
  isDragging.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file) comp.loadAndCompress(file);
}

function recompress() {
  if (comp.originalFile.value) comp.compress();
}

/* ==================================================================
   ── Sample Images ──
   ================================================================== */
const sampleImages = [
  {
    thumb: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#667eea"/><stop offset="100%" style="stop-color:#764ba2"/></linearGradient></defs><rect width="400" height="300" fill="url(#g1)"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif" dy=".3em">春日社区</text></svg>'),
    original: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#667eea"/><stop offset="100%" style="stop-color:#764ba2"/></linearGradient></defs><rect width="400" height="300" fill="url(#g1)"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif" dy=".3em">春日社区</text></svg>'),
    title: '春日社区'
  },
  {
    thumb: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f093fb"/><stop offset="100%" style="stop-color:#f5576c"/></linearGradient></defs><rect width="400" height="300" fill="url(#g2)"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif" dy=".3em">义诊活动</text></svg>'),
    original: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f093fb"/><stop offset="100%" style="stop-color:#f5576c"/></linearGradient></defs><rect width="400" height="300" fill="url(#g2)"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif" dy=".3em">义诊活动</text></svg>'),
    title: '义诊活动'
  },
  {
    thumb: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#4facfe"/><stop offset="100%" style="stop-color:#00f2fe"/></linearGradient></defs><rect width="400" height="300" fill="url(#g3)"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif" dy=".3em">楼栋通知</text></svg>'),
    original: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#4facfe"/><stop offset="100%" style="stop-color:#00f2fe"/></linearGradient></defs><rect width="400" height="300" fill="url(#g3)"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif" dy=".3em">楼栋通知</text></svg>'),
    title: '楼栋通知'
  },
  {
    thumb: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#43e97b"/><stop offset="100%" style="stop-color:#38f9d7"/></linearGradient></defs><rect width="400" height="300" fill="url(#g4)"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif" dy=".3em">防诈海报</text></svg>'),
    original: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#43e97b"/><stop offset="100%" style="stop-color:#38f9d7"/></linearGradient></defs><rect width="400" height="300" fill="url(#g4)"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif" dy=".3em">防诈海报</text></svg>'),
    title: '防诈海报'
  },
  {
    thumb: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#fa709a"/><stop offset="100%" style="stop-color:#fee140"/></linearGradient></defs><rect width="400" height="300" fill="url(#g5)"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif" dy=".3em">邻里互助</text></svg>'),
    original: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#fa709a"/><stop offset="100%" style="stop-color:#fee140"/></linearGradient></defs><rect width="400" height="300" fill="url(#g5)"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif" dy=".3em">邻里互助</text></svg>'),
    title: '邻里互助'
  },
  {
    thumb: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#a18cd1"/><stop offset="100%" style="stop-color:#fbc2eb"/></linearGradient></defs><rect width="400" height="300" fill="url(#g6)"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif" dy=".3em">便民信息</text></svg>'),
    original: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#a18cd1"/><stop offset="100%" style="stop-color:#fbc2eb"/></linearGradient></defs><rect width="400" height="300" fill="url(#g6)"/><text x="200" y="150" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif" dy=".3em">便民信息</text></svg>'),
    title: '便民信息'
  }
];

function openViewer(idx) {
  viewerIndex.value = idx;
  viewerVisible.value = true;
}

/* ==================================================================
   ── Chat Simulation ──
   ================================================================== */
const chatMsgs = ref([
  { id: 1, mine: false, type: 'text', content: '你好！请问有闲置的轮椅可以借用吗？', time: '10:15' },
  { id: 2, mine: true, type: 'text', content: '有的，我拍个照片给你看', time: '10:17' },
  {
    id: 3, mine: true, type: 'image',
    thumb: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><defs><linearGradient id="c1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#4facfe"/><stop offset="100%" style="stop-color:#00f2fe"/></linearGradient></defs><rect width="300" height="200" fill="url(#c1)"/><text x="150" y="100" text-anchor="middle" fill="white" font-size="18" font-family="sans-serif" dy=".3em">闲置轮椅照片</text></svg>'),
    size: '48KB', _status: 'sent', progress: 100, time: '10:18'
  },
  { id: 4, mine: false, type: 'text', content: '看起来很不错！方便明天下午来取吗？', time: '10:20' },
  {
    id: 5, mine: false, type: 'image',
    thumb: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><defs><linearGradient id="c2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#fa709a"/><stop offset="100%" style="stop-color:#fee140"/></linearGradient></defs><rect width="300" height="200" fill="url(#c2)"/><text x="150" y="100" text-anchor="middle" fill="white" font-size="18" font-family="sans-serif" dy=".3em">医院便民卡</text></svg>'),
    size: '35KB', _status: 'sent', progress: 100, time: '10:21'
  },
]);

let chatMsgId = 100;

function onChatImageSelect(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  e.target.value = '';

  // Simulate sending
  const id = ++chatMsgId;
  const previewUrl = URL.createObjectURL(file);
  const msg = {
    id, mine: true, type: 'image',
    thumb: previewUrl,
    size: Math.round(file.size / 1024) + 'KB',
    _status: 'sending', progress: 0, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  };
  chatMsgs.value.push(msg);
  scrollChat();

  // Simulate progress
  let p = 0;
  const timer = setInterval(() => {
    p += Math.floor(Math.random() * 25) + 5;
    if (p >= 100) {
      p = 100;
      clearInterval(timer);
      const entry = chatMsgs.value.find(m => m.id === id);
      if (entry) { entry._status = 'sent'; entry.progress = 100; }
    } else {
      const entry = chatMsgs.value.find(m => m.id === id);
      if (entry) entry.progress = p;
    }
  }, 300);
}

function addChatText() {
  const texts = ['好的！', '没问题', '收到，谢谢！', '我确认一下'];
  const msg = {
    id: ++chatMsgId, mine: true, type: 'text',
    content: texts[Math.floor(Math.random() * texts.length)],
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  };
  chatMsgs.value.push(msg);
  scrollChat();
}

function openChatPreview(msg) {
  if (!msg.thumb) return;
  // Extend sample images temporarily and open viewer
  viewerIndex.value = sampleImages.length;
  sampleImages.push({ thumb: msg.thumb, original: msg.thumb, title: '聊天图片' });
  viewerVisible.value = true;
  // Clean up after close
  const cleanup = setInterval(() => {
    if (!viewerVisible.value) {
      sampleImages.pop();
      clearInterval(cleanup);
    }
  }, 500);
}

function scrollChat() {
  nextTick(() => {
    const el = document.querySelector('.chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  });
}

/* ==================================================================
   ── Lazy Loading ──
   ================================================================== */
const lazyItems = [
  { ratio: '1/1', src: sampleImages[0].thumb },
  { ratio: '4/3', src: sampleImages[1].thumb },
  { ratio: '16/9', src: sampleImages[2].thumb },
  { ratio: '3/4', src: sampleImages[3].thumb },
  { ratio: '2/3', src: sampleImages[4].thumb },
  { ratio: '1/2', src: sampleImages[5].thumb },
];

/* ==================================================================
   ── Elderly Features ──
   ================================================================== */
const elderlyFeatures = [
  { icon: '🔍', title: '大尺寸预览图', desc: '图片网格最小触控区 44px，缩略图清晰可辨，点击可全屏放大查看详情' },
  { icon: '🖼️', title: '全屏灯箱预览', desc: '点击图片进入全屏预览，支持左右滑动翻页、键盘方向键切换，关闭按钮 ≥ 44px' },
  { icon: '🗑️', title: '醒目的删除按钮', desc: '红色半透明删除按钮，直观可见，误删后支持重新上传恢复' },
  { icon: '📊', title: '上传进度可见', desc: '环形进度条 + 百分比数字，上传状态一目了然，失败时明确提示并支持重试' },
  { icon: '💾', title: '自动压缩省流量', desc: '前端压缩至 ≤ 1920px + 质量 0.8，大幅减少上传流量和等待时间' },
  { icon: '🔄', title: '拖拽上传 + 点击上传', desc: '支持点击选择、拖拽文件到区域两种方式，降低操作门槛' }
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
  display: flex; align-items: center; justify-content: space-between;
  height: var(--header-height); padding: 0 var(--space-4);
  background: var(--bg-card); border-bottom: 1px solid var(--border-light);
  position: sticky; top: 0; z-index: 100;
}
.demo-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }

/* ── Body ── */
.demo-body {
  max-width: 1024px; margin: 0 auto; padding: var(--space-4);
  display: flex; flex-direction: column; gap: var(--space-6);
}

/* ── Sections ── */
.section { display: flex; flex-direction: column; gap: var(--space-3); }
.section-title {
  font-size: var(--text-lg); font-weight: var(--font-bold);
  margin: 0; color: var(--text-primary);
  padding-left: var(--space-2); border-left: 3px solid var(--brand-400);
}
.section-desc {
  font-size: var(--text-sm); color: var(--text-muted); margin: 0 0 var(--space-3);
}
.panel-title { font-size: var(--text-base); font-weight: var(--font-bold); margin: 0; }
.empty-hint {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
  padding: var(--space-6); color: var(--text-muted);
}
.empty-icon { font-size: 40px; }

/* ============================
   Pipeline
   ============================ */
.pipeline {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-4); flex-wrap: wrap; justify-content: center;
}
.pipe-step {
  display: flex; flex-direction: column; align-items: center;
  gap: 4px; padding: var(--space-2) var(--space-3);
  background: var(--gray-50); border-radius: var(--radius-md);
  min-width: 80px;
}
.pipe-icon { height: 36px; display: flex; align-items: center; }
.pipe-label { font-size: var(--text-xs); font-weight: var(--font-bold); color: var(--text-primary); }
.pipe-detail { font-size: 11px; color: var(--text-muted); font-family: monospace; }
.pipe-arrow {
  font-size: var(--text-xl); color: var(--text-muted); font-weight: var(--font-bold);
}
.pipe-params {
  display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
  margin-top: var(--space-3); padding-top: var(--space-3);
  border-top: 1px solid var(--border-light);
}
.param-chip {
  padding: 2px 12px; font-size: var(--text-xs); font-family: monospace;
  background: var(--brand-50); color: var(--brand-600);
  border-radius: var(--radius-full); border: 1px solid var(--brand-200);
}

/* ============================
   Compression Lab
   ============================ */
.lab-layout {
  display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);
}
.lab-drop-zone {
  border: 2px dashed var(--border-normal); border-radius: var(--radius-lg);
  padding: var(--space-4); cursor: pointer;
  transition: all var(--duration-fast);
  background: var(--gray-50); display: flex;
  flex-direction: column; align-items: center; justify-content: center;
  gap: var(--space-2); min-height: 180px;
  overflow: hidden;
}
.lab-drop-zone:hover, .lab-drop-zone.dragging { border-color: var(--brand-400); background: var(--brand-50); }
.lab-drop-zone.has { padding: 0; border-style: solid; }
.drop-icon { flex-shrink: 0; }
.drop-text { font-size: var(--text-base); font-weight: var(--font-medium); color: var(--text-secondary); }
.drop-hint { font-size: var(--text-xs); color: var(--text-muted); }
.drop-preview-img { width: 100%; height: 100%; object-fit: contain; max-height: 260px; }

/* Compression controls */
.compress-controls {
  margin-top: var(--space-4);
  display: flex; flex-direction: column; gap: var(--space-3);
}
.control-row { display: flex; flex-direction: column; gap: 4px; }
.control-label { font-size: var(--text-sm); color: var(--text-secondary); }
.control-slider {
  width: 100%; height: 6px; -webkit-appearance: none; appearance: none;
  background: var(--gray-200); border-radius: 3px; outline: none;
}
.control-slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 20px; height: 20px;
  border-radius: 50%; background: var(--brand-500); cursor: pointer;
}
.range-labels {
  display: flex; justify-content: space-between;
  font-size: var(--text-xs); color: var(--text-muted);
}

/* Comparison */
.compare-grid {
  display: grid; grid-template-columns: 1fr auto 1fr;
  gap: var(--space-3); align-items: start;
}
.compare-panel { display: flex; flex-direction: column; gap: var(--space-2); }
.compare-label {
  font-size: var(--text-sm); font-weight: var(--font-semibold);
  color: var(--text-secondary); text-align: center;
}
.compare-label.compressed { color: var(--green-600); }
.compare-preview {
  background: var(--gray-100); border-radius: var(--radius-md);
  aspect-ratio: 4/3; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.compare-preview img { width: 100%; height: 100%; object-fit: contain; }
.compare-stats {
  display: flex; flex-direction: column; gap: 2px;
  background: var(--gray-50); border-radius: var(--radius-sm); padding: var(--space-2);
}
.stat-row {
  display: flex; justify-content: space-between;
  font-size: var(--text-xs);
}
.stat-row span { color: var(--text-muted); }
.stat-row strong { color: var(--text-primary); }
strong.saved { color: var(--green-600); }

.compare-arrow-area {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: var(--space-2); padding-top: 24px;
}
.compare-arrow-icon { color: var(--brand-500); }
.savings-badge {
  display: flex; flex-direction: column; align-items: center;
  padding: 4px 12px; background: var(--green-50);
  border-radius: var(--radius-md); border: 1px solid var(--green-200);
}
.savings-pct { font-size: var(--text-lg); font-weight: var(--font-bold); color: var(--green-600); }
.savings-kb { font-size: var(--text-xs); color: var(--green-500); }

.compressing-placeholder {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.mini-spinner {
  width: 28px; height: 28px; border: 3px solid var(--gray-200);
  border-top-color: var(--brand-400); border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.click-hint { color: var(--text-muted); font-size: var(--text-sm); }

/* ============================
   Chat Simulation
   ============================ */
.chat-card { overflow: hidden; }
.chat-header {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--gray-50); border-bottom: 1px solid var(--border-light);
}
.chat-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--brand-100); color: var(--brand-500);
  display: flex; align-items: center; justify-content: center;
  font-size: var(--text-lg); font-weight: var(--font-bold); flex-shrink: 0;
}
.chat-name { font-size: var(--text-base); font-weight: var(--font-semibold); }
.chat-hint { font-size: var(--text-xs); color: var(--text-muted); }

.chat-messages {
  height: 320px; overflow-y: auto; padding: var(--space-4);
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

.text-bubble {
  padding: var(--space-2) var(--space-4); border-radius: 18px;
  font-size: var(--text-base); line-height: var(--leading-relaxed);
  word-break: break-word;
}
.text-bubble.mine { background: var(--brand-400); color: #fff; border-bottom-right-radius: 6px; }
.text-bubble.other { background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-light); border-bottom-left-radius: 6px; }

.image-msg {
  cursor: pointer; max-width: 220px;
  transition: transform var(--duration-fast);
}
.image-msg:hover { transform: scale(1.02); }
.image-msg.mine { align-self: flex-end; }
.img-msg-wrapper {
  border-radius: var(--radius-md); overflow: hidden; position: relative;
  max-height: 180px; border: 1px solid var(--border-light);
}
.img-msg-wrapper img { width: 100%; height: 100%; object-fit: cover; display: block; }
.img-msg-wrapper.sending { opacity: 0.6; }
.sending-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.3);
}
.progress-ring-sm { position: relative; display: flex; align-items: center; justify-content: center; }
.progress-ring-sm svg { transform: rotate(-90deg); }
.progress-num {
  position: absolute; font-size: 9px; font-weight: var(--font-bold); color: #fff;
}
.error-overlay-img {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(198,40,40,0.6);
}
.error-overlay-img span {
  width: 28px; height: 28px; border-radius: 50%;
  background: #fff; color: var(--red-500);
  font-size: 16px; font-weight: var(--font-bold);
  display: flex; align-items: center; justify-content: center;
}
.img-msg-size {
  font-size: 10px; color: var(--text-muted); margin-top: 2px; display: block;
}

.chat-bar {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-card); border-top: 1px solid var(--border-light);
}
.bar-btn {
  min-width: var(--tap-min); min-height: var(--tap-min);
  border-radius: 50%; border: none; background: var(--gray-100);
  font-size: 22px; cursor: pointer; display: flex;
  align-items: center; justify-content: center;
}
.bar-placeholder {
  flex: 1; padding: var(--space-2) var(--space-3);
  font-size: var(--text-base); color: var(--text-muted);
  background: var(--gray-50); border-radius: var(--radius-md);
  min-height: var(--tap-min); display: flex; align-items: center;
}
.send-btn {
  min-width: 56px; min-height: var(--tap-min);
  padding: 0 var(--space-4); font-size: var(--text-base);
  font-weight: var(--font-semibold); font-family: inherit;
  background: var(--brand-400); color: #fff;
  border: none; border-radius: var(--radius-md); cursor: pointer;
}

/* ============================
   Image Viewer Demo
   ============================ */
.viewer-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}
.gallery-item {
  border-radius: var(--radius-md); overflow: hidden;
  cursor: pointer; position: relative;
  transition: transform var(--duration-fast);
  aspect-ratio: 4/3;
}
.gallery-item:hover { transform: scale(1.03); }
.gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
.gallery-cap {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: var(--space-1) var(--space-2);
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
  font-size: var(--text-xs); color: #fff;
}

/* ============================
   Transform Preview
   ============================ */
.transform-lab {
  display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);
}
.transform-preview-area {
  background: var(--gray-100); border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  min-height: 220px; overflow: hidden;
}
.transform-img { max-width: 100%; max-height: 220px; transition: transform 0.3s ease, filter 0.3s ease; }
.transform-controls { display: flex; flex-direction: column; gap: var(--space-3); }
.transform-row { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
.tf-label { font-size: var(--text-sm); color: var(--text-muted); min-width: 48px; }
.tf-btns { display: flex; gap: 4px; }
.tf-btn {
  padding: 4px 14px; font-size: var(--text-sm); font-family: inherit;
  border: 1px solid var(--border-normal); border-radius: var(--radius-sm);
  background: var(--bg-card); cursor: pointer;
  transition: all var(--duration-fast);
}
.tf-btn:hover { border-color: var(--brand-400); }
.tf-btn.active { background: var(--brand-400); color: #fff; border-color: var(--brand-400); }
.tf-val { font-size: var(--text-sm); font-weight: var(--font-semibold); min-width: 36px; }

/* ============================
   Lazy Loading
   ============================ */
.lazy-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}
.lazy-cell { display: flex; flex-direction: column; gap: var(--space-1); }
.lazy-ratio-label {
  font-size: var(--text-xs); color: var(--text-muted);
  font-family: monospace;
}

/* ============================
   Elderly Features
   ============================ */
.elderly-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}
.elderly-item { display: flex; gap: var(--space-3); align-items: flex-start; }
.elderly-icon { font-size: 28px; flex-shrink: 0; }
.elderly-title { font-size: var(--text-base); font-weight: var(--font-bold); margin: 0 0 2px; }
.elderly-desc { font-size: var(--text-sm); color: var(--text-secondary); margin: 0; line-height: var(--leading-relaxed); }

/* ============================
   Debug Panel
   ============================ */
.debug-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-3);
}
.debug-item { display: flex; align-items: center; gap: var(--space-2); }
.debug-label { font-size: var(--text-sm); color: var(--text-muted); min-width: 72px; }
.debug-value { font-size: var(--text-base); font-weight: var(--font-medium); }
.debug-value.saved { color: var(--green-600); }
.debug-error {
  margin-top: var(--space-3); padding: var(--space-3);
  background: var(--red-50); border-radius: var(--radius-sm);
  font-size: var(--text-sm); color: var(--red-700);
}

/* ============================
   Large Font Mode
   ============================ */
.large-font {
  --text-xs: 15px; --text-sm: 17px;
  --text-base: 20px; --text-lg: 24px; --text-xl: 30px;
  --tap-min: 56px;
}
.large-font .gallery-item { aspect-ratio: 3/2; }
.large-font .chat-messages { height: 400px; }

@media (max-width: 768px) {
  .lab-layout { grid-template-columns: 1fr; }
  .compare-grid { grid-template-columns: 1fr; }
  .compare-arrow-area { flex-direction: row; padding-top: 0; }
  .compare-arrow-icon svg { transform: rotate(90deg); }
  .transform-lab { grid-template-columns: 1fr; }
  .viewer-gallery { grid-template-columns: repeat(2, 1fr); }
  .lazy-grid { grid-template-columns: repeat(2, 1fr); }
  .elderly-grid { grid-template-columns: 1fr; }
  .pipeline { flex-direction: column; }
  .pipe-arrow { transform: rotate(90deg); }
}
</style>
