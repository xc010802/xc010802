import { getDb } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const { title, content, description, cover, tags, status } = body

  if (!title) {
    return { success: false, message: '标题不能为空' }
  }

  const db = getDb()
  
  // 生成 slug
  const slug = body.slug || title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36)

  const postStatus = status || 'draft'
  const publishedAt = postStatus === 'published' ? new Date().toISOString() : null
  const now = new Date().toISOString()

  try {
    // 插入文章
    const stmt = db.prepare(`
      INSERT INTO posts (title, slug, content, description, cover, tags, status, author_id, published_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      title, 
      slug, 
      content || '', 
      description || '', 
      cover || '', 
      JSON.stringify(tags || []), 
      postStatus, 
      user.id, 
      publishedAt, 
      now, 
      now
    )

    // 使用 slug 查询刚创建的文章
    let post = null
    try {
      post = db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug)
    } catch (_) {
      // 忽略查询错误
    }

    // 如果查询成功，返回数据
    if (post) {
      return { 
        success: true, 
        data: { 
          ...post, 
          tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || []) 
        } 
      }
    }

    // 查询失败但插入成功，手动构造返回数据
    return { 
      success: true, 
      data: { 
        title, 
        slug, 
        content: content || '', 
        description: description || '', 
        cover: cover || '', 
        tags: tags || [],
        status: postStatus, 
        author_id: user.id, 
        published_at: publishedAt, 
        created_at: now, 
        updated_at: now 
      } 
    }

  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || '服务器错误' 
    }
  }
})