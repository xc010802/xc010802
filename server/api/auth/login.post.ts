// server/api/auth/login.post.ts
import { getDb } from '../../utils/db'
import { verifyPassword, generateToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    if (!email || !password) {
      return {
        success: false,
        error: '邮箱和密码不能为空'
      }
    }

    // ✅ 添加 await
    const db = await getDb()
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any

    if (!user) {
      return {
        success: false,
        error: '邮箱或密码错误'
      }
    }

    // 验证密码
    const isValid = verifyPassword(password, user.password)
    if (!isValid) {
      return {
        success: false,
        error: '邮箱或密码错误'
      }
    }

    // 生成 Token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role })

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          bio: user.bio,
          role: user.role,
        }
      }
    }
  } catch (error: any) {
    console.error('❌ 登录错误:', error)
    return {
      success: false,
      error: error.message || '登录失败，请稍后重试'
    }
  }
})