import { defineEventHandler, readBody, createError } from 'h3'
import { generateCode, saveCode } from '../../utils/auth'
import { sendVerificationCode } from '../../../server/api/auth/mail'
import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: '邮箱不能为空' })
  }

  // ✅ 每日限流：同一邮箱一天最多发送 50 次
  const db = getDb()
  // ✅ 全局每日限流：所有邮箱加起来一天最多 50 次
  const todayCount = db.prepare(
    `SELECT COUNT(*) as count FROM email_codes 
   WHERE created_at >= date('now', 'start of day')`
  ).get()

  if (todayCount && todayCount.count >= 50) {
    throw createError({
      statusCode: 429,
      statusMessage: '今日验证码发送次数已达上限，请明天再试'
    })
  }

  const code = generateCode()
  saveCode(email, code)

  // 调用真实发送
  const success = await sendVerificationCode(email, code)

  if (!success) {
    throw createError({ statusCode: 500, statusMessage: '邮件发送失败，请稍后重试' })
  }

  return { message: '验证码已发送至您的邮箱' }
})