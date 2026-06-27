<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getInstances, getOrders } from '../api/shop'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const instances = ref([])
const orders = ref([])
const loadingInstances = ref(false)
const loadingOrders = ref(false)

const editVisible = ref(false)
const editFormRef = ref()
const submitting = ref(false)
const editForm = reactive({ nickname: '', email: '', qq: '', phone: '' })

const editRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  qq: [{ pattern: /^\d{5,12}$/, message: 'QQ 号格式不正确', trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }],
}

function openEdit() {
  const u = userStore.user || {}
  editForm.nickname = u.nickname || ''
  editForm.email = u.email || ''
  editForm.qq = u.qq || ''
  editForm.phone = u.phone || ''
  editVisible.value = true
}

async function submitEdit() {
  if (!editFormRef.value) return
  try {
    await editFormRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    await userStore.updateProfile({ ...editForm })
    ElMessage.success('资料已更新')
    editVisible.value = false
  } catch {
    // 拦截器已提示
  } finally {
    submitting.value = false
  }
}

function formatDate(s) {
  if (!s) return '-'
  return new Date(s).toLocaleString()
}

onMounted(async () => {
  if (!userStore.user) await userStore.loadMe()
  loadingInstances.value = true
  loadingOrders.value = true
  try {
    const res = await getInstances()
    instances.value = res.instances || []
  } finally {
    loadingInstances.value = false
  }
  try {
    const res = await getOrders()
    orders.value = res.orders || []
  } finally {
    loadingOrders.value = false
  }
})
</script>

<template>
  <div class="page-shell">
    <header class="dash-header">
      <h1>用户中心</h1>
      <div>
        <el-button text @click="router.push('/shop')">商城</el-button>
        <el-button text @click="router.push('/')">返回首页</el-button>
      </div>
    </header>

    <el-card shadow="never" class="profile-card">
      <div class="profile-top">
        <div class="profile-info">
          <h2>{{ userStore.user?.nickname }}</h2>
          <p class="muted">@{{ userStore.user?.username }}</p>
          <p class="muted">UUID：{{ userStore.user?.uuid }}</p>
        </div>
        <div class="balance-box">
          <span class="muted">账户余额</span>
          <span class="balance">¥{{ (userStore.user?.balance ?? 0).toFixed(2) }}</span>
          <el-button type="primary" size="small" @click="router.push('/recharge')">充值</el-button>
        </div>
      </div>
      <el-descriptions :column="2" border class="profile-desc">
        <el-descriptions-item label="邮箱">{{ userStore.user?.email }}</el-descriptions-item>
        <el-descriptions-item label="QQ">{{ userStore.user?.qq || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ userStore.user?.phone || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          {{ userStore.user?.role === 'admin' ? '管理员' : '普通用户' }}
        </el-descriptions-item>
      </el-descriptions>
      <div class="profile-actions">
        <el-button type="primary" @click="openEdit">编辑资料</el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="section-card">
      <template #header><span>我的云服务器</span></template>
      <div v-loading="loadingInstances">
        <el-empty v-if="instances.length === 0" description="还没有云服务器" />
        <el-table v-else :data="instances" style="width: 100%">
          <el-table-column prop="name" label="名称" min-width="160" />
          <el-table-column label="规格" min-width="200">
            <template #default="{ row }">
              {{ row.cpu }}核 / {{ row.ram }}GB / {{ row.disk }}GB / {{ row.bandwidth }}Mbps
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'running' ? 'success' : 'info'">
                {{ row.status === 'running' ? '运行中' : '已过期' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="到期时间" min-width="180">
            <template #default="{ row }">{{ formatDate(row.expiresAt) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-card shadow="never" class="section-card">
      <template #header><span>我的订单</span></template>
      <div v-loading="loadingOrders">
        <el-empty v-if="orders.length === 0" description="还没有订单" />
        <el-table v-else :data="orders" style="width: 100%">
          <el-table-column prop="orderNo" label="订单号" min-width="200" />
          <el-table-column label="金额" width="120">
            <template #default="{ row }">¥{{ row.totalAmount.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'paid' ? 'success' : 'warning'">
                {{ row.status === 'paid' ? '已支付' : '待支付' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="下单时间" min-width="180">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog v-model="editVisible" title="编辑资料" width="460px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-position="top">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="QQ 号（选填）" prop="qq">
          <el-input v-model="editForm.qq" />
        </el-form-item>
        <el-form-item label="手机号（选填）" prop="phone">
          <el-input v-model="editForm.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.dash-header h1 {
  margin: 0;
  font-size: 24px;
}

.profile-card,
.section-card {
  border-radius: 16px;
  margin-bottom: 20px;
}

.profile-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.profile-info h2 {
  margin: 0 0 4px;
}

.muted {
  color: #6b7280;
  font-size: 13px;
  margin: 2px 0;
}

.balance-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.balance {
  font-size: 28px;
  font-weight: 700;
  color: #10b981;
}

.profile-actions {
  margin-top: 16px;
  text-align: right;
}
</style>
