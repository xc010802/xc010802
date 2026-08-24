// server/api/posts/[id].put.ts
import { getDb } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)


  const db = getDb()

  // 检查文章是否存在
  let existing = null
  try {
    existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(id)
  } catch (_) {}

  if (!existing) {
    return { success: false, message: '文章不存在' }
  }

  // 构建更新字段
  const updates: string[] = []
  const values: any[] = []

  if (body.title !== undefined) { updates.push('title = ?'); values.push(body.title) }
  if (body.content !== undefined) { updates.push('content = ?'); values.push(body.content) }
  if (body.description !== undefined) { updates.push('description = ?'); values.push(body.description) }
  if (body.cover !== undefined) { updates.push('cover = ?'); values.push(body.cover) }
  if (body.tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(body.tags)) }
  if (body.status !== undefined) {
    updates.push('status = ?')
    values.push(body.status)
    if (body.status === 'published' && existing.status !== 'published') {
      updates.push('published_at = ?')
      values.push(new Date().toISOString())
    }
  }

  if (updates.length === 0) {
    return { success: false, message: '没有要更新的字段' }
  }

  updates.push('updated_at = ?')
  values.push(new Date().toISOString())
  values.push(id)


  try {
    const stmt = db.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`)
    stmt.run(...values)

    // ✅ 修复：不再检查 changes，直接查询更新后的数据
    const updated = db.prepare('SELECT * FROM posts WHERE id = ?').get(id)

    if (!updated) {
      return { success: false, message: '更新后查询数据失败' }
    }

    return {
      success: true,
      data: {
        ...updated,
        tags: updated.tags ? JSON.parse(updated.tags) : []
      }
    }

  } catch (error: any) {

    return { 
      success: false, 
      message: error.message || '更新失败' 
    }
  }
})