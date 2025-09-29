import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'

const STORAGE_KEY = 'shanpan-auth-user'

export const useAuthStore = defineStore('auth', () => {
  const storedUser = localStorage.getItem(STORAGE_KEY)
  const user = ref(storedUser ? JSON.parse(storedUser) : null)
  const isAuthenticated = computed(() => !!user.value)

  function setUser(payload) {
    user.value = payload
    if (payload) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  async function login(credentials) {
    try {
      const response = await authApi.login(credentials)
      setUser(response.data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async function register(userData) {
    try {
      const response = await authApi.register(userData)
      setUser(response.data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  function logout() {
    setUser(null)
  }

  return { user, isAuthenticated, login, register, logout, setUser }
})
