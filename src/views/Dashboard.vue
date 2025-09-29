<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/counter'
import { checkinApi } from '@/api/checkin'

const router = useRouter()
const authStore = useAuthStore()

const { user } = storeToRefs(authStore)
const isAuthenticated = computed(() => !!user.value)

const form = reactive({
	dailyGoal: '',
	reflection: ''
})

const history = ref([])
const submitting = ref(false)
const loadingHistory = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const today = new Date()
const todayLabel = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(today)

const streakDays = computed(() => history.value.filter((item) => item.points > 0).length)
const todayCheckIn = computed(() =>
	history.value.find((item) => item.checkInDate === formatDateKey(today))
)

const canSubmit = computed(() => form.dailyGoal.trim() !== '' && form.reflection.trim() !== '')

function formatDateKey(date) {
	const year = date.getFullYear()
	const month = `${date.getMonth() + 1}`.padStart(2, '0')
	const day = `${date.getDate()}`.padStart(2, '0')
	return `${year}-${month}-${day}`
}

function formatDisplayDate(dateString) {
	if (!dateString) return '—'
	const date = new Date(dateString)
	return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(date)
}

async function loadHistory() {
	if (!user.value?.userId) return
	loadingHistory.value = true
	errorMessage.value = ''
	try {
		const response = await checkinApi.list(user.value.userId)
		history.value = response.data?.map((item) => ({
			...item,
			checkInDate: item.checkInDate
		})) ?? []
	} catch (error) {
		errorMessage.value = error?.response?.data?.message || '加载打卡记录失败，请稍后再试'
	} finally {
		loadingHistory.value = false
	}
}

async function handleSubmit() {
	if (!canSubmit.value || submitting.value || !user.value?.userId) return
	submitting.value = true
	successMessage.value = ''
	errorMessage.value = ''
	try {
		const payload = {
			userId: user.value.userId,
			dailyGoal: form.dailyGoal.trim(),
			reflection: form.reflection.trim()
		}
		const response = await checkinApi.checkin(payload)
		successMessage.value = '打卡成功，积分已更新！'
		form.dailyGoal = ''
		form.reflection = ''
		await loadHistory()
		authStore.setUser({
			userId: response.data.userId,
			username: user.value.username,
			totalPoints: response.data.totalPoints,
			lastCheckInAt: response.data.lastCheckInAt
		})
	} catch (error) {
		errorMessage.value = error?.response?.data?.message || '打卡失败，请稍后重试'
	} finally {
		submitting.value = false
	}
}

onMounted(() => {
	if (!isAuthenticated.value) {
		router.replace({ path: '/', query: { auth: 'login', redirect: '/dashboard' } })
		return
	}
	loadHistory()
})
</script>

<template>
	<div class="space-y-10">
		<section class="grid gap-6 md:grid-cols-3">
			<div class="md:col-span-2 bg-white rounded-3xl shadow-sm p-8">
						<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div>
								<p class="text-sm text-slate-500">
									今日 · {{ todayLabel }}
									<span v-if="todayCheckIn" class="ml-2 inline-flex items-center gap-1 text-emerald-500">
										<i class="fa-solid fa-circle-check"></i>
										已打卡
									</span>
								</p>
						<h2 class="text-2xl font-semibold text-slate-900 mt-2">你好，{{ user?.username }}！</h2>
						<p class="text-slate-500 mt-2">写下今日目标与感想，继续为坚毅值加油。</p>
					</div>
					<div class="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-2xl text-center">
						<p class="text-sm">累计积分</p>
						<p class="text-3xl font-semibold">{{ user?.totalPoints ?? 0 }}</p>
					</div>
				</div>

				<form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
					<div>
						<label class="flex items-center gap-2 text-sm font-medium text-slate-600">
							<i class="fa-solid fa-flag text-emerald-500"></i>
							今日目标
						</label>
						<textarea
							v-model="form.dailyGoal"
							rows="2"
							placeholder="今天最想完成的事情是什么？"
							class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
						/>
					</div>

					<div>
						<label class="flex items-center gap-2 text-sm font-medium text-slate-600">
							<i class="fa-solid fa-pen-to-square text-emerald-500"></i>
							今日感想
						</label>
						<textarea
							v-model="form.reflection"
							rows="5"
							placeholder="记录一下今天的心情、收获或灵感。"
							class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
						/>
					</div>

					<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div class="text-sm text-slate-500 flex items-center gap-2">
							<i class="fa-solid fa-circle-info text-emerald-500"></i>
							每次打卡将获得 <span class="font-medium text-emerald-600">5</span> 积分
						</div>
						<button
							type="submit"
							class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-white font-medium hover:bg-emerald-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
							:disabled="!canSubmit || submitting"
						>
							<i v-if="submitting" class="fa-solid fa-spinner animate-spin"></i>
							<span>{{ submitting ? '提交中...' : todayCheckIn ? '更新今日打卡' : '提交打卡' }}</span>
						</button>
					</div>
				</form>

				<p v-if="successMessage" class="mt-4 text-sm text-emerald-600 bg-emerald-50 px-4 py-3 rounded-2xl">
					{{ successMessage }}
				</p>
				<p v-if="errorMessage" class="mt-4 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-2xl">
					{{ errorMessage }}
				</p>
			</div>

			<div class="bg-white rounded-3xl shadow-sm p-8 space-y-6">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-semibold text-slate-900">坚持小档案</h3>
					<span class="text-emerald-500 text-sm font-medium">加油！</span>
				</div>
				<div class="space-y-4">
								<div class="flex items-center gap-4">
						<span class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-500 flex items-center justify-center text-xl">
							<i class="fa-solid fa-calendar-check"></i>
						</span>
						<div>
										<p class="text-sm text-slate-500">累计获积分天数</p>
										<p class="text-xl font-semibold text-slate-900">{{ streakDays }}</p>
						</div>
					</div>

					<div class="flex items-center gap-4">
						<span class="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center text-xl">
							<i class="fa-solid fa-fire"></i>
						</span>
						<div>
							<p class="text-sm text-slate-500">累计积分</p>
							<p class="text-xl font-semibold text-slate-900">{{ user?.totalPoints ?? 0 }}</p>
						</div>
					</div>

					<div class="flex items-center gap-4">
						<span class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-500 flex items-center justify-center text-xl">
							<i class="fa-solid fa-moon"></i>
						</span>
						<div>
							<p class="text-sm text-slate-500">最近打卡时间</p>
							<p class="text-xl font-semibold text-slate-900">{{ formatDisplayDate(user?.lastCheckInAt) }}</p>
						</div>
					</div>
				</div>

				<div class="border-t border-slate-100 pt-4">
					<p class="text-xs text-slate-400 leading-relaxed">
						坚持记录是通向成长的秘密捷径。每天写下目标与感想，未来的你会感谢现在的坚持。
					</p>
				</div>
			</div>
		</section>

		<section class="bg-white rounded-3xl shadow-sm p-8">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<h3 class="text-xl font-semibold text-slate-900">我的打卡记录</h3>
				<button
					type="button"
					class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-500"
					@click="loadHistory"
				>
					<i class="fa-solid fa-rotate-right"></i>
					刷新
				</button>
			</div>

			<div v-if="loadingHistory" class="py-12 text-center text-slate-500">
				<i class="fa-solid fa-spinner animate-spin text-2xl"></i>
				<p class="mt-3">加载中，请稍候...</p>
			</div>

			<div v-else>
				<div v-if="history.length" class="mt-6 space-y-4">
					<article
						v-for="item in history"
						:key="item.checkInId"
						class="rounded-2xl border border-slate-100 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
					>
						<div class="flex-1">
							<p class="text-sm text-slate-400">{{ formatDisplayDate(item.checkInDate) }}</p>
							<h4 class="text-lg font-semibold text-slate-900 mt-2">{{ item.dailyGoal }}</h4>
							<p class="text-sm text-slate-600 mt-2 leading-relaxed">{{ item.reflection }}</p>
						</div>
						<div class="flex-shrink-0 text-right">
							<p class="text-sm text-slate-500">当日积分</p>
							<p class="text-2xl font-semibold text-emerald-500">+{{ item.points }}</p>
						</div>
					</article>
				</div>
				<div v-else class="py-12 text-center text-slate-500">
					<i class="fa-regular fa-face-smile text-3xl text-emerald-400"></i>
					<p class="mt-3 font-medium">还没有打卡记录，快来写下你的第一篇故事吧！</p>
				</div>
			</div>
		</section>
	</div>
</template>
