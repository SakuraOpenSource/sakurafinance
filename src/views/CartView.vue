<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPublicPaymentMethods } from '../api/shop'
import { useCartStore } from '../stores/cart'
import { useUserStore } from '../stores/user'
import PaymentBrand from '../components/PaymentBrand.vue'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

// 支付方式：balance（余额）+ 后台已启用的网关
const gateways = ref([])
const payMethod = ref('balance')

async function changeQty(item, quantity) {
  if (quantity < 1) return
  try {
    await cartStore.updateQuantity(item.productId, quantity)
  } catch {
    // 拦截器已提示
  }
}

async function remove(item) {
  try {
    await cartStore.remove(item.productId)
  } catch {
    // 拦截器已提示
  }
}

async function handleCheckout() {
  const label =
    payMethod.value === 'balance'
      ? '余额'
      : gateways.value.find((g) => g.type === payMethod.value)?.name || '所选方式'
  try {
    await ElMessageBox.confirm(
      `本次将使用${label}支付 ¥${cartStore.totalAmount.toFixed(2)}，确认结算？`,
      '确认结算',
      { confirmButtonText: '确认支付', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  try {
    const order = await cartStore.checkout(payMethod.value)
    ElMessage.success(`下单成功，订单号 ${order.orderNo}`)
    await userStore.loadMe() // 刷新余额
    router.push('/dashboard')
  } catch {
    // 余额不足等错误已在拦截器提示
  }
}

onMounted(async () => {
  cartStore.refresh().catch(() => {})
  try {
    const res = await getPublicPaymentMethods()
    gateways.value = res.paymentMethods || []
  } catch {
    // 网关拉取失败时仅保留余额支付
  }
})
</script>

<template>
  <div class="page-shell">
    <header class="cart-header">
      <h1>购物车</h1>
      <el-button text @click="router.push('/shop')">继续选购</el-button>
    </header>

    <el-card v-loading="cartStore.loading" shadow="never" class="cart-card">
      <el-empty v-if="cartStore.items.length === 0" description="购物车是空的">
        <el-button type="primary" @click="router.push('/shop')">去商城看看</el-button>
      </el-empty>

      <template v-else>
        <el-table :data="cartStore.items" style="width: 100%">
          <el-table-column prop="productName" label="商品" min-width="180" />
          <el-table-column label="单价" width="120">
            <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="数量" width="160">
            <template #default="{ row }">
              <el-input-number
                :model-value="row.quantity"
                :min="1"
                :max="row.stock"
                size="small"
                @change="(val) => changeQty(row, val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              ¥{{ (row.price * row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button text type="danger" @click="remove(row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pay-method">
          <span class="pay-label">支付方式</span>
          <div class="method-grid">
            <div
              class="method-item"
              :class="{ active: payMethod === 'balance' }"
              @click="payMethod = 'balance'"
            >
              <PaymentBrand type="balance" :size="36" />
              <span>余额（¥{{ (userStore.user?.balance ?? 0).toFixed(2) }}）</span>
            </div>
            <div
              v-for="g in gateways"
              :key="g.type"
              class="method-item"
              :class="{ active: payMethod === g.type }"
              @click="payMethod = g.type"
            >
              <PaymentBrand :type="g.type" :size="36" />
              <span>{{ g.name }}</span>
            </div>
          </div>
        </div>

        <div class="cart-footer">
          <div class="summary">
            合计：<span class="total">¥{{ cartStore.totalAmount.toFixed(2) }}</span>
          </div>
          <el-button type="primary" size="large" @click="handleCheckout">
            结算
          </el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped>
.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.cart-header h1 {
  margin: 0;
  font-size: 24px;
}

.cart-card {
  border-radius: 16px;
}

.cart-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 24px;
  margin-top: 24px;
}

.pay-method {
  margin-top: 24px;
}

.pay-label {
  display: block;
  margin-bottom: 8px;
  color: #6b7280;
  font-size: 14px;
}

.method-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.method-item:hover {
  border-color: #c7d2fe;
}

.method-item.active {
  border-color: #6366f1;
  background: #eef2ff;
}

.summary {
  font-size: 16px;
}

.total {
  font-size: 24px;
  font-weight: 700;
  color: #ef4444;
}
</style>
