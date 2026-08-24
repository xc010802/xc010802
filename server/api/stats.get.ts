// server/api/stats/index.get.ts
import { getDb } from '../utils/db'
import { requireAuth } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // ✅ 添加 await
    const user = await requireAuth(event)
    const db = await getDb()

    // 总文章数
    const totalResult = db.prepare('SELECT COUNT(*) as count FROM posts').get()
    const totalPosts = totalResult?.count || 0

    // 已发布文章数
    const publishedResult = db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'published'").get()
    const publishedPosts = publishedResult?.count || 0

    // 草稿数
    const draftResult = db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'draft'").get()
    const draftPosts = draftResult?.count || 0

    // 近7天新增
    const recentResult = db.prepare(`
      SELECT COUNT(*) as count FROM posts 
      WHERE created_at >= datetime('now', '-7 days')
    `).get()
    const recentPosts = recentResult?.count || 0

    // ✅ 修复：使用更兼容的方式统计标签
    // 方案1：如果 sql.js 支持 json_each
    let totalTags = 0
    try {
      const tagsResult = db.prepare("SELECT DISTINCT value FROM posts, json_each(posts.tags)").all()
      totalTags = tagsResult?.length || 0
    } catch (e) {
      // 方案2：如果 json_each 不支持，用 JavaScript 统计
      const allPosts = db.prepare("SELECT tags FROM posts WHERE tags IS NOT NULL AND tags != '[]'").all()
      const tagSet = new Set()
      allPosts.forEach((row: any) => {
        try {
          const tags = JSON.parse(row.tags || '[]')
          tags.forEach((t: string) => tagSet.add(t))
        } catch (err) {}
      })
      totalTags = tagSet.size
    }

    return {
      success: true,
      data: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalTags,
        recentPosts,
      }
    }
  } catch (error: any) {
    console.error('❌ 获取统计数据失败:', error)
    return {
      success: false,
      error: error.message || '获取统计数据失败'
    }
  }
})