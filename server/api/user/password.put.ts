// server/api/user/password.put.ts
import { getDb } from '../../utils/db'
import { requireAuth, verifyPassword, hashPassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // ✅ 添加 await
    const user = await requireAuth(event)
    const body = await readBody(event)
    const { oldPassword, newPassword } = body

    if (!oldPassword || !newPassword) {
      return { success: false, error: '请填写完整' }
    }
    if (newPassword.length < 6) {
      return { success: false, error: '新密码至少6位' }
    }

    // ✅ 添加 await
    const db = await getDb()
    const currentUser = db.prepare('SELECT password FROM users WHERE id = ?').get(user.id) as any

    if (!currentUser) {
      return { success: false, error: '用户不存在' }
    }

    if (!verifyPassword(oldPassword, currentUser.password)) {
      return { success: false, error: '当前密码错误' }
    }

    db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hashPassword(newPassword), user.id)

    return { success: true, message: '密码修改成功' }

  } catch (error: any) {
    console.error('❌ 修改密码错误:', error)
    return { 
      success: false, 
      error: error.message || '修改密码失败' 
    }
  }
})