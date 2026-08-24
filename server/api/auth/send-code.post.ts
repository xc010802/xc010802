// server/api/auth/send-code.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { generateCode, saveCode } from '../../utils/auth'
import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    console.log('📝 收到发送验证码请求')
    
    const body = await readBody(event)
    const { email } = body

    if (!email) {
      return {
        success: false,
        error: '邮箱不能为空'
      }
    }

    // ✅ 添加 await
    const db = await getDb()

    // ✅ 每日限流：同一邮箱一天最多发送 10 次
    const todayCount = db.prepare(
      `SELECT COUNT(*) as count FROM email_codes 
       WHERE email = ? AND created_at >= date('now', 'start of day')`
    ).get(email)

    if (todayCount && todayCount.count >= 10) {
      return {
        success: false,
        error: '今日验证码发送次数已达上限（10次），请明天再试'
      }
    }

    // 生成验证码
    const code = generateCode()
    console.log('📧 生成的验证码:', code)

    // ✅ 添加 await
    await saveCode(email, code)
    console.log('✅ 验证码已保存到数据库')

    // 🔧 临时：开发环境不发送真实邮件，直接返回验证码
    // 生产环境再启用邮件发送
    const isDev = process.env.NODE_ENV === 'development'
    
    if (isDev) {
      console.log(`📧 [开发环境] 验证码 ${code} 已发送到 ${email}`)
      return {
        success: true,
        message: '验证码已发送',
        code: code // 开发环境直接返回验证码，方便测试
      }
    }

    // 生产环境：发送真实邮件
    // 如果配置了邮件服务，取消下面的注释
    
    const { sendVerificationCode } = await import('../../../server/api/auth/mail')
    const success = await sendVerificationCode(email, code)
    if (!success) {
      return {
        success: false,
        error: '邮件发送失败，请稍后重试'
      }
    }
    

    return {
      success: true,
      message: '验证码已发送至您的邮箱'
    }

  } catch (error: any) {
    console.error('❌ 发送验证码错误:', error)
    console.error('❌ 错误堆栈:', error.stack)
    return {
      success: false,
      error: error.message || '发送失败，请稍后重试'
    }
  }
})