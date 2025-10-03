import { createRouter, createWebHistory } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/counter'

const CalendarView = () => import('@/views/Calendar.vue')
const HomePage = () => import('@/views/HomePage.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/login',
      name: 'login',
      redirect: (to) => ({ path: '/', query: { ...to.query, auth: 'login' } })
    },
    {
      path: '/register',
      name: 'register',
      redirect: (to) => ({ path: '/', query: { ...to.query, auth: 'register' } })
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: CalendarView,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const { isAuthenticated } = storeToRefs(authStore)
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { path: '/', query: { auth: 'login', redirect: to.fullPath } }
  }
  if ((to.name === 'login' || to.name === 'register') && isAuthenticated.value) {
    return { name: 'calendar' }
  }
  return true
})

export default router
