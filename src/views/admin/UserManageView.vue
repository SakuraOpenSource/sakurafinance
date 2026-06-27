<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import {
  deleteUser,
  getUsers,
  rechargeUser,
  resetUserPassword,
  updateUser,
} from '../../api/admin'

const users = ref([])
const loading = ref(false)
const current = ref(null)

// 充值
const rechargeVisible = ref(false)
const rechargeForm = reactive({ amount: 0 })
const recharging = ref(false)

// 编辑资料（昵称 + 用户名）
const editVisible = ref(false)
const editFormRef = ref()
const editForm = reactive({ nickname: '', username: '' })
const savingEdit = ref(false)
const editRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
}

// 重置密码
const pwdVisible = ref(false)
const pwdFormRef = ref()
const pwdForm = reactive({ password: '' })
const savingPwd = ref(false)
const pwdRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
}

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
  rechargeForm.amount = 0
  rechargeVisible.value = true
}

async function submitRecharge() {
  if (rechargeForm.amount <= 0) {
    ElMessage.warning('充值金额必须大于 0')
    return
  }
  recharging.value = true
  try {
    await rechargeUser(current.value.id, rechargeForm.amount)
    ElMessage.success('充值成功')
    rechargeVisible.value = false
    await load()
  } catch {
    // 拦截器已提示
  } finally {
    recharging.value = false
  }
}

function openEdit(row) {
  current.value = row
  editForm.nickname = row.nickname
  editForm.username = row.username
  editVisible.value = true
}

async function submitEdit() {
  if (!editFormRef.value) return
  try {
    await editFormRef.value.validate()
  } catch {
    return
  }
  savingEdit.value = true
  try {
    await updateUser(current.value.id, { ...editForm })
    ElMessage.success('已更新')
    editVisible.value = false
    await load()
  } catch {
    // 拦截器已提示
  } finally {
    savingEdit.value = false
  }
}

function openPassword(row) {
  current.value = row
  pwdForm.password = ''
  pwdVisible.value = true
}

async function submitPassword() {
  if (!pwdFormRef.value) return
  try {
    await pwdFormRef.value.validate()
  } catch {
    return
  }
  savingPwd.value = true
  try {
    await resetUserPassword(current.value.id, pwdForm.password)
    ElMessage.success('密码已重置')
    pwdVisible.value = false
  } catch {
    // 拦截器已提示
  } finally {
    savingPwd.value = false
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确认删除用户 ${row.nickname}（@${row.username}）？该操作不可恢复。`,
      '删除用户',
      { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  try {
    await deleteUser(row.id)
    ElMessage.success('已删除')
    await load()
  } catch {
    // 拦截器已提示
  }
}

onMounted(load)

// 「更多」下拉命令分发
function onCommand(cmd, row) {
  if (cmd === 'edit') openEdit(row)
  else if (cmd === 'password') openPassword(row)
  else if (cmd === 'delete') handleDelete(row)
}
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
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button text type="primary" @click="openRecharge(row)">充值</el-button>
          <el-dropdown trigger="click" @command="(cmd) => onCommand(cmd, row)">
            <el-button text type="primary">
              更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                <el-dropdown-item command="password">重置密码</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="rechargeVisible" title="手动充值" width="400px">
      <p v-if="current" class="dialog-target">
        为用户 <strong>{{ current.nickname }}</strong>（@{{ current.username }}）充值
      </p>
      <el-form label-position="top">
        <el-form-item label="充值金额（元）">
          <el-input-number v-model="rechargeForm.amount" :min="0" :precision="2" :step="10" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rechargeVisible = false">取消</el-button>
        <el-button type="primary" :loading="recharging" @click="submitRecharge">确认充值</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editVisible" title="编辑用户" width="420px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-position="top">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingEdit" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="pwdVisible" title="重置密码" width="420px">
      <p v-if="current" class="dialog-target">
        为用户 <strong>{{ current.nickname }}</strong>（@{{ current.username }}）设置新密码
      </p>
      <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-position="top">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="pwdForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingPwd" @click="submitPassword">确认重置</el-button>
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

.dialog-target {
  margin: 0 0 12px;
  color: #374151;
}
</style>
