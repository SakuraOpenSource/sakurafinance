<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Cpu, Goods } from '@element-plus/icons-vue'
import { getCategories, getProducts } from '../api/shop'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const categories = ref([])
const products = ref([])
const activeCategory = ref(0) // 0 表示全部
const loading = ref(false)

const tabs = computed(() => [{ id: 0, name: '全部' }, ...categories.value])

async function loadProducts() {
  loading.value = true
  try {
    const res = await getProducts(activeCategory.value || undefined)
    products.value = res.products || []
  } finally {
    loading.value = false
  }
}

function selectCategory(id) {
  activeCategory.value = id
  loadProducts()
}

async function handleAdd(product) {
  try {
    await cartStore.add(product.id, 1)
    ElMessage.success('已加入购物车')
  } catch {
    // 错误提示已在拦截器统一处理
  }
}

onMounted(async () => {
  try {
    const res = await getCategories()
    categories.value = res.categories || []
  } catch {
    // 分类拉取失败不阻塞商品展示
  }
  await Promise.all([loadProducts(), cartStore.refresh().catch(() => {})])
})
</script>

<template>
  <div class="page-shell">
    <header class="shop-header">
      <h1>云服务器商城</h1>
      <el-badge :value="cartStore.count" :hidden="cartStore.count === 0">
        <el-button @click="router.push('/cart')">购物车</el-button>
      </el-badge>
    </header>

    <div class="category-bar">
      <el-button
        v-for="tab in tabs"
        :key="tab.id"
        :type="activeCategory === tab.id ? 'primary' : 'default'"
        round
        @click="selectCategory(tab.id)"
      >
        {{ tab.name }}
      </el-button>
    </div>

    <div v-loading="loading" class="product-grid">
      <el-empty v-if="!loading && products.length === 0" description="暂无商品" />
      <el-card v-for="p in products" :key="p.id" shadow="hover" class="product-card">
        <div class="product-title">
          <el-icon><Goods /></el-icon>
          <span>{{ p.name }}</span>
        </div>
        <p class="product-desc">{{ p.description || '高性能云服务器' }}</p>
        <ul class="spec-list">
          <li><el-icon><Cpu /></el-icon> {{ p.cpu }} 核 CPU</li>
          <li>{{ p.ram }} GB 内存</li>
          <li>{{ p.disk }} GB 硬盘</li>
          <li>{{ p.bandwidth }} Mbps 带宽</li>
        </ul>
        <div class="product-footer">
          <span class="price">¥{{ p.price.toFixed(2) }}</span>
          <el-button
            type="primary"
            :disabled="p.stock <= 0"
            @click="handleAdd(p)"
          >
            {{ p.stock > 0 ? '加入购物车' : '已售罄' }}
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.shop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.shop-header h1 {
  margin: 0;
  font-size: 24px;
}

.category-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  min-height: 200px;
}

.product-card {
  border-radius: 16px;
}

.product-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.product-desc {
  color: #6b7280;
  font-size: 14px;
  margin: 8px 0 12px;
}

.spec-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  color: #374151;
  font-size: 14px;
}

.spec-list li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price {
  font-size: 20px;
  font-weight: 700;
  color: #ef4444;
}
</style>
