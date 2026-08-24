import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { getDb } from './db'
import type { H3Event } from 'h3'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
const TOKEN_EXPIRES = '7d'

export interface JwtPayload {
  userId: number
  email: string
  role: string
}

// 密码加密
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

// 密码验证
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

// 生成 Token
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES })
}

// 验证 Token
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

// 从请求中获取当前用户
export function getCurrentUser(event: H3Event) {
  const authHeader = getHeader(event, 'Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  
  const token = authHeader.slice(7)
  const payload = verifyToken(token)
  if (!payload) return null
  
  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId) as any
  return user || null
}

// 要求登录中间件
export function requireAuth(event: H3Event) {
  const user = getCurrentUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: '未登录或登录已过期' })
  }
  return user
}

// 1. 生成6位随机验证码
export function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 2. 保存验证码到数据库
export function saveCode(email: string, code: string) {
  const db = getDb()
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5分钟后过期

  // 删除旧验证码
  db.prepare('DELETE FROM email_codes WHERE email = ?').run(email)
  
  // 插入新验证码
  db.prepare(`
    INSERT INTO email_codes (email, code, expires_at) 
    VALUES (?, ?, ?)
  `).run(email, code, expiresAt)
}

// 3. 校验验证码 (校验通过即删除，防止重复使用)
export function verifyCode(email: string, code: string): boolean {
  const db = getDb()
  const record = db.prepare('SELECT * FROM email_codes WHERE email = ? AND code = ?').get(email, code) as any

  if (!record) return false
  
  // 检查是否过期
  if (record.expires_at < Date.now()) {
    db.prepare('DELETE FROM email_codes WHERE id = ?').run(record.id)
    return false
  }

  // 校验成功，删除该条记录
  db.prepare('DELETE FROM email_codes WHERE id = ?').run(record.id)
  return true
}