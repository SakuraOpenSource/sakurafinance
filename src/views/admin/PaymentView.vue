<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getPaymentMethods, savePaymentMethods } from '../../api/admin'
import PaymentBrand from '../../components/PaymentBrand.vue'

// 支持的固定网关类型，前台据 type 显示对应品牌
const gatewayTypes = [
  { value: 'alipay', label: '支付宝' },
  { value: 'wechat', label: '微信支付' },
  { value: 'alipayplus', label: 'Alipay+' },
  { value: 'stripe', label: 'Stripe' },
]

const methods = ref([])
const loading = ref(false)
const saving = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await getPaymentMethods()
    methods.value = res.paymentMethods || []
  } finally {
    loading.value = false
  }
}

function addMethod() {
  methods.value.push({ type: 'alipay', name: '支付宝', enabled: true, account: '', secret: '' })
}

// 切换类型时自动带出默认展示名，便于填写
function onTypeChange(row) {
  const t = gatewayTypes.find((g) => g.value === row.type)
  if (t) row.name = t.label
}

function removeMethod(index) {
  methods.value.splice(index, 1)
}

async function save() {
  saving.value = true
  try {
    await savePaymentMethods(methods.value)
    ElMessage.success('支付配置已保存')
  } catch {
    // 拦截器已提示
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="toolbar">
      <h2>支付配置</h2>
      <div>
        <el-button @click="addMethod">添加支付网关</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </div>
    </div>

    <el-alert
      type="info"
      :closable="false"
      title="配置并启用的支付网关将显示在用户充值与结算页面。本阶段网关支付为模拟到账，尚未对接真实支付接口。"
      style="margin-bottom: 16px"
    />

    <el-table v-loading="loading" :data="methods" style="width: 100%">
      <el-table-column label="品牌" width="80">
        <template #default="{ row }">
          <PaymentBrand :type="row.type" :size="36" />
        </template>
      </el-table-column>
      <el-table-column label="类型" width="160">
        <template #default="{ row }">
          <el-select v-model="row.type" @change="() => onTypeChange(row)">
            <el-option
              v-for="g in gatewayTypes"
              :key="g.value"
              :label="g.label"
              :value="g.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="展示名" min-width="140">
        <template #default="{ row }">
          <el-input v-model="row.name" placeholder="前台显示名称" />
        </template>
      </el-table-column>
      <el-table-column label="账号/商户号" min-width="180">
        <template #default="{ row }">
          <el-input v-model="row.account" placeholder="appid / 商户号" />
        </template>
      </el-table-column>
      <el-table-column label="密钥" min-width="160">
        <template #default="{ row }">
          <el-input v-model="row.secret" type="password" show-password placeholder="密钥" />
        </template>
      </el-table-column>
      <el-table-column label="启用" width="80">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="{ $index }">
          <el-button text type="danger" @click="removeMethod($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.toolbar h2 {
  margin: 0;
}
</style>
