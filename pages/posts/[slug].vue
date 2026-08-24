<template>
  <div v-if="article">
    <!-- 阅读进度条 -->
    <div class="reading-progress" :style="{ width: progress + '%' }"></div>

    <div class="flex gap-8">
      <!-- 文章内容 -->
      <article class="flex-1 min-w-0">
        <!-- 文章头部 -->
        <header class="mb-10">
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="tag in (article.tags || [])" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">{{ article.title }}</h1>
          <div class="flex items-center gap-4 text-sm text-gray-400">
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              {{ formatDate(article.date) }}
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ readTime }} 分钟阅读
            </span>
          </div>
        </header>

        <!-- 文章正文 -->
        <div class="prose prose-lg max-w-none">
          <ContentRenderer :value="article" />
        </div>

        <!-- 文章底部 -->
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <NuxtLink to="/posts" class="flex items-center gap-2 text-indigo-500 hover:text-indigo-400 transition font-medium">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              返回文章列表
            </NuxtLink>
          </div>
        </div>
      </article>

      <!-- 侧边目录 -->
      <aside class="hidden lg:block w-64 shrink-0">
        <div class="sticky top-24">
          <h4 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">目录</h4>
          <nav class="space-y-2">
            <a
              v-for="heading in toc"
              :key="heading.id"
              :href="'#' + heading.id"
              :class="[
                'block text-sm transition-colors hover:text-indigo-500',
                heading.depth === 2 ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 pl-3'
              ]"
            >
              {{ heading.text }}
            </a>
          </nav>
        </div>
      </aside>
    </div>
  </div>

  <!-- 404 -->
  <div v-else class="text-center py-20">
    <p class="text-6xl mb-4">🔍</p>
    <h2 class="text-2xl font-bold mb-2">文章未找到</h2>
    <p class="text-gray-400 mb-6">这篇文章可能已被删除或移动</p>
    <NuxtLink to="/posts" class="inline-block px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition">
      返回文章列表
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const progress = ref(0)

const { data: article } = await useAsyncData(`post-${route.params.slug}`, () =>
  queryContent('/posts').where({ _path: route.path }).findOne()
)

// 生成目录
const toc = computed(() => {
  if (!article.value?.body?.toc?.links) return []
  return article.value.body.toc.links
})

// 阅读时间
const readTime = computed(() => {
  const text = article.value?.body?.children?.map((c: any) => c.children?.map((cc: any) => cc.value || '').join('') || '').join('') || ''
  return Math.max(1, Math.ceil(text.length / 500))
})

// 阅读进度
onMounted(() => {
  const updateProgress = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    progress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
  }
  window.addEventListener('scroll', updateProgress)
  onUnmounted(() => window.removeEventListener('scroll', updateProgress))
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

useHead({
  title: article.value?.title || '文章',
  meta: [{ name: 'description', content: article.value?.description || '' }],
})
</script>