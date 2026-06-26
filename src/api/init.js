import request from './request'

// 查询系统初始化状态，后端返回 { initialized: boolean }
export function getInitStatus() {
  return request.get('/init')
}

// 提交初始化配置，logo 以文件形式上传，使用 multipart/form-data
// SQLite 仅提交 dbType，连接细节交由后端处理；其余提交 dbHost/dbPort/dbUser/dbPassword/dbName
export function submitInit(payload) {
  const formData = new FormData()
  if (payload.logo) {
    formData.append('logo', payload.logo)
  }
  formData.append('name', payload.name)
  formData.append('dbType', payload.dbType)
  formData.append('cloudProvider', payload.cloudProvider)

  if (payload.dbType !== 'SQLite') {
    formData.append('dbHost', payload.dbHost)
    formData.append('dbPort', payload.dbPort)
    formData.append('dbUser', payload.dbUser)
    formData.append('dbPassword', payload.dbPassword)
    formData.append('dbName', payload.dbName)
  }

  return request.post('/init', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 创建管理员账户，以 JSON 形式提交
export function createAdmin(payload) {
  return request.post('/admin', {
    nickname: payload.nickname,
    username: payload.username,
    email: payload.email,
    password: payload.password,
  })
}
