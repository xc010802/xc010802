<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold"><span class="gradient-text">个人中心</span></h1>
      <p class="text-gray-400 mt-2">管理你的个人信息和账号设置</p>
    </div>

    <div class="space-y-6">
      <!-- 头像 -->
      <section class="card p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
          <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          头像
        </h2>
        <div class="flex items-center gap-6">
          <img :src="user?.avatar || '/uploads/default-avatar.svg'" alt="avatar" class="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/10" />
          <div>
            <label class="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              上传新头像
              <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
            </label>
            <p class="text-gray-500 text-xs mt-2">支持 JPG/PNG/GIF/SVG</p>
          </div>
        </div>
      </section>

      <!-- 昵称 -->
      <section class="card p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
          <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          昵称
        </h2>
        <div class="flex gap-3">
          <input v-model="nicknameForm" type="text" maxlength="20" class="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-white" placeholder="输入新昵称" />
          <button @click="saveNickname" class="px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition">保存</button>
        </div>
        <p v-if="nicknameMsg" class="text-green-400 text-sm mt-2">{{ nicknameMsg }}</p>
      </section>

      <!-- 个人介绍 -->
      <section class="card p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
          <svg class="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          个人介绍
        </h2>
        <textarea v-model="bioForm" rows="4" maxlength="200" class="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition text-white" placeholder="介绍一下自己吧..."></textarea>
        <div class="flex justify-between items-center mt-3">
          <span class="text-gray-500 text-xs">{{ bioForm.length }}/200</span>
          <button @click="saveBio" class="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition">保存</button>
        </div>
        <p v-if="bioMsg" class="text-green-400 text-sm mt-2">{{ bioMsg }}</p>
      </section>

      <!-- 修改密码 -->
      <section class="card p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
          <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          修改密码
        </h2>
        <div class="space-y-3">
          <input v-model="pwdForm.oldPwd" type="password" class="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-white" placeholder="当前密码" />
          <input v-model="pwdForm.newPwd" type="password" minlength="6" class="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-white" placeholder="新密码（至少6位）" />
          <input v-model="pwdForm.confirmPwd" type="password" class="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-white" placeholder="确认新密码" />
          <button @click="savePassword" class="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition">修改密码</button>
          <p v-if="pwdMsg" :class="pwdSuccess ? 'text-green-400' : 'text-red-400'" class="text-sm mt-2">{{ pwdMsg }}</p>
        </div>
      </section>

      <!-- 退出 -->
      <section class="card p-6">
        <button @click="handleLogout" class="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          退出登录
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, isLoggedIn, updateProfile, updatePassword, uploadAvatar, logout, initFromStorage } = useUser()
const router = useRouter()

const nicknameForm = ref('')
const bioForm = ref('')
const nicknameMsg = ref('')
const bioMsg = ref('')
const pwdMsg = ref('')
const pwdSuccess = ref(false)
const pwdForm = reactive({ oldPwd: '', newPwd: '', confirmPwd: '' })

onMounted(async () => {
  await initFromStorage()
  if (!isLoggedIn.value) { router.push('/login'); return }
  nicknameForm.value = user.value?.nickname || ''
  bioForm.value = user.value?.bio || ''
})

const handleAvatarUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    await uploadAvatar(file)
  } catch (e: any) {
    alert(e.message || '上传失败')
  }
}

const saveNickname = async () => {
  if (!nicknameForm.value.trim()) return
  try {
    await updateProfile({ nickname: nicknameForm.value.trim() } as any)
    nicknameMsg.value = '✅ 昵称已更新'
    setTimeout(() => (nicknameMsg.value = ''), 2000)
  } catch (e: any) { alert(e.message) }
}

const saveBio = async () => {
  try {
    await updateProfile({ bio: bioForm.value } as any)
    bioMsg.value = '✅ 个人介绍已更新'
    setTimeout(() => (bioMsg.value = ''), 2000)
  } catch (e: any) { alert(e.message) }
}

const savePassword = async () => {
  pwdMsg.value = ''; pwdSuccess.value = false
  if (!pwdForm.oldPwd || !pwdForm.newPwd) { pwdMsg.value = '请填写完整'; return }
  if (pwdForm.newPwd.length < 6) { pwdMsg.value = '新密码至少6位'; return }
  if (pwdForm.newPwd !== pwdForm.confirmPwd) { pwdMsg.value = '两次密码不一致'; return }
  try {
    await updatePassword(pwdForm.oldPwd, pwdForm.newPwd)
    pwdSuccess.value = true
    pwdMsg.value = '✅ 密码修改成功'
    pwdForm.oldPwd = ''; pwdForm.newPwd = ''; pwdForm.confirmPwd = ''
  } catch (e: any) { pwdMsg.value = e.message || '修改失败' }
}

const handleLogout = () => {
   logout(); router.push('/')
}

useHead({ title: '个人中心' })
</script>