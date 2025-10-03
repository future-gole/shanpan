<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/counter'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
	username: '',
	password: '',
	confirmPassword: ''
})

const loading = ref(false)
const errorMessage = ref('')
const isAuthenticated = computed(() => authStore.isAuthenticated)

const canSubmit = computed(() => {
	const usernameOk = form.username.trim().length >= 3
	const passwordOk = form.password.length >= 6
	const confirmOk = form.password === form.confirmPassword
	return usernameOk && passwordOk && confirmOk
})

async function handleSubmit() {
	if (!canSubmit.value || loading.value) return
	loading.value = true
	errorMessage.value = ''
	try {
		await authStore.register({
			username: form.username.trim(),
			password: form.password
		})
		router.push('/calendar')
	} catch (error) {
		const message = error?.response?.data?.message || '注册失败，请稍后再试'
		errorMessage.value = message
	} finally {
		loading.value = false
	}
}

const passwordTips = [
	{ label: '用户名长度 3-20 字符', valid: computed(() => form.username.trim().length >= 3 && form.username.trim().length <= 20) },
	{ label: '密码长度 6-20 字符', valid: computed(() => form.password.length >= 6 && form.password.length <= 20) },
	{ label: '两次输入保持一致', valid: computed(() => form.password !== '' && form.password === form.confirmPassword) }
]

onMounted(() => {
	if (isAuthenticated.value) {
		router.replace('/calendar')
	}
})
</script>

<template>
	<div class="flex flex-col lg:flex-row items-center gap-12">
		<div class="w-full lg:w-1/2 max-w-md order-2 lg:order-1">
			<form class="bg-white rounded-3xl shadow-xl p-8 space-y-6" @submit.prevent="handleSubmit">
				<div>
					<h2 class="text-2xl font-semibold text-slate-900">创建你的沙盘账号</h2>
					<p class="text-sm text-slate-500 mt-2">
						已有账户？
						<router-link to="/login" class="text-emerald-500 hover:underline">直接登录</router-link>
					</p>
				</div>

				<div class="space-y-2">
					<label for="username" class="text-sm font-medium text-slate-700">用户名</label>
					<input
						id="username"
						v-model.trim="form.username"
						type="text"
						placeholder="设置一个可爱的昵称"
						class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
						autocomplete="off"
					/>
				</div>

				<div class="space-y-2">
					<label for="password" class="text-sm font-medium text-slate-700">密码</label>
					<input
						id="password"
						v-model="form.password"
						type="password"
						placeholder="请输入密码"
						class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
						autocomplete="new-password"
					/>
				</div>

				<div class="space-y-2">
					<label for="confirm-password" class="text-sm font-medium text-slate-700">确认密码</label>
					<input
						id="confirm-password"
						v-model="form.confirmPassword"
						type="password"
						placeholder="再次输入密码"
						class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
						autocomplete="new-password"
					/>
				</div>

				<ul class="space-y-2 text-sm">
								<li
									v-for="tip in passwordTips"
									:key="tip.label"
									class="flex items-center gap-2"
									:class="tip.valid ? 'text-emerald-500' : 'text-slate-400'"
								>
									<i :class="tip.valid ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'" />
						<span>{{ tip.label }}</span>
					</li>
				</ul>

				<p v-if="errorMessage" class="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">
					{{ errorMessage }}
				</p>

				<button
					type="submit"
					class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
					:disabled="!canSubmit || loading"
				>
					<i v-if="loading" class="fa-solid fa-spinner animate-spin"></i>
					<span>{{ loading ? '注册中...' : '注册并登录' }}</span>
				</button>
			</form>
		</div>

		<!-- <div class="lg:w-1/2 space-y-6 order-1 lg:order-2">
			<p class="inline-flex items-center px-4 py-2 text-sm font-semibold bg-emerald-100 text-emerald-600 rounded-full">
				<i class="fa-solid fa-sparkles mr-2"></i>
				欢迎加入沙盘成长营
			</p>
			<h1 class="text-4xl font-bold text-slate-900 leading-tight">记录你的第一份打卡故事</h1>
			<p class="text-slate-500 text-lg leading-relaxed">
				注册即可免费体验每日打卡，记录你的目标和心情，积分将伴随你的坚持不断成长。
			</p>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="bg-white rounded-2xl px-6 py-5 shadow-sm flex items-center space-x-4">
					<div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-500 flex items-center justify-center text-xl">
						<i class="fa-solid fa-feather"></i>
					</div>
					<div>
						<p class="font-semibold text-slate-800">每日目标</p>
						<p class="text-xs text-slate-500 mt-1">设定当天最想完成的小事</p>
					</div>
				</div>
				<div class="bg-white rounded-2xl px-6 py-5 shadow-sm flex items-center space-x-4">
					<div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-500 flex items-center justify-center text-xl">
						<i class="fa-solid fa-heart"></i>
					</div>
					<div>
						<p class="font-semibold text-slate-800">感想记录</p>
						<p class="text-xs text-slate-500 mt-1">留下当天的心情与发现</p>
					</div>
				</div>
			</div>
		</div> -->
	</div>
</template>
