import { getDb } from '../../utils/db'
import { verifyPassword, generateToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, message: '邮箱和密码不能为空' })
  }

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any

  if (!user) {
    throw createError({ statusCode: 401, message: '邮箱或密码错误' })
  }

  // 验证密码
  const isValid = verifyPassword(password, user.password)
  if (!isValid) {
    throw createError({ statusCode: 401, message: '邮箱或密码错误' })
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
})