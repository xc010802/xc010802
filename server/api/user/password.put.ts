import { getDb } from '../../utils/db'
import { requireAuth, verifyPassword, hashPassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const { oldPassword, newPassword } = body

  if (!oldPassword || !newPassword) {
    throw createError({ statusCode: 400, message: '请填写完整' })
  }
  if (newPassword.length < 6) {
    throw createError({ statusCode: 400, message: '新密码至少6位' })
  }

  const db = getDb()
  const currentUser = db.prepare('SELECT password FROM users WHERE id = ?').get(user.id) as any

  if (!verifyPassword(oldPassword, currentUser.password)) {
    throw createError({ statusCode: 400, message: '当前密码错误' })
  }

  db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(hashPassword(newPassword), user.id)

  return { success: true, message: '密码修改成功' }
})