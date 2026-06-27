import axios from 'axios'
import { ElMessage } from 'element-plus'

// 后端服务地址（不含 /api），用于拼接 logo 等静态资源的完整 URL
export const SERVER_ORIGIN = import.meta.env.VITE_API_BASE_URL || ''

// 将后端返回的相对资源路径（如 /uploads/logo.png）拼成可访问的完整 URL
export function resolveAssetUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  return `${SERVER_ORIGIN}${path}`
}

const request = axios.create({
  baseURL: `${SERVER_ORIGIN}/api`,
  timeout: 15000,
})

// token 存取键，与 user store 保持一致
const TOKEN_KEY = 'sakura-finance-token'

// 401 处理回调，由应用入口注册（清登录态并跳转登录页），避免与 store 循环依赖
let onUnauthorized = null
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

// 请求拦截器：自动携带 Authorization 头
request.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 401：登录态失效，触发登出与跳转
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized()
    }
    const message =
      error.response?.data?.message || error.message || '请求失败，请稍后重试'
    ElMessage.error(message)
    return Promise.reject(error)
  },
)

export default request
