<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/counter'
import { checkinApi } from '@/api/checkin'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const isLoading = ref(false)
const errorMessage = ref('')
const checkIns = ref([])

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())
const selectedDate = ref(formatISODate(today))

const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const calendarDays = computed(() => {
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1)
  const startOffset = firstDayOfMonth.getDay()
  const startDate = new Date(currentYear.value, currentMonth.value, 1 - startOffset)
  const days = []
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const iso = formatISODate(date)
    days.push({
      iso,
      label: date.getDate(),
      inCurrentMonth: date.getMonth() === currentMonth.value,
      isToday: iso === formatISODate(today),
      hasCheckIn: Boolean(checkInsMap.value[iso]),
    })
  }
  return days
})

const checkInsMap = computed(() => {
  return checkIns.value.reduce((acc, item) => {
    acc[item.checkInDate] = item
    return acc
  }, {})
})

const selectedCheckIn = computed(() => checkInsMap.value[selectedDate.value] || null)

const monthlyCheckIns = computed(() => {
  return checkIns.value.filter((item) => {
    const date = parseISODate(item.checkInDate)
    return (
      date.getFullYear() === currentYear.value &&
      date.getMonth() === currentMonth.value
    )
  })
})

const monthProgress = computed(() => {
  const totalDaysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  if (totalDaysInMonth === 0) return 0

  const now = new Date()
  const isCurrentMonth =
    currentYear.value === now.getFullYear() && currentMonth.value === now.getMonth()
  const progressBase = isCurrentMonth ? Math.min(now.getDate(), totalDaysInMonth) : totalDaysInMonth
  if (progressBase === 0) return 0
  const completedDays = monthlyCheckIns.value.length
  return Math.min(100, Math.round((completedDays / progressBase) * 100))
})

const consecutiveDays = computed(() => {
  const sortedDates = checkIns.value
    .map((item) => parseISODate(item.checkInDate))
    .sort((a, b) => b.getTime() - a.getTime())

  let streak = 0
  let current = new Date(selectedDate.value + 'T00:00:00')

  for (let i = 0; i < sortedDates.length; i += 1) {
    const date = sortedDates[i]
    if (isSameDay(date, current)) {
      streak += 1
      current.setDate(current.getDate() - 1)
    } else if (date < current) {
      break
    }
  }

  return streak
})

const selectedDateInfo = computed(() => {
  const date = parseISODate(selectedDate.value)
  return {
    iso: selectedDate.value,
    label: `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`,
    weekday: weekdayLabels[date.getDay()],
  }
})

const monthLabel = computed(() => {
  return `${currentYear.value}年${String(currentMonth.value + 1).padStart(2, '0')}月`
})

async function fetchCheckIns() {
  if (!user.value?.userId) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    const { data } = await checkinApi.list(user.value.userId)
    checkIns.value = Array.isArray(data)
      ? data.map((item) => ({
          ...item,
          checkInDate: normalizeDateString(item.checkInDate),
        }))
      : []
  } catch (error) {
    const message = error?.response?.data?.message || '无法加载打卡数据，请稍后重试'
    errorMessage.value = message
  } finally {
    isLoading.value = false
  }
}

function handleSelectDay(day) {
  if (!day?.iso) return
  selectedDate.value = day.iso
  const dateObj = parseISODate(day.iso)
  currentYear.value = dateObj.getFullYear()
  currentMonth.value = dateObj.getMonth()
}

function goToPreviousMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
}

function goToNextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
}

function normalizeDateString(value) {
  if (!value) return value
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : formatISODate(date)
}

function formatISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseISODate(isoString) {
  const [year, month, day] = isoString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

watch(
  () => user.value?.userId,
  (newUserId) => {
    if (newUserId) {
      fetchCheckIns()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (user.value?.userId) {
    fetchCheckIns()
  }
})
</script>

<template>
  <div class="bg-slate-50 min-h-screen py-8">
    <div class="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 md:px-6">
      <aside class="lg:col-span-3 hidden lg:flex flex-col justify-start pt-4">
        <div class="sticky top-24 space-y-10">
          <div>
            <p class="text-6xl font-bold text-slate-800 tracking-tight">{{ selectedDateInfo.label }}</p>
            <p class="text-2xl font-medium text-slate-500 mt-1">{{ selectedDateInfo.weekday }}</p>
            <div class="border-l-4 border-emerald-400 pl-4 mt-10 text-slate-600 leading-relaxed text-sm">
              <p v-if="selectedCheckIn?.reflection">
                {{ selectedCheckIn.reflection }}
              </p>
              <p v-else>
                以决心开启,用专注涤入,靠坚持抵达,铸就你的坚毅之路。
              </p>
            </div>
          </div>
          <div class="space-y-4 text-sm text-slate-500">
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-500">
                <i class="fas fa-fire"></i>
              </span>
              <div>
                <p class="font-semibold text-slate-700">连签天数</p>
                <p>{{ consecutiveDays }} 天</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-500">
                <i class="fas fa-award"></i>
              </span>
              <div>
                <p class="font-semibold text-slate-700">总积分</p>
                <p>{{ selectedCheckIn?.totalPoints ?? user?.totalPoints ?? 0 }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-500">
                <i class="fas fa-clock"></i>
              </span>
              <div>
                <p class="font-semibold text-slate-700">上次打卡</p>
                <p>{{ user?.lastCheckInAt ? user.lastCheckInAt.replace('T', ' ') : '等待解锁' }}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

<section class="lg:col-span-5 space-y-8">
  <div class="rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-lg px-6 py-6 flex flex-col items-start gap-2">
    <div class="flex items-center gap-3 mb-2 w-full">
      <img src="@/assets/boy.png" alt="avatar" class="w-9 h-9 rounded-full border-2 border-white shadow" />
      <div class="ml-2">
        <h2 class="font-bold text-lg text-emerald-700">每日鼓励</h2>
        <p class="text-sm text-emerald-600">坚毅，从"心"开始</p>
      </div>
    </div>
    
    <!-- 白色框只包裹进度条部分 -->
    <div class="bg-white rounded-3xl p-4 shadow-lg w-full">
      <div class="font-bold text-emerald-700 text-base w-full mb-1 text-center">{{ monthProgress }}%</div>
      <div class="flex items-center gap-2 w-full">
        <span class="font-semibold text-emerald-700 text-base">心灵小树</span>
        <progress :value="monthProgress" max="100" class="flex-1 h-3 rounded-full bg-emerald-100"></progress>
        <i class="fas fa-tree text-2xl text-emerald-600 ml-1"></i>
      </div>
      <div class="text-xs text-emerald-500 mt-1 w-full text-center">成长值</div>
    </div>
  </div>


        <div class="rounded-3xl bg-white shadow-lg p-6">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-lg text-slate-800">我的沙盘日记</h3>
            <div class="flex items-center gap-4 text-sm text-slate-500">
              <button
                type="button"
                class="p-2 rounded-full hover:bg-slate-100"
                @click="goToPreviousMonth"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <span>{{ monthLabel }}</span>
              <button
                type="button"
                class="p-2 rounded-full hover:bg-slate-100"
                @click="goToNextMonth"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div v-if="errorMessage" class="mt-4 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-2xl">
            {{ errorMessage }}
          </div>

          <div v-else class="mt-6">
            <div class="grid grid-cols-7 text-center text-slate-500 text-xs uppercase tracking-wide">
              <span v-for="label in ['日', '一', '二', '三', '四', '五', '六']" :key="label">{{ label }}</span>
            </div>
            <div class="mt-2 grid grid-cols-7 text-center gap-y-2">
              <button
                v-for="day in calendarDays"
                :key="day.iso"
                type="button"
                class="mx-auto w-10 h-10 flex items-center justify-center rounded-full transition"
                :class="[
                  day.iso === selectedDate ? 'bg-emerald-500 text-white shadow-lg' : '',
                  day.inCurrentMonth ? 'text-slate-700' : 'text-slate-300',
                  day.isToday && day.iso !== selectedDate ? 'ring-2 ring-emerald-200' : '',
                  day.hasCheckIn && day.iso !== selectedDate ? 'border border-emerald-200' : ''
                ]"
                @click="handleSelectDay(day)"
                :disabled="isLoading"
              >
                <span>{{ day.label }}</span>
              </button>
            </div>
          </div>

          <div v-if="isLoading" class="mt-4 text-center text-sm text-slate-500">
            正在载入你的冒险记录...
          </div>
        </div>

        <div class="rounded-3xl bg-white shadow-lg p-6">
          <div class="bg-slate-100 rounded-full p-1 flex justify-around mb-6 text-sm">
            <button class="flex-1 text-center py-2 rounded-full bg-white shadow text-emerald-500 font-semibold">
              <i class="fas fa-star mr-2"></i>成就馆
            </button>
            <button class="flex-1 text-center py-2 rounded-full text-slate-500">
              <i class="far fa-calendar-check mr-2"></i>打卡
            </button>
            <button class="flex-1 text-center py-2 rounded-full text-slate-500">
              <i class="fas fa-crown mr-2"></i>成就
            </button>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="flex flex-col items-center justify-center bg-yellow-100 text-yellow-800 p-4 rounded-2xl">
              <i class="fas fa-star text-3xl"></i>
              <span class="font-semibold mt-2 text-sm">坚毅新手</span>
            </div>
            <div class="flex flex-col items-center justify-center bg-sky-100 text-sky-800 p-4 rounded-2xl">
              <i class="fas fa-glasses text-3xl"></i>
              <span class="font-semibold mt-2 text-sm">坚毅行者</span>
            </div>
            <div class="flex flex-col items-center justify-center bg-rose-100 text-rose-800 p-4 rounded-2xl">
              <i class="fas fa-eye text-3xl"></i>
              <span class="font-semibold mt-2 text-sm">>坚毅之星</span>
            </div>
            <div class="flex flex-col items-center justify-center bg-indigo-100 text-indigo-800 p-4 rounded-2xl">
              <i class="fas fa-crown text-3xl"></i>
              <span class="font-semibold mt-2 text-sm">坚毅专家</span>
            </div>
          </div>
        </div>
      </section>

      <aside class="lg:col-span-4">
        <div class="sticky top-24 space-y-8">
          <div class="rounded-3xl bg-emerald-50/70 backdrop-blur p-6 shadow-lg">
            <div class="flex justify-between items-center">
              <h3 class="font-bold text-lg text-slate-800">今日任务</h3>
              <button class="text-slate-400 hover:text-slate-600 transition" type="button">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="mt-6 space-y-4">
              <div>
                <h4 class="font-semibold text-sm text-slate-700 mb-2">完成任务</h4>
                <div class="bg-white/80 p-4 rounded-2xl flex items-center space-x-3">
                  <span class="text-emerald-500 text-xl">
                    <i :class="selectedCheckIn ? 'fas fa-check-circle' : 'far fa-circle'" />
                  </span>
                  <div>
                    <p class="font-semibold text-slate-800">{{ selectedCheckIn ? '今日打卡已完成' : '等待你的坚持' }}</p>
                    <p class="text-xs text-slate-500">
                      {{ selectedCheckIn?.dailyGoal || '设定一个今日的小目标，让冒险出发。' }}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="font-semibold text-sm text-slate-700 mb-2">心情记录</h4>
                <div class="bg-white/80 p-4 rounded-2xl text-sm text-slate-600">
                  <p v-if="selectedCheckIn?.reflection">{{ selectedCheckIn.reflection }}</p>
                  <p v-else>用几句话记录现在的自己吧，未来会感谢今天的你。</p>
                </div>
              </div>
            </div>

            <div class="mt-8 border-t border-white/60 pt-6 flex justify-around items-center text-slate-600">
              <button class="flex flex-col items-center hover:text-emerald-500 transition" type="button">
                <i class="far fa-heart text-2xl"></i>
                <span class="text-xs mt-1">去放松</span>
              </button>
              <button class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100 transition" type="button">
                <i class="fas fa-plus text-xl text-emerald-500"></i>
              </button>
              <button class="flex flex-col items-center hover:text-emerald-500 transition" type="button">
                <i class="far fa-comment-dots text-2xl"></i>
                <span class="text-xs mt-1">聊一聊</span>
              </button>
            </div>
          </div>

          <div class="rounded-3xl bg-white shadow-lg p-6 space-y-4">
            <h3 class="font-semibold text-slate-800">精选感受</h3>
            <ul class="space-y-3 text-sm text-slate-600">
              <li v-for="item in monthlyCheckIns" :key="item.checkInId" class="bg-slate-50 rounded-2xl p-3">
                <p class="text-xs text-slate-400">{{ item.checkInDate }}</p>
                <p class="font-medium text-slate-700 mt-1">{{ item.dailyGoal }}</p>
                <p class="text-slate-500 mt-1 line-clamp-2">
                  {{ item.reflection || '坚持的故事由你来书写。' }}
                </p>
              </li>
            </ul>
            <p v-if="monthlyCheckIns.length === 0" class="text-sm text-slate-500 bg-slate-50 rounded-2xl p-4 text-center">
              这个月还没有记录，快来解锁第一枚徽章吧！
            </p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
progress[value] {
  -webkit-appearance: none;
  appearance: none;
  border: none;
  height: 10px;
  border-radius: 10px;
  overflow: hidden;
}
progress[value]::-webkit-progress-bar {
  background-color: #e5e7eb;
  border-radius: 10px;
}
progress[value]::-webkit-progress-value {
  background-color: #34d399;
  border-radius: 10px;
}
</style>
