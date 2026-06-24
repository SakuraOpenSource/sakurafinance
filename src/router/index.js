import { createRouter, createWebHistory } from 'vue-router'

// 本地标记键：初始化完成后写入，用于判断是否首次启动
export const INIT_FLAG_KEY = 'sakura-finance-initialized'

const routes = [
  {
    path: '/init',
    name: 'init',
    component: () => import('../views/InitView.vue'),
  },
  {
    path: '/',
    name: 'home',
    // 主页占位，后续替换为实际主页组件
    component: { template: '<div style="padding:32px">主页</div>' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 首次启动（无本地标记）时强制跳转到初始化页
router.beforeEach((to) => {
  const initialized = localStorage.getItem(INIT_FLAG_KEY) === 'true'
  if (!initialized && to.name !== 'init') {
    return { name: 'init' }
  }
  if (initialized && to.name === 'init') {
    return { name: 'home' }
  }
  return true
})

export default router
