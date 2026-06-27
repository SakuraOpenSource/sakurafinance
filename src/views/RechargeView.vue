<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPublicPaymentMethods, recharge } from '../api/shop'
import { useUserStore } from '../stores/user'
import PaymentBrand from '../components/PaymentBrand.vue'

const router = useRouter()
const userStore = useUserStore()

const methods = ref([])
const loading = ref(true)
const amount = ref(100)
const selectedType = ref('')
const submitting = ref(false)

async function handleRecharge() {
  if (!selectedType.value) {
    ElMessage.warning('请选择支付方式')
    return
  }
  if (amount.value <= 0) {
    ElMessage.warning('充值金额必须大于 0')
    return
  }
  submitting.value = true
  try {
    await recharge(amount.value, selectedType.value)
    ElMessage.success('充值成功')
    await userStore.loadMe()
    router.push('/dashboard')
  } catch {
    // 拦截器已提示
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (!userStore.user) await userStore.loadMe()
  try {
    const res = await getPublicPaymentMethods()
    methods.value = res.paymentMethods || []
    if (methods.value.length) selectedType.value = methods.value[0].type
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-shell">
    <header class="recharge-header">
      <h1>账户充值</h1>
      <el-button text @click="router.push('/dashboard')">返回用户中心</el-button>
    </header>

    <el-card shadow="never" class="recharge-card" v-loading="loading">
      <div class="balance-line">
        当前余额：<span class="balance">¥{{ (userStore.user?.balance ?? 0).toFixed(2) }}</span>
      </div>

      <!-- 未配置任何可用支付网关：提示联系管理员 -->
      <el-empty
        v-if="!loading && methods.length === 0"
        description="站点暂未开通在线支付"
      >
        <p class="contact-tip">请联系站点管理员手动充值</p>
      </el-empty>

      <template v-else>
        <div class="field">
          <label>充值金额</label>
          <el-input-number v-model="amount" :min="1" :step="50" size="large" />
        </div>

        <div class="field">
          <label>选择支付方式</label>
          <div class="method-grid">
            <div
              v-for="m in methods"
              :key="m.type"
              class="method-item"
              :class="{ active: selectedType === m.type }"
              @click="selectedType = m.type"
            >
              <PaymentBrand :type="m.type" :size="44" />
              <span>{{ m.name }}</span>
            </div>
          </div>
        </div>

        <el-button
          type="primary"
          size="large"
          class="submit-btn"
          :loading="submitting"
          @click="handleRecharge"
        >
          确认充值 ¥{{ amount.toFixed(2) }}
        </el-button>
      </template>
    </el-card>
  </div>
</template>

<style scoped>
.recharge-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.recharge-header h1 {
  margin: 0;
  font-size: 24px;
}

.recharge-card {
  max-width: 560px;
  border-radius: 16px;
}

.balance-line {
  margin-bottom: 24px;
  font-size: 15px;
  color: #374151;
}

.balance {
  font-size: 22px;
  font-weight: 700;
  color: #10b981;
}

.field {
  margin-bottom: 24px;
}

.field label {
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
  padding: 12px 16px;
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

.submit-btn {
  width: 100%;
}

.contact-tip {
  color: #ef4444;
  font-size: 14px;
}
</style>
