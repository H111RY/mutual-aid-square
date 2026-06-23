<template>
  <div class="nickname-page">
    <div class="nickname-card">
      <div class="nickname-logo">
        <h1 class="nickname-title">完善信息</h1>
        <p class="nickname-subtitle">设置您的昵称，加入邻里互助社区</p>
      </div>

      <form class="nickname-form" @submit.prevent="submit">
        <BaseInput
          v-model="nickname"
          label="昵称"
          placeholder="请输入您的昵称"
          :disabled="isSubmitting"
          maxlength="20"
        />

        <BaseInput
          v-model="building"
          label="楼栋号（选填）"
          placeholder="例如：1号楼"
          :disabled="isSubmitting"
          maxlength="20"
        />

        <p v-if="error" class="nickname-error">{{ error }}</p>

        <BaseButton
          variant="primary"
          size="lg"
          block
          :loading="isSubmitting"
          :disabled="!canSubmit"
          @click="submit"
        >
          加入社区
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { updateProfile } from '@/api/auth'
import { useAppStore } from '@/stores/app'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const app = useAppStore()

const nickname = ref('')
const building = ref('')
const isSubmitting = ref(false)
const error = ref('')

const canSubmit = computed(() => nickname.value.trim().length > 0 && !isSubmitting.value)

async function submit() {
  if (!canSubmit.value) return
  error.value = ''
  isSubmitting.value = true
  try {
    await updateProfile({
      nickname: nickname.value.trim(),
      building: building.value.trim()
    })
    app.setUser({
      nickname: nickname.value.trim(),
      building: building.value.trim()
    })
    const redirect = route.query.redirect || '/square'
    router.replace(redirect)
  } catch (e) {
    error.value = e.message || '保存失败，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.nickname-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  padding: var(--space-4);
}

.nickname-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-8) var(--space-6);
  box-shadow: var(--shadow-lg);
}

.nickname-logo {
  text-align: center;
  margin-bottom: var(--space-8);
}

.nickname-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
}

.nickname-subtitle {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: var(--space-2) 0 0;
}

.nickname-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.nickname-error {
  font-size: var(--text-sm);
  color: var(--red-500);
  text-align: center;
  margin: 0;
}
</style>
