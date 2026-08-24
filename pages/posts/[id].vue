<template>
  <div class="max-w-3xl mx-auto">
    <NuxtLink to="/" class="text-indigo-400 hover:text-indigo-300 transition flex items-center gap-2 mb-6">
      ← 返回首页
    </NuxtLink>

    <div v-if="loading" class="text-center py-20">
      <div class="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="!post" class="text-center py-20 text-gray-500">
      <p class="text-4xl mb-3">📄</p>
      <p>文章不存在</p>
    </div>

    <article v-else class="card p-8">
      <h1 class="text-3xl font-extrabold text-white mb-4">{{ post.title }}</h1>
      <div class="flex items-center gap-4 text-sm text-gray-500 mb-6">
        <span>{{ formatDate(post.created_at) }}</span>
        <span>·</span>
        <span>{{ post.content?.replace(/<[^>]*>/g, '').length || 0 }} 字</span>
      </div>
      <div v-if="post.tags?.length" class="flex flex-wrap gap-2 mb-6">
        <span v-for="tag in post.tags" :key="tag" class="tag">
          {{ tag }}
        </span>
      </div>
      <div 
        class="prose prose-invert max-w-none" 
        v-html="post.content"
      ></div>
    </article>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { getPost } = useApi()

const post = ref<any>(null)
const loading = ref(true)

const loadPost = async () => {
  const id = route.params.id
  if (!id) return
  
  loading.value = true
  try {
    post.value = await getPost(id as string)
  } catch (error) {
    console.error('加载文章失败:', error)
    post.value = null
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  loadPost()
})

useHead(() => ({
  title: post.value?.title || '文章详情'
}))
</script>