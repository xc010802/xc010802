// server/api/posts/[id].get.ts
import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    // ✅ 添加 await
    const db = await getDb()

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
  } catch (error: any) {
    console.error('❌ 获取文章错误:', error)
    return { 
      success: false, 
      message: error.message || '获取文章失败' 
    }
  }
})