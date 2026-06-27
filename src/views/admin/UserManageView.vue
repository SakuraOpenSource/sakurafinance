<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getUsers, rechargeUser } from '../../api/admin'

const users = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const current = ref(null)
const form = reactive({ amount: 0 })

async function load() {
  loading.value = true
  try {
    const res = await getUsers()
    users.value = res.users || []
  } finally {
    loading.value = false
  }
}

function openRecharge(row) {
  current.value = row
  form.amount = 0
  dialogVisible.value = true
}

async function submit() {
  if (form.amount <= 0) {
    ElMessage.warning('充值金额必须大于 0')
    return
  }
  submitting.value = true
  try {
    await rechargeUser(current.value.id, form.amount)
    ElMessage.success('充值成功')
    dialogVisible.value = false
    await load()
  } catch {
    // 拦截器已提示
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="toolbar">
      <h2>用户管理</h2>
    </div>

    <el-table v-loading="loading" :data="users" style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="nickname" label="昵称" min-width="120" />
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column label="余额" width="120">
        <template #default="{ row }">
          <span class="balance">¥{{ row.balance.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button text type="primary" @click="openRecharge(row)">充值</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="手动充值" width="400px">
      <p v-if="current" class="recharge-target">
        为用户 <strong>{{ current.nickname }}</strong>（@{{ current.username }}）充值
      </p>
      <el-form label-position="top">
        <el-form-item label="充值金额（元）">
          <el-input-number v-model="form.amount" :min="0" :precision="2" :step="10" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">确认充值</el-button>
      </template>
    </el-dialog>
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

.balance {
  font-weight: 600;
  color: #10b981;
}

.recharge-target {
  margin: 0 0 12px;
  color: #374151;
}
</style>
