// composables/useApi.ts
export const useApi = () => {
  const getToken = () => {
    if (import.meta.client) {
      // 使用与前端其他位置一致的 key
      return localStorage.getItem('token') || ''
    }
    return ''
  }

  const setToken = (token: string) => {
    if (import.meta.client) {
      localStorage.setItem('token', token)
    }
  }

  const clearToken = () => {
    if (import.meta.client) {
      localStorage.removeItem('token')
    }
  }

  // ========== 唯一的 request 函数（在 useApi 内部） ==========
  const request = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
    const token = getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const res = await $fetch<{ success: boolean; data?: any; message?: string }>(url, {
        ...options,
        headers,
      })

      if (!res.success) {
        const err: any = new Error(res.message || '请求失败')
        err.data = res
        throw err
      }

      return res.data as T

    } catch (error: any) {
      if (error.data) {
        throw error
      }

      const backendMessage = error.data?.message || error.message || '网络异常'
      const cleanError: any = new Error(backendMessage)
      if (error.data) cleanError.data = error.data
      throw cleanError
    }
  }

  // ========== uploadFile ==========
  const uploadFile = async (url: string, file: File): Promise<any> => {
    const token = getToken()
    const formData = new FormData()
    formData.append('file', file)

    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    const res = await $fetch<{ success: boolean; data?: any; message?: string }>(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!res.success) {
      throw new Error(res.message || '上传失败')
    }
    return res.data
  }

  // ========== Auth ==========
  const login = (email: string, password: string) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

  const register = (email: string, password: string, nickname?: string, code?: string) => {
    return request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, nickname, code }) })
  }

  const sendCode = (email: string) =>
    request('/api/auth/send-code', { method: 'POST', body: JSON.stringify({ email }) })

  const getMe = () => request('/api/auth/me')

  // ========== User ==========
  const updateProfile = (data: { nickname?: string; bio?: string; avatar?: string }) =>
    request('/api/user/profile', { method: 'PUT', body: JSON.stringify(data) })

  const updatePassword = (oldPassword: string, newPassword: string) =>
    request('/api/user/password', { method: 'PUT', body: JSON.stringify({ oldPassword, newPassword }) })

  const uploadAvatar = (file: File) => uploadFile('/api/upload/avatar', file)

  // ========== Posts ==========
  const getPosts = (params?: { status?: string; tag?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString()
    return request(`/api/posts${query ? '?' + query : ''}`)
  }

  const getPost = (id: string | number) => request(`/api/posts/${id}`)
  const createPost = (data: any) => request('/api/posts', { method: 'POST', body: JSON.stringify(data) })
  const updatePost = (id: string | number, data: any) => {
    return request(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  const deletePost = (id: string | number) => request(`/api/posts/${id}`, { method: 'DELETE' })

  // ========== Stats ==========
  const getStats = () => request('/api/stats')

  // ========== ✅ 唯一的 askAI（只在这里定义一次） ==========
  const askAI = async (prompt: string, systemPrompt?: string): Promise<string> => {
    return await request('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, systemPrompt })
    })
  }

  // ========== ✅ 导出所有函数（askAI 必须在这里） ==========
  return {
    getToken,
    setToken,
    clearToken,
    request,
    login,
    register,
    sendCode,
    getMe,
    updateProfile,
    updatePassword,
    uploadAvatar,
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    getStats,
    askAI  // ✅ 关键：必须在这里导出！
  }
}
