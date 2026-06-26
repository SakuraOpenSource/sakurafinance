import { createRouter, createWebHistory } from 'vue-router'
import { getInitStatus } from '../api/init'

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

  if (!initialized && to.name !== 'init') {
    return { name: 'init' }
  }
  if (initialized && to.name === 'init') {
    return { name: 'home' }
  }
  return true
})

export default router
