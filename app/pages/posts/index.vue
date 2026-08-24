<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <!-- 页面标题 -->
    <div class="mb-10">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-extrabold text-white flex items-center gap-3">
            <span class="gradient-text">所有文章</span>
            <span class="text-sm font-normal text-gray-500 bg-white/5 px-3 py-1 rounded-full">
              {{ totalCount }} 篇
            </span>
          </h1>
          <p class="text-gray-400 mt-2">记录学习与思考，分享技术与生活</p>
        </div>
        <NuxtLink to="/" class="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm">
          ← 返回首页
        </NuxtLink>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-20">
      <div class="inline-block w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-gray-500 mt-4">加载文章...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="articles.length === 0" class="text-center py-20 card p-12">
      <p class="text-5xl mb-4">📝</p>
      <p class="text-gray-400 text-lg">还没有文章</p>
      <p class="text-gray-500 text-sm mt-2">去后台管理创建你的第一篇文章吧</p>
    </div>

    <!-- 文章列表 -->
    <div v-else class="space-y-6">
      <div
        v-for="(article, idx) in articles"
        :key="article.id"
        class="card p-6 group hover:border-indigo-500/30 transition-all duration-300 animate-fade-in-up"
        :style="{ animationDelay: `${idx * 0.08}s` }"
      >
        <NuxtLink :to="`/posts/${article.id}`" class="block">
          <!-- 文章标题 -->
          <h2 class="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors mb-3">
            {{ article.title }}
          </h2>

          <!-- 文章内容摘要（最多50字） -->
          <p class="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
            {{ getSummary(article.content) }}
          </p>

          <!-- 底部信息 -->
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {{ formatDate(article.created_at) }}
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ getReadTime(article.content) }} 分钟
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
                </svg>
                {{ getWordCount(article.content) }} 字
              </span>
            </div>

            <!-- 标签 -->
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in (article.tags || []).slice(0, 3)"
                :key="tag"
                class="tag text-xs"
              >
                #{{ tag }}
              </span>
              <span
                v-if="(article.tags || []).length > 3"
                class="text-xs text-gray-500"
              >
                +{{ (article.tags || []).length - 3 }}
              </span>
            </div>
          </div>

          <!-- 摘要标签 -->
          <div v-if="article.description" class="mt-3">
            <span class="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
              📝 {{ article.description }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- 底部提示 -->
    <div v-if="articles.length > 0" class="text-center text-gray-600 text-sm mt-8">
      共 {{ totalCount }} 篇文章 · 已加载 {{ articles.length }} 篇
    </div>
  </div>
</template>

<script setup lang="ts">
const { getPosts } = useApi()

// ========== 数据 ==========
const articles = ref<any[]>([])
const loading = ref(true)
const totalCount = ref(0)

// ========== 加载文章 ==========
const loadArticles = async () => {
  loading.value = true
  try {
    const result = await getPosts({ status: 'published', limit: 50 })
    console.log('🔍 文章数据:', result) // 调试日志
    articles.value = result.posts || []
    totalCount.value = result.total || articles.value.length
  } catch (error) {
    console.error('加载文章失败:', error)
    articles.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

// ========== 工具函数 ==========

// ✅ 提取纯文本摘要（最多50字）
const getSummary = (html: string) => {
  console.log('📝 原始内容:', html) // 调试日志
  if (!html) return '暂无内容'
  // 移除 HTML 标签
  let text = html.replace(/<[^>]*>/g, '').trim()
  // 移除多余空白
  text = text.replace(/\s+/g, ' ')
  console.log('📝 纯文本:', text) // 调试日志
  if (text.length === 0) return '暂无内容'
  if (text.length <= 50) return text
  return text.slice(0, 50) + '...'
}

// ✅ 计算阅读时间
const getReadTime = (html: string) => {
  if (!html) return 1
  const text = html.replace(/<[^>]*>/g, '').trim()
  const wordCount = text.length
  return Math.max(1, Math.round(wordCount / 200))
}

// ✅ 计算字数
const getWordCount = (html: string) => {
  if (!html) return 0
  const text = html.replace(/<[^>]*>/g, '').trim()
  return text.length
}

// ✅ 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// ========== 生命周期 ==========
onMounted(() => {
  loadArticles()
})

// ========== SEO ==========
useHead({
  title: '所有文章',
  meta: [
    { name: 'description', content: '浏览所有博客文章，记录学习与思考' }
  ]
})
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.card:hover {
  border-color: rgba(99, 102, 241, 0.3);
}

.tag {
  background: rgba(99, 102, 241, 0.12);
  color: #818cf8;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11px;
  transition: all 0.2s;
}

.tag:hover {
  background: rgba(99, 102, 241, 0.25);
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
  animation: fadeInUp 0.5s ease forwards;
}

.gradient-text {
  background: linear-gradient(135deg, #818cf8 0%, #a855f7 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>