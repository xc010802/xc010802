interface UserInfo {
  id: number
  email: string
  nickname: string
  avatar: string
  bio: string
  role: string
}

export const useUser = () => {
  const user = useState<UserInfo | null>('user', () => null)
  const isLoggedIn = useState<boolean>('isLoggedIn', () => false)
  const { login: apiLogin, register: apiRegister, getMe, updateProfile: apiUpdateProfile, updatePassword: apiUpdatePassword, uploadAvatar: apiUploadAvatar, setToken, clearToken } = useApi()

  const login = async (email: string, password: string) => {
    try {
      const data = await apiLogin(email, password)
      setToken(data.token)
      user.value = data.user
      isLoggedIn.value = true
      return true
    } catch (e: any) {
      throw new Error(e.message || '登录失败')
    }
  }

  const register = async (email: string, password: string, nickname?: string) => {
    try {
      const data = await apiRegister(email, password, nickname)
      setToken(data.token)
      user.value = data.user
      isLoggedIn.value = true
      return true
    } catch (e: any) {
      throw new Error(e.message || '注册失败')
    }
  }

  const logout = () => {
    clearToken()
    user.value = null
    isLoggedIn.value = false
  }

  const fetchUser = async () => {
    try {
      const data = await getMe()
      user.value = data
      isLoggedIn.value = true
    } catch {
      logout()
    }
  }

  const updateProfile = async (updates: Partial<UserInfo>) => {
    const data = await apiUpdateProfile(updates)
    user.value = data
  }

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    await apiUpdatePassword(oldPassword, newPassword)
  }

  const uploadAvatar = async (file: File) => {
    const data = await apiUploadAvatar(file)
    if (user.value) {
      user.value.avatar = data.avatar
    }
  }

  const initFromStorage = async () => {
    const { getToken } = useApi()
    if (getToken()) {
      await fetchUser()
    }
  }

  return { user, isLoggedIn, login, register, logout, fetchUser, updateProfile, updatePassword, uploadAvatar, initFromStorage }
}