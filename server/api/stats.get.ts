import { getDb } from '../utils/db'
import { requireAuth } from '../utils/auth'

export default defineEventHandler((event) => {
  requireAuth(event)
  const db = getDb()

  const totalPosts = (db.prepare('SELECT COUNT(*) as count FROM posts').get() as any).count
  const publishedPosts = (db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'published'").get() as any).count
  const draftPosts = (db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'draft'").get() as any).count
  const totalTags = db.prepare("SELECT DISTINCT value FROM posts, json_each(posts.tags)").all().length

  // 最近7天文章数
  const recentPosts = (db.prepare("SELECT COUNT(*) as count FROM posts WHERE created_at >= datetime('now', '-7 days')").get() as any).count

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
})