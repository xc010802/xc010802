// server/api/posts/[id].delete.ts
import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  if (!id) {
    return { success: false, message: '缺少文章ID' }
  }

  const db = getDb()

  try {
    // 检查文章是否存在
    const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(id)

    if (!existing) {
      return { success: false, message: '文章不存在' }
    }

    // 执行删除
    const stmt = db.prepare('DELETE FROM posts WHERE id = ?')
    stmt.run(id)

    // 直接返回成功（不检查 changes）
    return { success: true, message: '删除成功' }

  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || '删除失败' 
    }
  }
})