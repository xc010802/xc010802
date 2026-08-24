<template>
  <div class="max-w-md mx-auto mt-10 sm:mt-20">
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
            class="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-white"
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
            <!-- 获取验证码按钮 -->
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
              autocomplete="username"
              required
              maxlength="6"
              class="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-white tracking-widest"
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
            class="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-white"
            placeholder="至少6位密码"
          />
        </div>

        <!-- 错误提示 -->
        <p v-if="errorMsg" class="text-red-400 text-sm flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { useUser } from '@/composables/useUser'
import { useApi } from '@/composables/useApi'

const router = useRouter()
const { login, isLoggedIn, initFromStorage } = useUser()
const { sendCode: sendCodeApi, register: registerApi } = useApi()

// --- 状态定义 ---
const isRegister = ref(false)
const loading = ref(false)
const errorMsg = ref('')

// 验证码倒计时逻辑 (新方案)
const isCountingDown = ref(false) // 是否正在倒计时
const timeLeft = ref(0)           // 剩余秒数
let timer: number | null = null   // 定时器 ID

const form = reactive({
  email: '',
  password: '',
  nickname: '',
  code: ''
})

// --- 生命周期与监听 ---
onMounted(async () => {
  await initFromStorage()
  if (isLoggedIn.value) router.push('/')
})

// 切换模式时重置所有状态
watch(isRegister, () => {
  errorMsg.value = ''
  resetTimer()
})

// 核心修复：使用 Watcher 驱动倒计时，确保 UI 稳定更新
watch(timeLeft, (newVal) => {
  if (newVal > 0) {
    isCountingDown.value = true
  } else {
    isCountingDown.value = false
    if (timer) clearInterval(timer)
  }
})

useHead({
  title: isRegister.value ? '注册账号 - 博客管理' : '登录 - 博客管理'
})

// --- 方法 ---
const toggleMode = () => {
  isRegister.value = !isRegister.value
}

// 重置定时器辅助函数
const resetTimer = () => {
  if (timer) clearInterval(timer)
  timer = null
  timeLeft.value = 0
  isCountingDown.value = false
}

// 发送验证码逻辑 (彻底重构版)
const handleSendCode = async () => {
  errorMsg.value = ''

  // 1. 校验邮箱格式
  if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
    errorMsg.value = '请输入有效的邮箱地址'
    return
  }

  // 2. 立即锁定，防止连点 (关键修复)
  timeLeft.value = 120
  // 此时 watch(timeLeft) 会自动将 isCountingDown 设为 true，按钮变灰

  // ✅ 关键修复：启动定时器递减 timeLeft
  timer = window.setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)

  // try {
  //   await sendCodeApi(form.email)
  //   timer = window.setInterval(() => {
  //     timeLeft.value--
  //   }, 1000)
  // } catch (e: any) {
  //   resetTimer()
  //   const msg = e.data?.statusMessage || e.statusMessage || e.message || '发送失败'
  //   errorMsg.value = msg
  // }
  console.log('准备发送验证码请求:', form.email) 
}

// 提交表单逻辑
const handleSubmit = async () => {
  // 1. 重置状态
  errorMsg.value = ''
  loading.value = true

  try {
    if (isRegister.value) {
      if (!form.code) throw new Error('请输入邮箱验证码')
      await registerApi(form.email, form.password, form.nickname, form.code)
    } else {
      await login(form.email, form.password)
    }
    
    // 成功跳转
    router.push('/')
    
  } catch (e: any) {
    // 【关键修改】不再打印 console.error，防止暴露代码路径和堆栈
    
    let msg = '操作失败，请稍后重试' // 默认兜底文案

    // 2. 尝试获取后端返回的业务错误信息 (优先)
    if (e.data?.message) {
      msg = e.data.message
    } else if (e.data?.statusMessage) {
      msg = e.data.statusMessage
    } 
    // 3. 如果后端没返回具体信息，根据 HTTP 状态码显示通用提示
    else if (e.status === 401) {
      msg = '账号或密码错误'
    } else if (e.status === 400) {
      msg = '输入信息有误'
    } else if (e.message && !e.message.includes('Error')) {
      // 如果 message 不是标准的 "xxx Error" 字符串，可能是后端直接返回的文本
      msg = e.message
    }

    // 4. 仅在页面上显示精简后的错误提示
    errorMsg.value = msg
  } finally {
    loading.value = false
  }
}
</script>