<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0a1a]">
    <div class="w-full max-w-md">
      <div class="card p-8 sm:p-10">
        <!-- 头部标题区域 -->
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
            <svg
              class="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">
            {{ isRegister ? '创建账号' : '欢迎回来' }}
          </h1>
          <p class="text-gray-400 text-sm mt-2">
            {{ isRegister ? '注册后即可管理你的博客' : '登录以管理你的博客' }}
          </p>
        </div>

        <!-- 表单区域 -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- 昵称 (仅注册显示) -->
          <div v-if="isRegister">
            <label class="block text-sm font-medium mb-1.5 text-gray-300">昵称</label>
            <input
              v-model="form.nickname"
              type="text"
              autocomplete="username"
              class="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
              placeholder="你的昵称"
            />
          </div>

          <!-- 邮箱区域 -->
          <div>
            <label class="block text-sm font-medium mb-1.5 text-gray-300">邮箱</label>

            <!-- 登录模式 -->
            <div v-if="!isRegister" class="flex gap-2">
              <input
                v-model="form.email"
                type="email"
                autocomplete="username"
                required
                class="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                placeholder="your@email.com"
              />
            </div>

            <!-- 注册模式：邮箱 + 验证码按钮 -->
            <div v-else class="flex gap-2">
              <input
                v-model="form.email"
                type="email"
                autocomplete="username"
                required
                class="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
                placeholder="your@email.com"
              />
              <button
                type="button"
                @click="handleSendCode"
                :disabled="isCountingDown || !form.email"
                :class="[
                  'px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap min-w-[110px]',
                  isCountingDown
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                ]"
              >
                {{ isCountingDown ? `${timeLeft}s 后重发` : '获取验证码' }}
              </button>
            </div>

            <!-- 验证码输入框 (仅注册显示) -->
            <div v-if="isRegister" class="mt-4">
              <label class="block text-sm font-medium mb-1.5 text-gray-300">验证码</label>
              <input
                v-model="form.code"
                type="text"
                autocomplete="one-time-code"
                required
                maxlength="6"
                class="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-white tracking-widest placeholder-gray-500"
                placeholder="输入6位验证码"
              />
            </div>
          </div>

          <!-- 密码 -->
          <div>
            <label class="block text-sm font-medium mb-1.5 text-gray-300">密码</label>
            <input
              v-model="form.password"
              type="password"
              autocomplete="current-password"
              required
              minlength="6"
              class="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-white placeholder-gray-500"
              placeholder="至少6位密码"
            />
          </div>

          <!-- 错误提示 -->
          <p v-if="errorMsg" class="text-red-400 text-sm flex items-center gap-1">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errorMsg }}
          </p>

          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '处理中...' : isRegister ? '立即注册' : '登 录' }}
          </button>
        </form>

        <!-- 切换登录/注册 -->
        <p class="text-center text-sm text-gray-500 mt-6">
          {{ isRegister ? '已有账号？' : '没有账号？' }}
          <button @click="toggleMode" class="text-indigo-400 hover:text-indigo-300 hover:underline font-medium ml-1">
            {{ isRegister ? '去登录' : '注册一个' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

// 直接使用 $fetch，不依赖 composables（避免循环依赖）
const router = useRouter()

// --- 状态定义 ---
const isRegister = ref(false)
const loading = ref(false)
const errorMsg = ref('')

// 验证码倒计时
const isCountingDown = ref(false)
const timeLeft = ref(0)
let timer: number | null = null

const form = reactive({
  email: '',
  password: '',
  nickname: '',
  code: ''
})

// --- 生命周期 ---
onMounted(() => {
  // 检查是否已登录
  if (process.client) {
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/')
    }
  }
})

// 切换模式时重置状态
watch(isRegister, () => {
  errorMsg.value = ''
  resetTimer()
  form.code = ''
})

watch(timeLeft, (newVal) => {
  isCountingDown.value = newVal > 0
  if (newVal <= 0 && timer) {
    clearInterval(timer)
    timer = null
  }
})

// --- 方法 ---
const toggleMode = () => {
  isRegister.value = !isRegister.value
}

const resetTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  timeLeft.value = 0
  isCountingDown.value = false
}

// 发送验证码
const handleSendCode = async () => {
  errorMsg.value = ''

  if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
    errorMsg.value = '请输入有效的邮箱地址'
    return
  }

  try {
    const result = await $fetch('/api/auth/send-code', {
      method: 'POST',
      body: { email: form.email }
    })

    if (!result.success) {
      errorMsg.value = result.error || '发送失败'
      return
    }

    // 开始倒计时
    timeLeft.value = 120
    timer = window.setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0 && timer) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)

  } catch (error: any) {
    errorMsg.value = error.message || '发送验证码失败'
  }
}

// 提交表单
const handleSubmit = async () => {
  errorMsg.value = ''
  loading.value = true

  try {
    let result

    if (isRegister.value) {
      // 注册
      if (!form.code) {
        errorMsg.value = '请输入验证码'
        loading.value = false
        return
      }

      result = await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: form.email,
          password: form.password,
          nickname: form.nickname || '博主',
          code: form.code
        }
      })

      if (!result.success) {
        errorMsg.value = result.error || '注册失败'
        loading.value = false
        return
      }

      // 注册成功后自动切换到登录
      errorMsg.value = '注册成功！请登录'
      isRegister.value = false
      form.password = ''
      form.code = ''
      loading.value = false
      return

    } else {
      // 登录
      result = await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: form.email,
          password: form.password
        }
      })

      if (!result.success) {
        errorMsg.value = result.error || '登录失败'
        loading.value = false
        return
      }

      // 保存用户信息
      if (process.client) {
        localStorage.setItem('token', result.data.token)
        localStorage.setItem('user', JSON.stringify(result.data.user))
      }

      // 跳转到首页
      router.push('/')
    }

  } catch (error: any) {
    console.error('提交错误:', error)
    errorMsg.value = error.data?.message || error.message || '操作失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
</style>