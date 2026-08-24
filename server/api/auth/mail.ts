// server/api/auth/mail.ts
import nodemailer from 'nodemailer'

// 使用环境变量配置 SMTP，避免将凭证写入代码仓库。
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.qq.com'
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465
const SMTP_SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS

let transporter: any = null
if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  })
} else {
  console.warn('[mail] SMTP 配置未完全，邮件发送将会失败。请通过环境变量 SMTP_USER/SMTP_PASS 配置凭证。')
}

export async function sendVerificationCode(email: string, code: string) {
  if (!transporter) {
    console.error('[mail] 未配置 transporter，无法发送邮件')
    return false
  }

  try {
    await transporter.sendMail({
      from: `"我的博客" <${SMTP_USER}>`,
      to: email,
      subject: '博客登录验证码',
      html: `
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>欢迎回来！</h2>
          <p>您的验证码是：</p>
          <h1 style="color: #5b21b6; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          <p>验证码 5 分钟内有效，请勿泄露给他人。</p>
        </div>
      `
    })
    return true
  } catch (error) {
    console.error('邮件发送失败:', error)
    return false
  }
}
