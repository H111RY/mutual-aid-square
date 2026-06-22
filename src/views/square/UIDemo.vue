<template>
  <div class="ui-demo-page">
    <!-- ====== 顶部导航 ====== -->
    <header class="demo-header">
      <BaseButton variant="ghost" size="sm" @click="$router.back()">← 返回</BaseButton>
      <h1 class="demo-title">UI 组件库</h1>
      <BaseButton
        variant="secondary"
        size="sm"
        round
        :class="{ active: isLargeFont }"
        @click="toggleFont"
      >{{ isLargeFont ? '标准版' : 'A+ 大字版' }}</BaseButton>
    </header>

    <div class="demo-body">
      <!-- ================================================================
           色彩系统
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">色彩系统</h2>

        <BaseCard flat>
          <h3 class="subsection-title">品牌色</h3>
          <div class="color-grid">
            <div v-for="c in brandColors" :key="c.name" class="color-swatch">
              <div class="color-block" :style="{ background: c.value }"></div>
              <span class="color-name">{{ c.name }}</span>
              <span class="color-hex">{{ c.value }}</span>
            </div>
          </div>

          <BaseDivider />

          <h3 class="subsection-title">语义色</h3>
          <div class="color-grid">
            <div v-for="c in semanticColors" :key="c.name" class="color-swatch">
              <div class="color-block" :style="{ background: c.value }"></div>
              <span class="color-name">{{ c.name }}</span>
              <span class="color-hex">{{ c.value }}</span>
            </div>
          </div>

          <BaseDivider />

          <h3 class="subsection-title">中性色</h3>
          <div class="color-grid">
            <div v-for="c in grayColors" :key="c.name" class="color-swatch">
              <div class="color-block" :style="{ background: c.value, border: c.name.includes('50') ? '1px solid #ddd' : 'none' }"></div>
              <span class="color-name">{{ c.name }}</span>
              <span class="color-hex">{{ c.value }}</span>
            </div>
          </div>
        </BaseCard>
      </section>

      <BaseDivider />

      <!-- ================================================================
           排版系统
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">排版系统（Typography）</h2>
        <BaseCard flat>
          <div class="typo-list">
            <div v-for="t in typoScales" :key="t.label" class="typo-item">
              <span class="typo-label">{{ t.label }}</span>
              <span :style="{ fontSize: t.size, fontWeight: t.weight, lineHeight: t.leading }">
                互助广场 — 社区互助平台
              </span>
              <span class="typo-spec">{{ t.cssVar }} | {{ t.size }}</span>
            </div>
          </div>
        </BaseCard>
      </section>

      <BaseDivider />

      <!-- ================================================================
           BaseButton 按钮
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">BaseButton 按钮</h2>

        <BaseCard flat>
          <h3 class="subsection-title">Variants（变体）</h3>
          <div class="demo-row">
            <BaseButton variant="primary">主要按钮</BaseButton>
            <BaseButton variant="secondary">次要按钮</BaseButton>
            <BaseButton variant="outline">描边按钮</BaseButton>
            <BaseButton variant="danger">危险按钮</BaseButton>
            <BaseButton variant="ghost">幽灵按钮</BaseButton>
          </div>

          <BaseDivider />

          <h3 class="subsection-title">Sizes（尺寸）</h3>
          <div class="demo-row demo-align-center">
            <BaseButton variant="primary" size="sm">Small</BaseButton>
            <BaseButton variant="primary" size="md">Medium</BaseButton>
            <BaseButton variant="primary" size="lg">Large</BaseButton>
          </div>

          <BaseDivider />

          <h3 class="subsection-title">Loading / Disabled / Round / Block</h3>
          <div class="demo-row demo-align-center">
            <BaseButton variant="primary" loading>加载中</BaseButton>
            <BaseButton variant="primary" disabled>已禁用</BaseButton>
            <BaseButton variant="primary" round>
              <template #icon><span style="font-size:18px">＋</span></template>
              发布信息
            </BaseButton>
          </div>
          <BaseButton variant="primary" block style="margin-top:12px">Block 全宽按钮</BaseButton>
        </BaseCard>
      </section>

      <BaseDivider />

      <!-- ================================================================
           BaseInput 输入框
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">BaseInput 输入框</h2>
        <BaseCard flat>
          <div class="demo-grid-2">
            <BaseInput v-model="inputDemo" label="用户名" placeholder="请输入用户名" hint="支持中文、英文、数字" />
            <BaseInput v-model="inputError" label="手机号" placeholder="请输入手机号" error="手机号格式不正确" />
            <BaseInput v-model="inputDisabled" label="已禁用" placeholder="不可编辑" disabled />
            <BaseInput v-model="inputPrefixed" label="金额" placeholder="0.00">
              <template #prefix>¥</template>
              <template #suffix>.00</template>
            </BaseInput>
          </div>
        </BaseCard>
      </section>

      <BaseDivider />

      <!-- ================================================================
           BaseTextarea 文本域
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">BaseTextarea 文本域</h2>
        <BaseCard flat>
          <BaseTextarea
            v-model="textareaDemo"
            label="内容描述"
            placeholder="请输入描述信息..."
            :maxlength="200"
            :rows="3"
          />
        </BaseCard>
      </section>

      <BaseDivider />

      <!-- ================================================================
           BaseSwitch / BaseRadio / BaseCheckbox
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">开关 / 单选 / 多选</h2>

        <BaseCard flat>
          <h3 class="subsection-title">BaseSwitch 开关</h3>
          <div class="demo-row demo-align-center">
            <BaseSwitch v-model="switchOn" label="启用通知" />
            <BaseSwitch v-model="switchOff" label="消息免打扰" disabled />
          </div>

          <BaseDivider />

          <h3 class="subsection-title">BaseRadio 单选</h3>
          <BaseRadio
            v-model="radioValue"
            :options="[
              { value: 'chat', label: '交流' },
              { value: 'help', label: '求助' },
              { value: 'idle', label: '闲置' }
            ]"
            name="demo-radio"
          />
          <p style="margin-top:8px;font-size:var(--text-sm);color:var(--text-muted)">当前选中：{{ radioValue }}</p>

          <BaseDivider />

          <h3 class="subsection-title">BaseCheckbox 多选</h3>
          <BaseCheckbox
            v-model="checkboxValues"
            :options="[
              { value: 'hospital', label: '医院便民' },
              { value: 'policy', label: '政策解读' },
              { value: 'anti_fraud', label: '防诈骗' }
            ]"
            inline
          />
          <p style="margin-top:8px;font-size:var(--text-sm);color:var(--text-muted)">当前选中：{{ checkboxValues.join(', ') || '无' }}</p>
        </BaseCard>
      </section>

      <BaseDivider />

      <!-- ================================================================
           BaseBadge / BaseTag
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">BaseBadge / BaseTag 标签</h2>

        <BaseCard flat>
          <h3 class="subsection-title">BaseBadge 角标</h3>
          <div class="demo-row demo-align-center">
            <BaseBadge color="default">默认</BaseBadge>
            <BaseBadge color="primary">求助</BaseBadge>
            <BaseBadge color="success">政策解读</BaseBadge>
            <BaseBadge color="danger">防诈骗</BaseBadge>
            <BaseBadge color="warning">置顶</BaseBadge>
            <BaseBadge color="info">便民</BaseBadge>
            <BaseBadge color="purple">闲置</BaseBadge>
            <BaseBadge color="orange">紧急</BaseBadge>
          </div>

          <BaseDivider />

          <h3 class="subsection-title">BaseTag 标签（可移除 / 可点击）</h3>
          <div class="demo-row demo-align-center">
            <BaseTag v-for="t in activeTags" :key="t" color="primary" removable @remove="removeTag(t)">{{ t }}</BaseTag>
            <BaseTag color="default" clickable @click="addTag">＋ 添加标签</BaseTag>
          </div>
          <div class="demo-row demo-align-center" style="margin-top:8px">
            <BaseTag v-for="c in tagColors" :key="c" :color="c">{{ c }}</BaseTag>
          </div>
        </BaseCard>
      </section>

      <BaseDivider />

      <!-- ================================================================
           BaseAvatar 头像
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">BaseAvatar 头像</h2>
        <BaseCard flat>
          <div class="demo-row demo-align-center">
            <div class="avatar-demo-item">
              <BaseAvatar name="王阿姨" size="sm" />
              <span>sm</span>
            </div>
            <div class="avatar-demo-item">
              <BaseAvatar name="王阿姨" size="md" />
              <span>md</span>
            </div>
            <div class="avatar-demo-item">
              <BaseAvatar name="王阿姨" size="lg" />
              <span>lg</span>
            </div>
            <div class="avatar-demo-item">
              <BaseAvatar name="王阿姨" size="xl" />
              <span>xl</span>
            </div>
            <BaseDivider vertical />
            <div class="avatar-demo-item">
              <BaseAvatar name="李大伯" bg="var(--green-100)" />
              <span>自定义色</span>
            </div>
            <div class="avatar-demo-item">
              <BaseAvatar src="" name="系统" bg="var(--amber-100)" />
              <span>无图片</span>
            </div>
          </div>
        </BaseCard>
      </section>

      <BaseDivider />

      <!-- ================================================================
           BaseProgress 进度条
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">BaseProgress 进度条</h2>
        <BaseCard flat>
          <BaseProgress :percent="progressVal" variant="primary" showPercent style="margin-bottom:16px" />
          <BaseProgress :percent="65" variant="success" showPercent style="margin-bottom:16px" />
          <BaseProgress :percent="30" variant="warning" showPercent style="margin-bottom:16px" />
          <BaseProgress :percent="90" variant="danger" showPercent style="margin-bottom:16px" />
          <BaseProgress indeterminate variant="primary" style="margin-bottom:16px" />

          <div class="demo-row demo-align-center" style="margin-top:12px">
            <BaseButton variant="outline" size="sm" @click="progressVal = Math.max(0, progressVal - 10)">−10%</BaseButton>
            <span style="font-size:var(--text-lg);font-weight:var(--font-bold);min-width:60px;text-align:center">{{ progressVal }}%</span>
            <BaseButton variant="outline" size="sm" @click="progressVal = Math.min(100, progressVal + 10)">+10%</BaseButton>
          </div>
        </BaseCard>
      </section>

      <BaseDivider />

      <!-- ================================================================
           BaseCard
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">BaseCard 卡片</h2>
        <div class="demo-grid-2">
          <BaseCard>
            <template #header><h3 style="margin:0;font-size:var(--text-lg)">标准卡片</h3></template>
            <p style="margin:0;color:var(--text-secondary)">带 header + body 的标准卡片，shadow-sm 阴影效果。</p>
            <template #footer>
              <div style="display:flex;gap:8px;justify-content:flex-end">
                <BaseButton variant="ghost" size="sm">取消</BaseButton>
                <BaseButton variant="primary" size="sm">确认</BaseButton>
              </div>
            </template>
          </BaseCard>

          <BaseCard flat hover>
            <template #header><h3 style="margin:0;font-size:var(--text-lg)">Flat + Hover 卡片</h3></template>
            <p style="margin:0;color:var(--text-secondary)">flat 无阴影仅边框，hover 悬停时显示阴影。</p>
          </BaseCard>
        </div>
      </section>

      <BaseDivider />

      <!-- ================================================================
           BaseDivider
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">BaseDivider 分割线</h2>
        <BaseCard flat>
          <p style="color:var(--text-secondary)">内容 A</p>
          <BaseDivider />
          <p style="color:var(--text-secondary)">默认分割线（无文字）</p>
          <BaseDivider>带文字的分割线</BaseDivider>
          <p style="color:var(--text-secondary)">下方内容</p>
          <div style="display:flex;align-items:center;height:60px">
            <BaseDivider vertical />
            <span style="padding:0 16px;color:var(--text-muted)">垂直分割线</span>
            <BaseDivider vertical />
          </div>
        </BaseCard>
      </section>

      <BaseDivider />

      <!-- ================================================================
           BaseSkeleton
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">BaseSkeleton 骨架屏</h2>
        <BaseCard flat>
          <div class="demo-grid-2">
            <div>
              <h3 class="subsection-title">Card 骨架</h3>
              <BaseSkeleton variant="card" :count="2" />
            </div>
            <div>
              <h3 class="subsection-title">List 骨架</h3>
              <BaseSkeleton variant="list" :count="3" />
            </div>
          </div>
          <BaseDivider />
          <h3 class="subsection-title">Text 骨架</h3>
          <BaseSkeleton variant="text" :count="3" />
        </BaseCard>
      </section>

      <BaseDivider />

      <!-- ================================================================
           BaseEmpty
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">BaseEmpty 空状态</h2>
        <BaseCard flat>
          <BaseEmpty icon="📭" title="暂无数据" desc="这里还没有任何内容，快去发布第一条吧～">
            <template #action>
              <BaseButton variant="primary" size="sm" style="margin-top:16px">立即发布</BaseButton>
            </template>
          </BaseEmpty>
        </BaseCard>
      </section>

      <BaseDivider />

      <!-- ================================================================
           BaseImage
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">BaseImage 图片</h2>
        <BaseCard flat>
          <div class="image-demo-grid">
            <div class="image-demo-item">
              <BaseImage src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%234A90D9' width='400' height='300'/%3E%3Ctext fill='white' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E1:1%3C/text%3E%3C/svg%3E" alt="正方形" ratio="1/1" />
              <span>1:1</span>
            </div>
            <div class="image-demo-item">
              <BaseImage src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%232E7D32' width='400' height='200'/%3E%3Ctext fill='white' font-size='20' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3E2:1%3C/text%3E%3C/svg%3E" alt="宽图" ratio="2/1" />
              <span>2:1</span>
            </div>
            <div class="image-demo-item">
              <BaseImage src="" alt="加载失败" fallback-text="图片加载失败" />
              <span>错误状态</span>
            </div>
          </div>
        </BaseCard>
      </section>

      <!-- ================================================================
           BaseToast 演示
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">BaseToast 通知条</h2>
        <BaseCard flat>
          <div class="demo-row">
            <BaseButton variant="outline" size="sm" @click="fireToast('success')">Success</BaseButton>
            <BaseButton variant="outline" size="sm" @click="fireToast('error')">Error</BaseButton>
            <BaseButton variant="outline" size="sm" @click="fireToast('warning')">Warning</BaseButton>
            <BaseButton variant="outline" size="sm" @click="fireToast('info')">Info</BaseButton>
          </div>
        </BaseCard>
      </section>

      <!-- ================================================================
           BaseModal 演示
           ================================================================ -->
      <section class="demo-section">
        <h2 class="section-title">BaseModal 弹窗</h2>
        <BaseCard flat>
          <div class="demo-row">
            <BaseButton variant="outline" size="sm" @click="modalSize = 'sm'; showModal = true">小弹窗</BaseButton>
            <BaseButton variant="outline" size="sm" @click="modalSize = 'md'; showModal = true">标准弹窗</BaseButton>
            <BaseButton variant="outline" size="sm" @click="modalSize = 'lg'; showModal = true">大弹窗</BaseButton>
          </div>
        </BaseCard>
      </section>
    </div>

    <!-- ====== 悬浮字体切换 ====== -->
    <div class="float-toggle">
      <BaseButton
        variant="primary"
        round
        @click="toggleFont"
        :aria-label="isLargeFont ? '切换标准字体' : '切换大字体'"
      >{{ isLargeFont ? '标准' : 'A+' }}</BaseButton>
    </div>

    <!-- ====== BaseModal 实例 ====== -->
    <BaseModal
      :visible="showModal"
      :title="'弹窗示例 - ' + modalSize"
      :size="modalSize"
      mask-closable
      @update:visible="showModal = $event"
    >
      <p style="color:var(--text-secondary);line-height:var(--leading-relaxed)">
        这是一个 <strong>{{ modalSize }}</strong> 尺寸的 BaseModal 弹窗。
        背景遮罩点击可关闭（maskClosable: true）。
      </p>
      <p style="color:var(--text-muted);font-size:var(--text-sm)">
        适老化特性：弹窗内容支持滚动、关闭按钮 ≥ 44px、缩放渐入动画。
      </p>
      <template #footer>
        <BaseButton variant="ghost" @click="showModal = false">取消</BaseButton>
        <BaseButton variant="primary" @click="showModal = false">确认</BaseButton>
      </template>
    </BaseModal>

    <!-- ====== BaseToast 实例 ====== -->
    <BaseToast ref="toastRef" />

    <div class="safe-bottom"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSquareStore } from '@/stores/square';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseTextarea from '@/components/ui/BaseTextarea.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseTag from '@/components/ui/BaseTag.vue';
import BaseAvatar from '@/components/ui/BaseAvatar.vue';
import BaseDivider from '@/components/ui/BaseDivider.vue';
import BaseProgress from '@/components/ui/BaseProgress.vue';
import BaseSwitch from '@/components/ui/BaseSwitch.vue';
import BaseRadio from '@/components/ui/BaseRadio.vue';
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue';
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue';
import BaseEmpty from '@/components/ui/BaseEmpty.vue';
import BaseImage from '@/components/ui/BaseImage.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseToast from '@/components/ui/BaseToast.vue';

const square = useSquareStore();
const isLargeFont = ref(square.isLargeFont);

function toggleFont() {
  square.toggleFontMode();
  isLargeFont.value = square.isLargeFont;
}

/* ── 色彩数据 ── */
const brandColors = [
  { name: 'brand-50', value: '#EBF2FA' },
  { name: 'brand-200', value: '#A8C8EB' },
  { name: 'brand-400', value: '#4A90D9' },
  { name: 'brand-500', value: '#357ABD' },
  { name: 'brand-700', value: '#1F4A82' }
];

const semanticColors = [
  { name: 'red-50', value: '#FFEBEE' },
  { name: 'red-500', value: '#C62828' },
  { name: 'amber-50', value: '#FFF8E1' },
  { name: 'amber-500', value: '#F5A623' },
  { name: 'green-500', value: '#2E7D32' },
  { name: 'blue-500', value: '#1565C0' },
  { name: 'purple-500', value: '#7B1FA2' },
  { name: 'orange-500', value: '#E65100' }
];

const grayColors = [
  { name: 'gray-50', value: '#FAFAFA' },
  { name: 'gray-200', value: '#EEEEEE' },
  { name: 'gray-400', value: '#BDBDBD' },
  { name: 'gray-600', value: '#666666' },
  { name: 'gray-900', value: '#1A1A1A' }
];

/* ── 排版数据 ── */
const typoScales = [
  { label: '标题 XL', size: 'var(--text-3xl)', weight: 'var(--font-bold)', leading: 'var(--leading-normal)', cssVar: '--text-3xl' },
  { label: '标题 L', size: 'var(--text-2xl)', weight: 'var(--font-bold)', leading: 'var(--leading-normal)', cssVar: '--text-2xl' },
  { label: '正文 L', size: 'var(--text-lg)', weight: 'var(--font-normal)', leading: 'var(--leading-relaxed)', cssVar: '--text-lg' },
  { label: '正文 Base', size: 'var(--text-base)', weight: 'var(--font-normal)', leading: 'var(--leading-relaxed)', cssVar: '--text-base' },
  { label: '辅助 sm', size: 'var(--text-sm)', weight: 'var(--font-normal)', leading: 'var(--leading-normal)', cssVar: '--text-sm' },
  { label: '说明 xs', size: 'var(--text-xs)', weight: 'var(--font-normal)', leading: 'var(--leading-normal)', cssVar: '--text-xs' }
];

/* ── Input 状态 ── */
const inputDemo = ref('王阿姨');
const inputError = ref('13800001111');
const inputDisabled = ref('不可修改的内容');
const inputPrefixed = ref('99.00');
const textareaDemo = ref('');

/* ── Switch / Radio / Checkbox ── */
const switchOn = ref(true);
const switchOff = ref(false);
const radioValue = ref('chat');
const checkboxValues = ref(['policy']);

/* ── Tag ── */
const activeTags = ref(['求助', '闲置转让']);
const tagColors = ['primary', 'success', 'warning', 'danger', 'info', 'purple'];

function removeTag(tag) { activeTags.value = activeTags.value.filter(t => t !== tag); }
function addTag() { activeTags.value.push('新标签'); }

/* ── Progress ── */
const progressVal = ref(72);

/* ── Modal ── */
const showModal = ref(false);
const modalSize = ref('md');

/* ── Toast ── */
const toastRef = ref(null);
function fireToast(type) {
  const messages = { success: '操作成功！', error: '操作失败，请重试', warning: '请注意检查信息', info: '这是一条通知消息' };
  toastRef.value?.show(messages[type], type);
}
</script>

<style scoped>
.ui-demo-page {
  min-height: 100vh; background: var(--bg-page); padding-bottom: 80px;
}

.demo-header {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  height: var(--header-height); padding: 0 var(--space-4);
  background: var(--bg-card); border-bottom: 1px solid var(--border-light);
}
.demo-title { font-size: var(--text-xl); font-weight: var(--font-bold); margin: 0; }

.demo-body { max-width: var(--content-max); margin: 0 auto; padding: var(--space-4); }

/* Sections */
.demo-section { margin-bottom: var(--space-4); }
.section-title {
  font-size: var(--text-2xl); font-weight: var(--font-bold); margin: 0 0 var(--space-4);
  color: var(--text-primary);
}
.subsection-title {
  font-size: var(--text-lg); font-weight: var(--font-semibold);
  margin: 0 0 var(--space-3); color: var(--text-secondary);
}

/* Color grid */
.color-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: var(--space-3); }
.color-swatch { display: flex; flex-direction: column; gap: 2px; }
.color-block { width: 100%; height: 48px; border-radius: var(--radius-sm); }
.color-name { font-size: var(--text-sm); font-weight: var(--font-semibold); color: var(--text-primary); }
.color-hex { font-size: var(--text-xs); color: var(--text-muted); font-family: monospace; }

/* Typography */
.typo-list { display: flex; flex-direction: column; gap: var(--space-4); }
.typo-item {
  display: flex; align-items: baseline; gap: var(--space-4);
  padding: var(--space-3) 0; border-bottom: 1px solid var(--border-light);
}
.typo-label { font-size: var(--text-sm); color: var(--text-muted); min-width: 80px; flex-shrink: 0; }
.typo-spec { font-size: var(--text-xs); color: var(--text-muted); font-family: monospace; margin-left: auto; flex-shrink: 0; }

/* Demo rows */
.demo-row { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.demo-align-center { align-items: center; }
.demo-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
@media (max-width: 640px) { .demo-grid-2 { grid-template-columns: 1fr; } }

/* Avatar demo */
.avatar-demo-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.avatar-demo-item span { font-size: var(--text-xs); color: var(--text-muted); }

/* Image demo */
.image-demo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
.image-demo-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.image-demo-item span { font-size: var(--text-sm); color: var(--text-muted); }

/* Float toggle */
.float-toggle { position: fixed; right: 24px; bottom: 24px; z-index: 200; }

.safe-bottom { height: 60px; }
</style>
