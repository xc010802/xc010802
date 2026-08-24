import { getDb } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const { nickname, bio, avatar } = body

  const db = getDb()

  const updates: string[] = []
  const values: any[] = []

  if (nickname !== undefined) {
    if (typeof nickname !== 'string' || nickname.trim().length === 0) {
      throw createError({ statusCode: 400, message: '昵称不能为空' })
    }
    updates.push('nickname = ?')
    values.push(nickname.trim())
  }

  if (bio !== undefined) {
    if (typeof bio !== 'string' || bio.length > 200) {
      throw createError({ statusCode: 400, message: '个人简介不能超过200字' })
    }
    updates.push('bio = ?')
    values.push(bio)
  }

  if (avatar !== undefined) {
    if (typeof avatar !== 'string' || avatar.length === 0) {
      throw createError({ statusCode: 400, message: '头像地址不能为空' })
    }
    updates.push('avatar = ?')
    values.push(avatar)
  }

  if (updates.length === 0) {
    throw createError({ statusCode: 400, message: '没有要更新的字段' })
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(user.id)

  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values)

  const updated = db.prepare('SELECT id, email, nickname, avatar, bio, role FROM users WHERE id = ?').get(user.id)

  return { success: true, data: updated }
})

// // 改动说明
// 昵称校验：防止传入空字符串或纯空格，自动 trim() 去除首尾空格。
// 简介长度限制：限制 bio 最多 200 字，防止恶意写入超长内容。
// 头像字段校验：确保 avatar 是有效字符串，防止写入空值覆盖原有头像。
// 这个接口是更新用户资料的，和验证码无关，不需要加验证码逻辑。
// 到这里，你发过来的所有接口文件都改完了。整理一下目前的进度：