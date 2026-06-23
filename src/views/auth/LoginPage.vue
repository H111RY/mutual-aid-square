<template>
  <div class="login-page" :class="{ 'large-font': squareStore.isLargeFont }">
    <div class="login-card">
      <div class="login-logo">
        <div class="login-icon">
          <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
            <rect x="8" y="12" width="48" height="40" rx="6" stroke="var(--brand-400)" stroke-width="4"/>
            <rect x="8" y="12" width="48" height="16" rx="6" stroke="var(--brand-400)" stroke-width="4"/>
            <circle cx="22" cy="20" r="3" fill="var(--amber-400)"/>
            <rect x="16" y="36" width="32" height="8" rx="2" fill="var(--brand-200)"/>
          </svg>
        </div>
        <h1 class="login-title">邻里帮</h1>
        <p class="login-subtitle">社区互助，温暖邻里</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="phone-row">
          <span class="phone-prefix">+86</span>
          <input
            v-model="phone"
            class="phone-input"
            type="tel"
            placeholder="请输入手机号码"
            :disabled="isLoggingIn"
            maxlength="11"
            @input="onPhoneInput"
          />
        </div>

        <div class="code-row">
          <input
            v-model="code"
            class="code-input"
            type="text"
            inputmode="numeric"
            placeholder="请输入验证码"
            :disabled="isLoggingIn"
            maxlength="6"
            autocomplete="one-time-code"
          />
          <button
            type="button"
            class="send-btn"
            :disabled="!canSend || countdown > 0"
            @click="sendCode"
          >{{ countdown > 0 ? countdown + 's' : '发送验证码' }}</button>
        </div>

        <p v-if="error" class="login-error">{{ error }}</p>

        <BaseButton
          variant="primary"
          size="lg"
          block
          :loading="isLoggingIn"
          :disabled="!canLogin"
          @click="handleLogin"
        >登录</BaseButton>
      </form>

      <div class="login-footer">
        <p class="login-tip">首次使用将自动注册账号</p>
        <p class="login-tip">登录即表示同意《用户协议》和《隐私政策》</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useSquareStore } from '@/stores/square'
import { sendSmsCode } from '@/api/auth'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const app = useAppStore()
const squareStore = useSquareStore()

const phone = ref('')
const code = ref('')
const isLoggingIn = ref(false)
const error = ref('')
const countdown = ref(0)
let countdownTimer = null

const canSend = computed(() => phone.value.length === 11 && !isLoggingIn.value)

const canLogin = computed(
  () => phone.value.length === 11 && code.value.length === 6 && !isLoggingIn.value
)

function onPhoneInput(e) {
  phone.value = phone.value.replace(/\D/g, '')
}

async function sendCode() {
  if (!canSend.value) return
  error.value = ''
  try {
    await sendSmsCode(phone.value)
    app.showToast('验证码已发送（测试环境：123456）', 'info')
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    }, 1000)
  } catch (e) {
    error.value = e.message || '发送验证码失败，请稍后重试'
  }
}

async function handleLogin() {
  if (!canLogin.value) return
  error.value = ''
  isLoggingIn.value = true
  try {
    const res = await app.login(phone.value, code.value)
    const redirect = route.query.redirect || '/square'
    if (res.isNewUser) {
      router.replace({ name: 'NicknameSetup', query: { redirect } })
    } else {
      router.replace(redirect)
    }
  } catch (e) {
    error.value = e.message || '登录失败，请稍后重试'
  } finally {
    isLoggingIn.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  padding: var(--space-4);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-8) var(--space-6);
  box-shadow: var(--shadow-lg);
}

.login-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--space-8);
}

.login-icon {
  width: var(--space-12);
  height: var(--space-12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-3);
}

.login-icon svg {
  width: 100%;
  height: 100%;
}

.login-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
  letter-spacing: 2px;
}

.login-subtitle {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: var(--space-1) 0 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.phone-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.phone-prefix {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-page);
  border: 1px solid var(--border-normal);
  border-radius: var(--radius-md);
  white-space: nowrap;
}

.phone-input {
  flex: 1;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-base);
  border: 1px solid var(--border-normal);
  border-radius: var(--radius-md);
  min-height: var(--tap-min);
  outline: none;
  font-family: inherit;
}
.phone-input:focus {
  border-color: var(--brand-400);
}

.code-row {
  display: flex;
  gap: var(--space-2);
}

.code-input {
  flex: 1;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-base);
  border: 1px solid var(--border-normal);
  border-radius: var(--radius-md);
  min-height: var(--tap-min);
  outline: none;
  font-family: inherit;
  letter-spacing: 4px;
}
.code-input:focus {
  border-color: var(--brand-400);
}

.send-btn {
  min-width: 110px;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border: 1px solid var(--brand-400);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--brand-500);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.send-btn:disabled {
  border-color: var(--border-light);
  color: var(--text-muted);
  cursor: not-allowed;
}

.login-error {
  font-size: var(--text-sm);
  color: var(--red-500);
  text-align: center;
  margin: 0;
}

.login-footer {
  text-align: center;
  margin-top: var(--space-6);
}

.login-tip {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin: var(--space-1) 0 0;
}

@media (max-width: 480px) {
  .login-card {
    padding: var(--space-6) var(--space-4);
  }
}
</style>
