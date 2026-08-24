// server/api/posts/[id].delete.ts
import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id

    if (!id) {
      return { success: false, message: '缺少文章ID' }
    }

    // ✅ 添加 await
    const db = await getDb()

    // 检查文章是否存在
    const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(id)

    if (!existing) {
      return { success: false, message: '文章不存在' }
    }

    // 执行删除
    const stmt = db.prepare('DELETE FROM posts WHERE id = ?')
    stmt.run(id)

    return { success: true, message: '删除成功' }

  } catch (error: any) {
    console.error('❌ 删除文章错误:', error)
    return { 
      success: false, 
      message: error.message || '删除失败' 
    }
  }
})