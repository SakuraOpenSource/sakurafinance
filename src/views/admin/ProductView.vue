<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategories } from '../../api/shop'
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../api/admin'

const products = ref([])
const categories = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref()
const editingId = ref(null)

const blankForm = () => ({
  categoryId: null,
  name: '',
  description: '',
  cpu: 1,
  ram: 2,
  disk: 40,
  bandwidth: 1,
  price: 0,
  stock: 0,
  status: 'on',
})
const form = reactive(blankForm())

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

// 分类 id -> 名称，用于表格展示
const categoryMap = computed(() => {
  const m = {}
  categories.value.forEach((c) => (m[c.id] = c.name))
  return m
})

async function load() {
  loading.value = true
  try {
    const [pRes, cRes] = await Promise.all([getAdminProducts(), getCategories()])
    products.value = pRes.products || []
    categories.value = cRes.categories || []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  Object.assign(form, blankForm())
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  Object.assign(form, {
    categoryId: row.categoryId,
    name: row.name,
    description: row.description,
    cpu: row.cpu,
    ram: row.ram,
    disk: row.disk,
    bandwidth: row.bandwidth,
    price: row.price,
    stock: row.stock,
    status: row.status,
  })
  dialogVisible.value = true
}

async function submit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    if (editingId.value) {
      await updateProduct(editingId.value, { ...form })
      ElMessage.success('已更新')
    } else {
      await createProduct({ ...form })
      ElMessage.success('已创建')
    }
    dialogVisible.value = false
    await load()
  } catch {
    // 拦截器已提示
  } finally {
    submitting.value = false
  }
}

async function remove(row) {
  try {
    await ElMessageBox.confirm(`确认删除商品「${row.name}」？`, '提示', {
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteProduct(row.id)
    ElMessage.success('已删除')
    await load()
  } catch {
    // 拦截器已提示
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="toolbar">
      <h2>商品管理</h2>
      <el-button type="primary" @click="openCreate">新建商品</el-button>
    </div>

    <el-table v-loading="loading" :data="products" style="width: 100%">
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column label="分类" width="120">
        <template #default="{ row }">{{ categoryMap[row.categoryId] || '-' }}</template>
      </el-table-column>
      <el-table-column label="规格" min-width="200">
        <template #default="{ row }">
          {{ row.cpu }}核 / {{ row.ram }}GB / {{ row.disk }}GB / {{ row.bandwidth }}Mbps
        </template>
      </el-table-column>
      <el-table-column label="价格" width="100">
        <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="90" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 'on' ? 'success' : 'info'">
            {{ row.status === 'on' ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button text type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button text type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑商品' : '新建商品'"
      width="560px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="c in categories"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <div class="spec-row">
          <el-form-item label="CPU(核)">
            <el-input-number v-model="form.cpu" :min="1" />
          </el-form-item>
          <el-form-item label="内存(GB)">
            <el-input-number v-model="form.ram" :min="1" />
          </el-form-item>
        </div>
        <div class="spec-row">
          <el-form-item label="硬盘(GB)">
            <el-input-number v-model="form.disk" :min="1" />
          </el-form-item>
          <el-form-item label="带宽(Mbps)">
            <el-input-number v-model="form.bandwidth" :min="1" />
          </el-form-item>
        </div>
        <div class="spec-row">
          <el-form-item label="价格(元)">
            <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" />
          </el-form-item>
          <el-form-item label="库存">
            <el-input-number v-model="form.stock" :min="0" />
          </el-form-item>
        </div>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            active-value="on"
            inactive-value="off"
            active-text="上架"
            inactive-text="下架"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
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

.spec-row {
  display: flex;
  gap: 16px;
}

.spec-row .el-form-item {
  flex: 1;
}
</style>
