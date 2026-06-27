<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Money, TrendCharts, Wallet } from '@element-plus/icons-vue'
import { getConfig } from '../api/init'
import { resolveAssetUrl } from '../api/request'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)

// 前台展示的系统配置，接口未就绪时使用默认文案降级
const site = reactive({
  name: 'SakuraFinance',
  intro: '面向云计算的财务管理系统，助你轻松掌控云上每一笔开销。',
  logoUrl: '',
})

onMounted(async () => {
  try {
    const res = await getConfig()
    if (res?.name) site.name = res.name
    if (res?.intro) site.intro = res.intro
    site.logoUrl = resolveAssetUrl(res?.logoPath)
  } catch {
    // 配置获取失败时保留默认展示
  } finally {
    loading.value = false
  }
})

const features = [
  {
    icon: Wallet,
    title: '账户总览',
    desc: '统一查看余额、消费与充值记录，资金流向一目了然。',
  },
  {
    icon: TrendCharts,
    title: '用量分析',
    desc: '按资源维度统计云服务开销，及时发现成本异常。',
  },
  {
    icon: Money,
    title: '弹性计费',
    desc: '灵活的商品与套餐配置，按需选购云服务器等资源。',
  },
]
</script>

<template>
  <div class="page-shell">
    <header class="home-nav">
      <div class="brand">
        <img v-if="site.logoUrl" :src="site.logoUrl" :alt="site.name" class="brand-logo" />
        <span class="brand-name">{{ site.name }}</span>
      </div>
      <div class="nav-actions">
        <template v-if="userStore.isLoggedIn">
          <span class="nav-user">{{ userStore.user?.nickname || userStore.user?.username }}</span>
          <el-button text @click="userStore.logout()">退出</el-button>
        </template>
        <template v-else>
          <el-button text @click="router.push('/login')">登录</el-button>
          <el-button type="primary" @click="router.push('/register')">注册</el-button>
        </template>
      </div>
    </header>

    <section class="hero-card" v-loading="loading">
      <div class="hero-main">
        <h1>{{ site.name }}</h1>
        <p class="description">{{ site.intro }}</p>
        <div class="actions">
          <el-button type="primary" size="large" @click="router.push('/register')">
            立即开始
          </el-button>
          <el-button size="large" @click="router.push('/login')">已有账户</el-button>
        </div>
      </div>
      <el-card class="status-card" shadow="never">
        <div class="status-header">
          <el-icon><TrendCharts /></el-icon>
          <span>云资源概览</span>
        </div>
        <p class="description">登录后即可查看你的云服务器、余额与消费明细。</p>
      </el-card>
    </section>

    <section class="feature-grid">
      <el-card v-for="item in features" :key="item.title" shadow="hover">
        <el-icon class="feature-icon"><component :is="item.icon" /></el-icon>
        <h2>{{ item.title }}</h2>
        <p>{{ item.desc }}</p>
      </el-card>
    </section>
  </div>
</template>

<style scoped>
.home-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 8px;
}

.brand-name {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-user {
  color: #374151;
  font-weight: 600;
}
</style>
