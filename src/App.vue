<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/counter'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const { user, isAuthenticated } = storeToRefs(authStore)

// 需要动态显示的导航项
const authNavigation = [
  { label: '每日打卡', to: '/dashboard', authOnly: true },
]

// 计算属性，只返回在当前认证状态下应该可见的链接
const visibleAuthNavigation = computed(() =>
  authNavigation.filter((item) => (!item.authOnly || isAuthenticated.value))
)

const currentYear = new Date().getFullYear()

function handleLogout() {
  authStore.logout()
  router.push({ path: '/', query: { auth: 'login' } })
}

function openAuth(tab = 'login') {
  const normalized = tab === 'register' ? 'register' : 'login'
  const existingRedirect = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
  const shouldRedirectBack = route.name && route.name !== 'home'
  const query = { auth: normalized }
  if (shouldRedirectBack) {
    query.redirect = route.fullPath
  } else if (existingRedirect) {
    query.redirect = existingRedirect
  }
  router.push({ path: '/', query })
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans">
    <!-- 使用 HTML 中的导航栏，并集成 Vue 逻辑 -->
    <header class="bg-white shadow-sm sticky top-0 z-20">
      <div class="container mx-auto px-6 py-3 flex justify-between items-center">
        <!-- Logo -->
        <RouterLink to="/" class="text-2xl font-bold text-orange-400">
          <i class="fas fa-puzzle-piece"></i> 童心世界
        </RouterLink>
        
        <!-- 导航链接 -->
        <nav class="hidden md:flex items-center space-x-8 text-gray-700">
          <RouterLink to="/" class="hover:text-orange-400">首页</RouterLink>
          <a href="http://xlsp.xiniu3d.com/" target="_blank" rel="noopener noreferrer" class="hover:text-orange-400">沙盘</a>
          <RouterLink to="/chessboard" class="hover:text-orange-400">棋盘</RouterLink>
          <a href="https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg5Mjk4Mzc1OQ==&action=getalbum&album_id=3870940037684559875#wechat_redirect" target="_blank" rel="noopener noreferrer" class="hover:text-orange-400">绘本</a>
          <RouterLink to="/calendar" class="hover:text-orange-400">坚毅台历</RouterLink>
          <a href="https://mp.weixin.qq.com/s/YEIsz7BDBLCdSIodpYd89Q" target="_blank" rel="noopener noreferrer" class="hover:text-orange-400">关于我们</a>
          
          <!-- 动态认证链接 -->
          <RouterLink
            v-for="item in visibleAuthNavigation"
            :key="item.to"
            :to="item.to"
            class="hover:text-orange-400"
            active-class="text-orange-500 font-semibold"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
        
        <!-- 右侧：登录状态判断 -->
        <div class="flex items-center space-x-4">
          <!-- 未登录时显示 -->
          <div v-if="!isAuthenticated" class="flex items-center space-x-2">
            <button class="text-gray-600 hover:text-orange-400"><i class="fas fa-search"></i></button>
            <button
              type="button"
              class="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500 text-sm"
              @click="openAuth('login')"
            >
              登录/注册
            </button>
          </div>

          <!-- 登录后显示 -->
          <div v-else class="flex items-center space-x-4">
             <div class="text-sm text-slate-600 text-right">
              <p class="font-semibold text-slate-800">{{ user?.username }}</p>
              <p class="text-xs">总积分：<span class="font-medium text-orange-500">{{ user?.totalPoints ?? 0 }}</span></p>
            </div>
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-orange-400 text-white text-sm font-medium hover:bg-orange-500 transition"
              @click="handleLogout"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 路由视图：这里会显示 HomePage.vue 或其他页面的内容 -->
    <main>
      <RouterView />
    </main>

    <!-- 页脚 -->
    <!-- <footer class="bg-white border-t border-slate-200 mt-16">
      <div class="container mx-auto px-6 py-8 text-center text-sm text-slate-500">
        <p>© {{ currentYear }} 童心世界. 保留所有权利。</p>
      </div>
    </footer> -->
  </div>
</template>