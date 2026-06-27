import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
  checkout as checkoutApi,
} from '../api/shop'

// 购物车数据存于后端，本 store 仅做内存缓存与操作封装
export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)

  // 购物车商品种类数（用于角标）
  const count = computed(() => items.value.length)
  // 商品总件数
  const totalQuantity = computed(() =>
    items.value.reduce((sum, it) => sum + it.quantity, 0),
  )
  // 合计金额
  const totalAmount = computed(() =>
    items.value.reduce((sum, it) => sum + it.price * it.quantity, 0),
  )

  async function refresh() {
    loading.value = true
    try {
      const res = await getCart()
      items.value = res.items || []
    } finally {
      loading.value = false
    }
  }

  async function add(productId, quantity = 1) {
    await addToCartApi(productId, quantity)
    await refresh()
  }

  async function updateQuantity(productId, quantity) {
    await updateCartItemApi(productId, quantity)
    await refresh()
  }

  async function remove(productId) {
    await removeCartItemApi(productId)
    await refresh()
  }

  // 结算成功后清空本地缓存并返回订单
  async function checkout(payMethod = 'balance') {
    const res = await checkoutApi(payMethod)
    items.value = []
    return res.order
  }

  function clear() {
    items.value = []
  }

  return {
    items,
    loading,
    count,
    totalQuantity,
    totalAmount,
    refresh,
    add,
    updateQuantity,
    remove,
    checkout,
    clear,
  }
})
