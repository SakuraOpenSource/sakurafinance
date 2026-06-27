import request from './request'

// 用户注册，UUID 由后端生成，成功后返回 { token, user }
export function register(payload) {
  return request.post('/register', {
    nickname: payload.nickname,
    username: payload.username,
    email: payload.email,
    password: payload.password,
    qq: payload.qq,
    phone: payload.phone,
  })
}

// 普通用户登录，成功后返回 { token, user }
export function login(payload) {
  return request.post('/login', {
    username: payload.username,
    password: payload.password,
  })
}

// 获取当前登录用户信息，需携带 token
export function fetchMe() {
  return request.get('/me')
}
