import request from './request'

// 更新当前登录用户的资料，成功后返回 { user }
export function updateProfile(payload) {
  return request.put('/me', {
    nickname: payload.nickname,
    email: payload.email,
    qq: payload.qq,
    phone: payload.phone,
  })
}
