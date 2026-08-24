// server/api/auth/register.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { getDb } from '../../utils/db'
import { hashPassword, verifyCode } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password, nickname, code } = body

    // 1. 基础校验
    if (!email || !password || !code) {
      return {
        success: false,
        error: '缺少必要参数'
      }
    }
    if (password.length < 6) {
      return {
        success: false,
        error: '密码至少6位'
      }
    }

    // 2. 校验验证码
    const isValidCode = verifyCode(email, code)
    if (!isValidCode) {
      return {
        success: false,
        error: '验证码错误或已过期'
      }
    }

    // ✅ 添加 await
    const db = await getDb()

    // 3. 检查是否已注册
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) {
      return {
        success: false,
        error: '该邮箱已注册'
      }
    }

    // 4. 创建用户（密码加密后存入）
    // 如果 hashPassword 是同步的，去掉 await
    const hashedPwd = hashPassword(password)

    const result = db.prepare(`
      INSERT INTO users (email, password, nickname, role, created_at, updated_at)
      VALUES (?, ?, ?, 'admin', datetime('now'), datetime('now'))
    `).run(email, hashedPwd, nickname || '博主')

    const userId = result.lastInsertRowid

    // 5. 注册成功
    return {
      success: true,
      data: {
        user: {
          id: userId,
          email,
          nickname: nickname || '博主',
          avatar: '/uploads/default-avatar.svg',
          bio: '全栈开发者 / 开源爱好者 / 终身学习者',
          role: 'admin',
        }
      }
    }
  } catch (error: any) {
    console.error('❌ 注册错误:', error)
    return {
      success: false,
      error: error.message || '服务器内部错误'
    }
  }
})