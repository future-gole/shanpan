<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/counter'

const props = defineProps({
  show: { type: Boolean, default: false },
  tab: { type: String, default: 'login' }
})

const emit = defineEmits(['update:show', 'update:tab'])

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

function normalizeTab(value) {
  return value === 'register' ? 'register' : 'login'
}

const activeTab = ref(normalizeTab(props.tab))

watch(
  () => props.tab,
  (value) => {
    activeTab.value = normalizeTab(value)
  }
)

const loginForm = reactive({
  username: '',
  password: ''
})
const loginLoading = ref(false)
const loginError = ref('')
const canLoginSubmit = computed(
  () => loginForm.username.trim() !== '' && loginForm.password.trim() !== ''
)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})
const registerLoading = ref(false)
const registerError = ref('')

const usernameValid = computed(() => {
  const trimmed = registerForm.username.trim()
  return trimmed.length >= 3 && trimmed.length <= 20
})

const passwordValid = computed(() => {
  const length = registerForm.password.length
  return length >= 6 && length <= 20
})

const confirmValid = computed(
  () => registerForm.password !== '' && registerForm.password === registerForm.confirmPassword
)

const registerTips = computed(() => [
  { label: '用户名长度 3-20 字符', valid: usernameValid.value },
  { label: '密码长度 6-20 字符', valid: passwordValid.value },
  { label: '两次输入保持一致', valid: confirmValid.value }
])

watch(
  () => props.show,
  (value) => {
    if (value) {
      resetForms()
      loginError.value = ''
      registerError.value = ''
      activeTab.value = normalizeTab(props.tab)
    }
  }
)

watch(activeTab, (value) => {
  emit('update:tab', value)
  loginError.value = ''
  registerError.value = ''
})

function resetForms() {
  loginForm.username = ''
  loginForm.password = ''
  registerForm.username = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
}

function closeModal() {
  emit('update:show', false)
}

function switchTab(tab) {
  activeTab.value = normalizeTab(tab)
}

async function handleLoginSubmit() {
  if (!canLoginSubmit.value || loginLoading.value) return
  loginLoading.value = true
  loginError.value = ''
  try {
    await authStore.login({
      username: loginForm.username.trim(),
      password: loginForm.password
    })
    const redirectParam = route.query.redirect
    const redirectPath = Array.isArray(redirectParam) ? redirectParam[0] : redirectParam
    closeModal()
    await router.push(redirectPath || '/dashboard')
  } catch (error) {
    loginError.value = error?.response?.data?.message || '登录失败，请检查用户名或密码'
  } finally {
    loginLoading.value = false
  }
}

const canRegisterSubmit = computed(
  () => usernameValid.value && passwordValid.value && confirmValid.value
)

async function handleRegisterSubmit() {
  if (!canRegisterSubmit.value || registerLoading.value) return
  registerLoading.value = true
  registerError.value = ''
  try {
    await authStore.register({
      username: registerForm.username.trim(),
      password: registerForm.password
    })
    closeModal()
    await router.push('/dashboard')
  } catch (error) {
    registerError.value = error?.response?.data?.message || '注册失败，请稍后再试'
  } finally {
    registerLoading.value = false
  }
}
</script>

<template>
  <Transition name="auth-fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 w-full max-w-5xl">
        <div class="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
          <button
            type="button"
            class="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            @click="closeModal"
          >
            <i class="fa-solid fa-xmark text-2xl"></i>
          </button>

          <div class="hidden lg:block absolute top-6 left-6">
            <p class="inline-flex items-center px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-600 rounded-full">
              <i class="fa-solid fa-puzzle-piece mr-2"></i>
              童心世界 · 坚毅能量沙盘
            </p>
          </div>

          <div class="flex flex-col lg:flex-row">
            <div class="w-full lg:w-1/2 bg-orange-50/60 p-10 space-y-6 flex flex-col justify-center">
              <h2 class="text-3xl font-bold text-slate-900">欢迎来到沙盘成长营</h2>
              <p class="text-slate-600 leading-relaxed">
                拿起属于你的坚毅工具箱，点亮决心、专注与坚持。每天几分钟，和我们一起构建更强大的内心世界。
              </p>
              <ul class="space-y-3 text-slate-600 text-sm">
                <li class="flex items-center gap-3">
                  <i class="fa-solid fa-seedling text-emerald-500"></i>
                  <span>AI 行为分析，为你生成专属成长建议</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="fa-solid fa-users text-emerald-500"></i>
                  <span>亲子共创、团队协作，探索无限象征空间</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="fa-solid fa-award text-emerald-500"></i>
                  <span>坚持即可收集坚毅积分，解锁特别勋章</span>
                </li>
              </ul>
            </div>

            <div class="w-full lg:w-1/2 p-8 lg:p-10 bg-white">
              <div class="flex items-center justify-center mb-8 bg-slate-100 rounded-xl p-1">
                <button
                  type="button"
                  class="flex-1 px-6 py-2 text-sm font-medium rounded-lg transition"
                  :class="activeTab === 'login' ? 'bg-white shadow text-emerald-500' : 'text-slate-500'"
                  @click="switchTab('login')"
                >
                  登录账号
                </button>
                <button
                  type="button"
                  class="flex-1 px-6 py-2 text-sm font-medium rounded-lg transition"
                  :class="activeTab === 'register' ? 'bg-white shadow text-emerald-500' : 'text-slate-500'"
                  @click="switchTab('register')"
                >
                  注册账号
                </button>
              </div>

              <div v-if="activeTab === 'login'" class="flex flex-col lg:flex-row items-center gap-12">
                <div class="w-full max-w-md">
                  <form class="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6" @submit.prevent="handleLoginSubmit">
                    <div>
                      <h3 class="text-2xl font-semibold text-slate-900">账号登录</h3>
                      <p class="text-sm text-slate-500 mt-2">
                        还没有账户？
                        <button type="button" class="text-emerald-500 hover:underline" @click="switchTab('register')">立即注册</button>
                      </p>
                    </div>

                    <div class="space-y-2">
                      <label for="login-username" class="text-sm font-medium text-slate-700">用户名</label>
                      <input
                        id="login-username"
                        v-model="loginForm.username"
                        type="text"
                        placeholder="请输入用户名"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                        autocomplete="username"
                      />
                    </div>

                    <div class="space-y-2">
                      <label for="login-password" class="text-sm font-medium text-slate-700">密码</label>
                      <input
                        id="login-password"
                        v-model="loginForm.password"
                        type="password"
                        placeholder="请输入密码"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                        autocomplete="current-password"
                      />
                    </div>

                    <p v-if="loginError" class="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">
                      {{ loginError }}
                    </p>

                    <button
                      type="submit"
                      class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
                      :disabled="!canLoginSubmit || loginLoading"
                    >
                      <i v-if="loginLoading" class="fa-solid fa-spinner animate-spin"></i>
                      <span>{{ loginLoading ? '登录中...' : '登录' }}</span>
                    </button>
                  </form>
                </div>
              </div>

              <div v-else class="flex flex-col lg:flex-row items-center gap-12">
                <div class="w-full max-w-md">
                  <form class="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6" @submit.prevent="handleRegisterSubmit">
                    <div>
                      <h3 class="text-2xl font-semibold text-slate-900">创建你的沙盘账号</h3>
                      <p class="text-sm text-slate-500 mt-2">
                        已有账户？
                        <button type="button" class="text-emerald-500 hover:underline" @click="switchTab('login')">直接登录</button>
                      </p>
                    </div>

                    <div class="space-y-2">
                      <label for="register-username" class="text-sm font-medium text-slate-700">用户名</label>
                      <input
                        id="register-username"
                        v-model.trim="registerForm.username"
                        type="text"
                        placeholder="设置一个可爱的昵称"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                        autocomplete="off"
                      />
                    </div>

                    <div class="space-y-2">
                      <label for="register-password" class="text-sm font-medium text-slate-700">密码</label>
                      <input
                        id="register-password"
                        v-model="registerForm.password"
                        type="password"
                        placeholder="请输入密码"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                        autocomplete="new-password"
                      />
                    </div>

                    <div class="space-y-2">
                      <label for="register-confirm-password" class="text-sm font-medium text-slate-700">确认密码</label>
                      <input
                        id="register-confirm-password"
                        v-model="registerForm.confirmPassword"
                        type="password"
                        placeholder="再次输入密码"
                        class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                        autocomplete="new-password"
                      />
                    </div>

                    <ul class="space-y-2 text-sm">
                      <li
                        v-for="tip in registerTips"
                        :key="tip.label"
                        class="flex items-center gap-2"
                        :class="tip.valid ? 'text-emerald-500' : 'text-slate-400'"
                      >
                        <i :class="tip.valid ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'"></i>
                        <span>{{ tip.label }}</span>
                      </li>
                    </ul>

                    <p v-if="registerError" class="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">
                      {{ registerError }}
                    </p>

                    <button
                      type="submit"
                      class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
                      :disabled="!canRegisterSubmit || registerLoading"
                    >
                      <i v-if="registerLoading" class="fa-solid fa-spinner animate-spin"></i>
                      <span>{{ registerLoading ? '注册中...' : '注册并登录' }}</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.auth-fade-enter-active,
.auth-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.auth-fade-enter-from,
.auth-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
