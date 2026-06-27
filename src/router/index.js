import { createRouter, createWebHistory } from 'vue-router'
import { getInitStatus } from '../api/init'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/init',
    name: 'init',
    component: () => import('../views/InitView.vue'),
  },
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  // 每次启动均向后端查询初始化状态，由后端说了算
  let initialized = false
  try {
    const res = await getInitStatus()
    initialized = res?.initialized === true
  } catch {
    // 查询失败（如后端未就绪）时按未初始化处理，引导用户去初始化页
    initialized = false
  }

  if (!initialized) {
    return to.name === 'init' ? true : { name: 'init' }
  }
  if (to.name === 'init') {
    return { name: 'home' }
  }

  // 已初始化：处理登录态相关的权限
  const userStore = useUserStore()
  // 有 token 但尚未加载用户信息时，先拉取一次（失败会在 store 内登出）
  if (userStore.isLoggedIn && !userStore.user) {
    await userStore.loadMe()
  }

  // 需要登录的页面：未登录跳登录页
  if (to.meta.requireAuth && !userStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  // 仅游客可访问的页面（登录/注册）：已登录则回主页
  if (to.meta.guestOnly && userStore.isLoggedIn) {
    return { name: 'home' }
  }
  return true
})

export default router
