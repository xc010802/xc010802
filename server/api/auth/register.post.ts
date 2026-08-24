import { defineEventHandler, readBody, createError } from 'h3'
import { getDb } from '../../utils/db'
import { hashPassword, verifyCode } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password, nickname, code } = body

    // 1. 基础校验
    if (!email || !password || !code) {
      throw createError({ statusCode: 400, statusMessage: '缺少必要参数' })
    }
    if (password.length < 6) {
      throw createError({ statusCode: 400, statusMessage: '密码至少6位' })
    }

    // 2. 校验验证码
    if (!verifyCode(email, code)) {
      throw createError({ statusCode: 400, statusMessage: '验证码错误或已过期' })
    }

    const db = getDb()

    // 3. 检查是否已注册
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) {
      throw createError({ statusCode: 409, statusMessage: '该邮箱已注册' })
    }

    // 4. 创建用户（密码加密后存入）
    const hashedPwd = await hashPassword(password)

    // console.log('准备插入数据:', email, nickname, typeof hashedPwd)

    const result = db.prepare(`
      INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)
    `).run(email, hashedPwd, nickname || '博主')

    const userId = result.lastInsertRowid as number

    // 5. 注册成功，不返回 Token，引导用户去登录
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
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误: ' + (error.message || '未知错误')
    })
  }
})