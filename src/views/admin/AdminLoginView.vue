<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const submitting = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    await userStore.adminLogin({ ...form, slug: route.params.slug })
    ElMessage.success('登录成功')
    router.replace({ name: 'admin-products' })
  } catch {
    // 拦截器已提示；slug 错误会返回 404 提示「页面不存在」
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="never">
      <div class="auth-header">
        <h1>管理后台</h1>
        <p>请使用管理员账户登录</p>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入管理员用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="full-width" :loading="submitting" native-type="submit">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 32px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  border-radius: 20px;
}

.auth-header {
  margin-bottom: 24px;
  text-align: center;
}

.auth-header h1 {
  margin: 0 0 8px;
  font-size: 26px;
}

.auth-header p {
  margin: 0;
  color: #6b7280;
}

.full-width {
  width: 100%;
}
</style>
