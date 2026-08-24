// server/utils/mail.ts
import nodemailer from 'nodemailer'

// 创建 transporter (以 QQ 邮箱为例)
const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true, 
  auth: {
    user: '1872120188@qq.com', // 替换为你的发件邮箱
    pass: 'srbwdynloubnefce'      // 替换为 SMTP 授权码，不是登录密码！
  }
})

export async function sendVerificationCode(email: string, code: string) {
  try {
    await transporter.sendMail({
      from: '"我的博客" <1872120188@qq.com>',
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