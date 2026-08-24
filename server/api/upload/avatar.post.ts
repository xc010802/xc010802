// server/api/user/profile.put.ts
import { getDb } from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    // ✅ 添加 await
    const user = await requireAuth(event)
    
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      return { success: false, error: '请选择文件' }
    }

    const file = formData[0]
    const ext = file.filename?.split('.').pop() || 'png'
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']
    
    if (!allowedExts.includes(ext.toLowerCase())) {
      return { success: false, error: '不支持的文件格式' }
    }

    const fileName = `avatar-${user.id}-${Date.now()}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    
    await writeFile(join(uploadDir, fileName), file.data)

    const avatarUrl = `/uploads/${fileName}`

    // ✅ 添加 await
    const db = await getDb()
    db.prepare('UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(avatarUrl, user.id)

    return { success: true, data: { avatar: avatarUrl } }

  } catch (error: any) {
    console.error('❌ 上传头像错误:', error)
    return { 
      success: false, 
      error: error.message || '上传失败' 
    }
  }
})