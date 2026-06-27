<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getPaymentMethods, savePaymentMethods } from '../../api/admin'

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
  methods.value.push({ name: '', enabled: true, account: '', secret: '' })
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
        <el-button @click="addMethod">添加支付方式</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </div>
    </div>

    <el-alert
      type="info"
      :closable="false"
      title="本阶段仅保存支付方式配置，暂未对接真实支付网关。用户结算时可使用余额支付。"
      style="margin-bottom: 16px"
    />

    <el-table v-loading="loading" :data="methods" style="width: 100%">
      <el-table-column label="名称" min-width="160">
        <template #default="{ row }">
          <el-input v-model="row.name" placeholder="如 支付宝" />
        </template>
      </el-table-column>
      <el-table-column label="账号/商户号" min-width="200">
        <template #default="{ row }">
          <el-input v-model="row.account" placeholder="如 appid / 商户号" />
        </template>
      </el-table-column>
      <el-table-column label="密钥" min-width="200">
        <template #default="{ row }">
          <el-input v-model="row.secret" type="password" show-password placeholder="密钥" />
        </template>
      </el-table-column>
      <el-table-column label="启用" width="90">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="90">
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
