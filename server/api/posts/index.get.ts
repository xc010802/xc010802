// server/api/posts/index.get.ts
import { getDb } from '../../utils/db'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const status = query.status as string || 'published'
  const tag = query.tag as string
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const offset = (page - 1) * limit

  const db = getDb()

  let where = ''
  const params: any[] = []

  if (status !== 'all') {
    where = 'WHERE status = ?'
    params.push(status)
  }

  if (tag) {
    where += (where ? ' AND' : 'WHERE') + ' tags LIKE ?'
    params.push(`%${tag}%`)
  }

  const total = (db.prepare(`SELECT COUNT(*) as count FROM posts ${where}`).get(...params) as any).count
  
  // ✅ 添加 content 字段
  const posts = db.prepare(`
    SELECT id, title, slug, content, description, cover, tags, status, created_at, updated_at, published_at
    FROM posts ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset)

  return {
    success: true,
    data: {
      posts: posts.map((p: any) => ({ ...p, tags: JSON.parse(p.tags || '[]') })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    }
  }
})