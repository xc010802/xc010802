import { requireAuth } from '../../utils/auth'

export default defineEventHandler((event) => {
  const user = requireAuth(event)

  if (!user) {
    throw createError({ statusCode: 404, message: '用户不存在' })
  }

  return {
    success: true,
    data: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      created_at: user.created_at,
    }
  }
})