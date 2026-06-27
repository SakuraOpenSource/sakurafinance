import request from './request'

// ---- 商品浏览（公开）----

// 获取分类列表，后端返回 { categories: [...] }
export function getCategories() {
  return request.get('/categories')
}

// 获取商品列表，可按分类过滤，后端返回 { products: [...] }
export function getProducts(categoryId) {
  return request.get('/products', {
    params: categoryId ? { category: categoryId } : {},
  })
}

// 获取前台可用支付方式（仅 type/name），后端返回 { paymentMethods: [...] }
export function getPublicPaymentMethods() {
  return request.get('/payment-methods')
}

// ---- 购物车（需登录）----

// 获取当前用户购物车，后端返回 { items: [...] }
export function getCart() {
  return request.get('/cart')
}

// 加入购物车（同商品累加数量）
export function addToCart(productId, quantity = 1) {
  return request.post('/cart', { productId, quantity })
}

// 设置购物车某商品数量；数量 <=0 等同移除
export function updateCartItem(productId, quantity) {
  return request.put(`/cart/${productId}`, { quantity })
}

// 移除购物车某商品
export function removeCartItem(productId) {
  return request.delete(`/cart/${productId}`)
}

// ---- 结算与订单（需登录）----

// 结算购物车，payMethod 为 'balance' 或已启用的网关 type，后端返回 { order }
export function checkout(payMethod = 'balance') {
  return request.post('/checkout', { payMethod })
}

// 自助充值，payMethod 为已启用的网关 type，后端返回 { balance }
export function recharge(amount, payMethod) {
  return request.post('/recharge', { amount, payMethod })
}

// 获取订单列表，后端返回 { orders: [...] }
export function getOrders() {
  return request.get('/orders')
}

// 获取云服务器实例列表，后端返回 { instances: [...] }
export function getInstances() {
  return request.get('/instances')
}
