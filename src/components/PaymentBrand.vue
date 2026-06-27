<script setup>
// 支付品牌标识：按网关 type 渲染对应品牌色与简称，无需外部图片资源。
defineProps({
  type: { type: String, default: '' },
  size: { type: Number, default: 40 },
})

// 各网关的品牌色与展示简称
const brands = {
  balance: { label: '余', color: '#10b981', name: '余额支付' },
  alipay: { label: '支', color: '#1677ff', name: '支付宝' },
  wechat: { label: '微', color: '#07c160', name: '微信支付' },
  alipayplus: { label: 'A+', color: '#1677ff', name: 'Alipay+' },
  stripe: { label: 'S', color: '#635bff', name: 'Stripe' },
}

function brand(type) {
  return brands[type] || { label: '¥', color: '#6b7280', name: type }
}
</script>

<template>
  <span
    class="pay-logo"
    :style="{
      width: size + 'px',
      height: size + 'px',
      background: brand(type).color,
      fontSize: size * 0.4 + 'px',
    }"
    :title="brand(type).name"
  >
    {{ brand(type).label }}
  </span>
</template>

<style scoped>
.pay-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #fff;
  font-weight: 700;
  line-height: 1;
}
</style>
