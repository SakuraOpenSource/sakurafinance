import request from './request'

// 管理员登录，需带入口后缀 slug，成功后返回 { token, user }
export function adminLogin(payload) {
  return request.post('/admin/login', {
    username: payload.username,
    password: payload.password,
    slug: payload.slug,
  })
}

// 查看当前管理后台登录入口后缀，后端返回 { slug }
export function getAdminSlug() {
  return request.get('/admin/slug')
}

// ---- 分类管理 ----

export function createCategory(payload) {
  return request.post('/admin/categories', { name: payload.name, sort: payload.sort })
}

export function updateCategory(id, payload) {
  return request.put(`/admin/categories/${id}`, { name: payload.name, sort: payload.sort })
}

export function deleteCategory(id) {
  return request.delete(`/admin/categories/${id}`)
}

// ---- 商品管理 ----

// 获取全部商品（含下架），后端返回 { products: [...] }
export function getAdminProducts(categoryId) {
  return request.get('/admin/products', {
    params: categoryId ? { category: categoryId } : {},
  })
}

export function createProduct(payload) {
  return request.post('/admin/products', payload)
}

export function updateProduct(id, payload) {
  return request.put(`/admin/products/${id}`, payload)
}

export function deleteProduct(id) {
  return request.delete(`/admin/products/${id}`)
}

// ---- 支付配置 ----

// 读取支付方式配置，后端返回 { paymentMethods: [...] }
export function getPaymentMethods() {
  return request.get('/admin/payment')
}

// 保存支付方式配置
export function savePaymentMethods(paymentMethods) {
  return request.put('/admin/payment', { paymentMethods })
}

// ---- 管理员账户 ----

// 获取管理员列表，后端返回 { admins: [...] }
export function getAdmins() {
  return request.get('/admin/admins')
}

// 创建其他管理员
export function createAdminAccount(payload) {
  return request.post('/admin/admins', {
    nickname: payload.nickname,
    username: payload.username,
    email: payload.email,
    password: payload.password,
  })
}

// ---- 用户管理与充值 ----

// 获取注册用户列表，后端返回 { users: [...] }
export function getUsers() {
  return request.get('/admin/users')
}

// 管理员给指定用户手动充值，后端返回 { balance }
export function rechargeUser(userId, amount) {
  return request.post(`/admin/users/${userId}/recharge`, { amount })
}

// 修改用户昵称与用户名
export function updateUser(userId, payload) {
  return request.put(`/admin/users/${userId}`, {
    nickname: payload.nickname,
    username: payload.username,
  })
}

// 重置用户密码
export function resetUserPassword(userId, password) {
  return request.put(`/admin/users/${userId}/password`, { password })
}

// 删除用户
export function deleteUser(userId) {
  return request.delete(`/admin/users/${userId}`)
}
