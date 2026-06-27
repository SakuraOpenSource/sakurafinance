<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAdminSlug } from '../../api/admin'
import { useUserStore } from '../../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const slug = ref('')

function handleSelect(name) {
  router.push({ name })
}

function logout() {
  userStore.logout()
  if (slug.value) {
    router.replace(`/admin/${slug.value}/login`)
  } else {
    router.replace('/')
  }
}

async function copyLoginUrl() {
  const url = `${window.location.origin}/admin/${slug.value}/login`
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('登录地址已复制')
  } catch {
    ElMessage.info(url)
  }
}

onMounted(async () => {
  try {
    const res = await getAdminSlug()
    slug.value = res.slug
  } catch {
    // 无权限时守卫已拦截
  }
})
</script>

<template>
  <el-container class="admin-shell">
    <el-aside width="220px" class="admin-aside">
      <div class="admin-brand">SakuraFinance 后台</div>
      <el-menu :default-active="route.name" @select="handleSelect">
        <el-menu-item index="admin-products">商品管理</el-menu-item>
        <el-menu-item index="admin-categories">分类管理</el-menu-item>
        <el-menu-item index="admin-payment">支付配置</el-menu-item>
        <el-menu-item index="admin-accounts">管理员账户</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="admin-header">
        <div class="slug-hint">
          <span class="muted">登录入口：</span>
          <code>/admin/{{ slug }}/login</code>
          <el-button text type="primary" size="small" @click="copyLoginUrl">复制</el-button>
        </div>
        <div>
          <span class="muted">{{ userStore.user?.nickname }}</span>
          <el-button text @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
}

.admin-aside {
  background: #1f2937;
}

.admin-brand {
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  padding: 20px 16px;
}

.admin-aside :deep(.el-menu) {
  background: transparent;
  border-right: none;
}

.admin-aside :deep(.el-menu-item) {
  color: #d1d5db;
}

.admin-aside :deep(.el-menu-item.is-active) {
  color: #fff;
  background: #374151;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.slug-hint code {
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 6px;
  margin-right: 4px;
}

.muted {
  color: #6b7280;
  font-size: 13px;
  margin-right: 8px;
}

.admin-main {
  background: #f9fafb;
}
</style>
