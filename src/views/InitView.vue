<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Picture, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { submitInit } from '../api/init'
import { INIT_FLAG_KEY } from '../router'

const router = useRouter()
const formRef = ref()
const submitting = ref(false)
const logoPreview = ref('')

const form = reactive({
  logo: null,
  name: '',
  dbType: 'SQLite',
  // 仅非 SQLite 使用：dbHost/dbPort/dbUser/dbPassword/dbName
  dbHost: '',
  dbPort: '',
  dbUser: '',
  dbPassword: '',
  dbName: '',
  cloudProvider: '',
})

const dbTypes = [
  { label: 'SQLite', value: 'SQLite' },
  { label: 'MySQL', value: 'MySQL' },
  { label: 'PostgreSQL', value: 'PostgreSQL' },
]

// 切换类型时填入默认端口，便于填写
const defaultPort = { MySQL: '3306', PostgreSQL: '5432' }
function handleDbTypeChange(type) {
  if (type !== 'SQLite' && !form.dbPort) {
    form.dbPort = defaultPort[type] || ''
  }
}

const rules = {
  name: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
  dbType: [{ required: true, message: '请选择数据库类型', trigger: 'change' }],
  dbHost: [{ required: true, message: '请输入主机地址', trigger: 'blur' }],
  dbPort: [{ required: true, message: '请输入端口', trigger: 'blur' }],
  dbUser: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  dbName: [{ required: true, message: '请输入数据库名', trigger: 'blur' }],
  cloudProvider: [
    { required: true, message: '请输入简介', trigger: 'blur' },
  ],
}

// el-upload 手动接管：仅保存文件并生成预览，不自动上传
function handleLogoChange(uploadFile) {
  const file = uploadFile.raw
  if (!file) return
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('Logo 必须是图片文件')
    return
  }
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('Logo 大小不能超过 2MB')
    return
  }
  form.logo = file
  logoPreview.value = URL.createObjectURL(file)
}

function removeLogo() {
  form.logo = null
  if (logoPreview.value) {
    URL.revokeObjectURL(logoPreview.value)
    logoPreview.value = ''
  }
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
    await submitInit(form)
    localStorage.setItem(INIT_FLAG_KEY, 'true')
    ElMessage.success('初始化完成')
    router.replace({ name: 'home' })
  } catch {
    // 错误提示已在 axios 拦截器中统一处理
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="init-page">
    <el-card class="init-card" shadow="never">
      <div class="init-header">
        <h1>系统初始化</h1>
        <p>欢迎使用云财务管理系统，请完成首次配置以开始使用。</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="Logo">
          <el-upload
            class="logo-upload"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            @change="handleLogoChange"
          >
            <div v-if="logoPreview" class="logo-preview">
              <img :src="logoPreview" alt="logo" />
            </div>
            <div v-else class="logo-placeholder">
              <el-icon class="logo-icon"><Picture /></el-icon>
              <span>点击上传 Logo</span>
            </div>
          </el-upload>
          <el-button
            v-if="logoPreview"
            link
            type="danger"
            class="logo-remove"
            @click="removeLogo"
          >
            移除
          </el-button>
        </el-form-item>

        <el-form-item label="系统名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入系统名称" />
        </el-form-item>

        <el-form-item label="数据库类型" prop="dbType">
          <el-select
            v-model="form.dbType"
            class="full-width"
            @change="handleDbTypeChange"
          >
            <el-option
              v-for="item in dbTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- SQLite：无需填写连接信息，交由后端处理 -->
        <el-form-item v-if="form.dbType === 'SQLite'">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            title="SQLite 无需额外配置，数据库将由后端自动创建并管理。"
          />
        </el-form-item>

        <!-- MySQL / PostgreSQL：拆分字段 -->
        <template v-else>
          <div class="field-row">
            <el-form-item label="主机地址" prop="dbHost" class="field-host">
              <el-input v-model="form.dbHost" placeholder="例如：localhost" />
            </el-form-item>
            <el-form-item label="端口" prop="dbPort" class="field-port">
              <el-input v-model="form.dbPort" placeholder="端口" />
            </el-form-item>
          </div>
          <el-form-item label="用户名" prop="dbUser">
            <el-input v-model="form.dbUser" placeholder="数据库用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="dbPassword">
            <el-input
              v-model="form.dbPassword"
              type="password"
              show-password
              placeholder="数据库密码"
            />
          </el-form-item>
          <el-form-item label="数据库名" prop="dbName">
            <el-input v-model="form.dbName" placeholder="数据库名称" />
          </el-form-item>
        </template>

        <el-form-item label="系统简介" prop="cloudProvider">
          <el-input
            v-model="form.cloudProvider"
            type="textarea"
            :rows="3"
            placeholder="请输入系统简介"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="full-width"
            :loading="submitting"
            native-type="submit"
          >
            完成初始化
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.init-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 32px;
}

.init-card {
  width: 100%;
  max-width: 520px;
  border-radius: 20px;
}

.init-header {
  margin-bottom: 24px;
  text-align: center;
}

.init-header h1 {
  margin: 0 0 8px;
  font-size: 26px;
}

.init-header p {
  margin: 0;
  color: #6b7280;
}

.full-width {
  width: 100%;
}

.field-row {
  display: flex;
  gap: 12px;
}

.field-host {
  flex: 1;
}

.field-port {
  width: 120px;
}

.logo-upload :deep(.el-upload) {
  display: block;
}

.logo-placeholder,
.logo-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border: 1px dashed #d0d7e2;
  border-radius: 16px;
  color: #909399;
  transition: border-color 0.2s;
}

.logo-placeholder:hover {
  border-color: #409eff;
  color: #409eff;
}

.logo-icon {
  margin-bottom: 8px;
  font-size: 28px;
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 16px;
}

.logo-remove {
  margin-left: 12px;
}
</style>
