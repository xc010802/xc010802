<template>
  <div>
    <!-- Hero 区域 -->
    <section class="relative py-16 sm:py-24 text-center">
      <!-- 浮动装饰 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-10 left-10 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl animate-float"></div>
        <div class="absolute top-20 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-float" style="animation-delay: 1s;"></div>
        <div class="absolute bottom-10 left-1/3 w-24 h-24 bg-pink-500/20 rounded-full blur-xl animate-float" style="animation-delay: 2s;"></div>
      </div>
      <div class="animate-fade-in-up relative">
        <div class="relative inline-block mb-6">
          <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-40 animate-pulse"></div>
          
          <img
            :src="displayUser.avatar"
            alt="avatar"
            class="relative w-28 h-28 rounded-full object-cover ring-4 ring-white/10 shadow-2xl animate-float"
          />
          
          <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-[#0a0a1a] shadow-lg shadow-green-500/30"></div>
        </div>

        <h1 class="text-4xl sm:text-5xl font-extrabold mb-4 text-white">
          Hi, 我是 <span class="gradient-text">{{ displayUser.nickname }}</span> 👋
        </h1>

        <p class="text-lg text-gray-400 max-w-md mx-auto mb-8">{{ displayUser.bio }}</p>

        <div class="flex items-center justify-center gap-3">
          <NuxtLink to="/posts" class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
            阅读文章 →
          </NuxtLink>
          <NuxtLink to="/about" class="px-6 py-3 border border-white/10 rounded-xl font-medium text-gray-300 hover:bg-white/5 hover:border-white/20 transition-all backdrop-blur-sm">
            了解更多
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 统计 -->
    <section class="grid grid-cols-3 gap-4 max-w-md mx-auto mb-16">
      <div class="text-center p-4 card">
        <p class="text-2xl font-bold text-indigo-400">{{ articles.length }}</p>
        <p class="text-xs text-gray-500 mt-1">篇文章</p>
      </div>
      <div class="text-center p-4 card">
        <p class="text-2xl font-bold text-purple-400">{{ allTags.length }}</p>
        <p class="text-xs text-gray-500 mt-1">个标签</p>
      </div>
      <div class="text-center p-4 card">
        <p class="text-2xl font-bold text-pink-400">{{ totalWords }}</p>
        <p class="text-xs text-gray-500 mt-1">千字</p>
      </div>
    </section>

    <!-- 最新文章 -->
    <section class="mb-16">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold flex items-center gap-2 text-white">
          <span class="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></span>
          最新文章
        </h2>
        <NuxtLink to="/posts" class="text-sm text-indigo-400 hover:text-indigo-300 transition">查看全部 →</NuxtLink>
      </div>

      <div v-if="loading" class="text-center py-10">
        <div class="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="articles.length === 0" class="text-center py-10 text-gray-500 card p-8">
        <p class="text-4xl mb-3">📝</p>
        <p>还没有文章，去后台管理创建你的第一篇博客吧！</p>
      </div>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="(article, idx) in articles"
          :key="article.id"
          :to="`/posts/${article.id}`"
          class="card p-6 group animate-fade-in-up"
          :style="{ animationDelay: `${idx * 0.1}s` }"
        >
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xs text-gray-500">{{ formatDate(article.created_at) }}</span>
          </div>
          <h3 class="text-lg font-bold mb-2 text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
            {{ article.title }}
          </h3>
          <p class="text-sm text-gray-500 line-clamp-2 mb-4">{{ article.description || '暂无描述' }}</p>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="tag in (article.tags || []).slice(0, 3)" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- 标签云 -->
    <section v-if="allTags.length" class="mb-16">
      <h2 class="text-2xl font-bold flex items-center gap-2 mb-6 text-white">
        <span class="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></span>
        标签云
      </h2>
      <div class="flex flex-wrap gap-2">
        <span v-for="tag in allTags" :key="tag" class="tag cursor-pointer text-sm px-4 py-2">
          {{ tag }}
        </span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { user, initFromStorage } = useUser()
const { getPosts } = useApi()

// ========== 用户信息 ==========
const displayUser = computed(() => {
  if (user.value) {
    return user.value
  }
  return {
    avatar: '/uploads/default-avatar.svg',
    nickname: '博主',
    bio: '欢迎来到我的个人博客，这里记录了我的学习与生活。',
  }
})

// ========== 文章数据 ==========
const articles = ref<any[]>([])
const loading = ref(true)

// 从数据库加载文章
const loadArticles = async () => {
  loading.value = true
  try {
    const result = await getPosts({ status: 'published', limit: 6 })
    articles.value = result.posts || []
  } catch (error) {
    console.error('加载文章失败:', error)
    articles.value = []
  } finally {
    loading.value = false
  }
}

// ========== 标签统计 ==========
const allTags = computed(() => {
  const tags = new Set<string>()
  articles.value.forEach((a: any) => {
    if (a.tags && Array.isArray(a.tags)) {
      a.tags.forEach((t: string) => tags.add(t))
    }
  })
  return Array.from(tags)
})

// ========== 字数统计（估算） ==========
const totalWords = computed(() => {
  return Math.max(1, Math.round((articles.value?.length || 0) * 1.5))
})

// ========== 工具函数 ==========
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ========== 生命周期 ==========
onMounted(async () => {
  await initFromStorage()
  await loadArticles()
})

// ========== SEO ==========
useHead(() => ({
  title: `${displayUser.value.nickname}的博客`,
  meta: [
    { 
      name: 'description', 
      content: displayUser.value.bio 
    }
  ]
}))
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}

.tag {
  background: rgba(99, 102, 241, 0.12);
  color: #818cf8;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11px;
}

.tag:hover {
  background: rgba(99, 102, 241, 0.25);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}

.gradient-text {
  background: linear-gradient(135deg, #818cf8, #a855f7, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>