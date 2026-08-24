// server/api/posts/[id].get.ts
import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const db = getDb()

  // ✅ 确保选择了所有字段，包括 content
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id)

  if (!post) {
    return { success: false, message: '文章不存在' }
  }

  return {
    success: true,
    data: {
      ...post,
      tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || [])
    }
  }
})