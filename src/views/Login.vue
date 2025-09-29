<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/counter'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
	username: '',
	password: ''
})

const loading = ref(false)
const errorMessage = ref('')
const isAuthenticated = computed(() => authStore.isAuthenticated)
const canSubmit = computed(() => form.username.trim() !== '' && form.password.trim() !== '')

async function handleSubmit() {
	if (!canSubmit.value || loading.value) return
	loading.value = true
	errorMessage.value = ''
	try {
			await authStore.login({
			username: form.username.trim(),
			password: form.password
		})
			const redirectPath = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
			router.push(redirectPath || '/dashboard')
	} catch (error) {
		const message = error?.response?.data?.message || '登录失败，请检查用户名或密码'
		errorMessage.value = message
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	if (isAuthenticated.value) {
		router.replace('/dashboard')
	}
})
</script>

<template>
	<div class="flex flex-col lg:flex-row items-center gap-12">
		<!-- <div class="lg:w-1/2 space-y-6">
			<p class="inline-flex items-center px-4 py-2 text-sm font-semibold bg-emerald-100 text-emerald-600 rounded-full">
				<i class="fa-solid fa-key mr-2"></i>
				欢迎回来，继续你的沙盘冒险
			</p>
			<h1 class="text-4xl font-bold text-slate-900 leading-tight">登录到沙盘成长营</h1>
			<p class="text-slate-500 text-lg leading-relaxed">
				记录每日目标、分享感想，收获坚持带来的惊喜积分。
			</p>
			<div class="grid grid-cols-2 gap-4 text-sm text-slate-600">
				<div class="bg-white rounded-2xl px-4 py-5 shadow-sm">
					<p class="text-3xl font-semibold text-emerald-500">5+</p>
					<p class="mt-2">每日坚持，积分自动到账</p>
				</div>
				<div class="bg-white rounded-2xl px-4 py-5 shadow-sm">
					<p class="text-3xl font-semibold text-emerald-500">100%</p>
					<p class="mt-2">无压力记录，陪你找到节奏</p>
				</div>
			</div>
		</div> -->

		<div class="w-full lg:w-1/2 max-w-md">
			<form class="bg-white rounded-3xl shadow-xl p-8 space-y-6" @submit.prevent="handleSubmit">
				<div>
					<h2 class="text-2xl font-semibold text-slate-900">账号登录</h2>
					<p class="text-sm text-slate-500 mt-2">
						还没有账户？
						<router-link to="/register" class="text-emerald-500 hover:underline">立即注册</router-link>
					</p>
				</div>

				<div class="space-y-2">
					<label for="username" class="text-sm font-medium text-slate-700">用户名</label>
					<input
						id="username"
						v-model="form.username"
						type="text"
						placeholder="请输入用户名"
						class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
						autocomplete="username"
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
						autocomplete="current-password"
					/>
				</div>

				<p v-if="errorMessage" class="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">
					{{ errorMessage }}
				</p>

				<button
					type="submit"
					class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
					:disabled="!canSubmit || loading"
				>
					<i v-if="loading" class="fa-solid fa-spinner animate-spin"></i>
					<span>{{ loading ? '登录中...' : '登录' }}</span>
				</button>
			</form>
		</div>
	</div>
</template>
