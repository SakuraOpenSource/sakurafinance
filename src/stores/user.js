import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi, fetchMe } from '../api/auth'

const TOKEN_KEY = 'sakura-finance-token'

export const useUserStore = defineStore('user', () => {
  // token 持久化到 localStorage，刷新后保持登录态
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setToken(value) {
    token.value = value
    if (value) {
      localStorage.setItem(TOKEN_KEY, value)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  async function login(payload) {
    const res = await loginApi(payload)
    setToken(res.token)
    user.value = res.user
    return res
  }

  async function register(payload) {
    const res = await registerApi(payload)
    setToken(res.token)
    user.value = res.user
    return res
  }

  // 用已有 token 拉取当前用户，失败则清空登录态
  async function loadMe() {
    if (!token.value) return null
    try {
      const res = await fetchMe()
      user.value = res.user
      return res.user
    } catch {
      logout()
      return null
    }
  }

  function logout() {
    setToken('')
    user.value = null
  }

  return { token, user, isLoggedIn, isAdmin, login, register, loadMe, logout }
})
