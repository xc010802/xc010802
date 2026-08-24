<template>
  <div class="min-h-screen bg-[#0a0a1a] text-white p-8">
    <h1 class="text-3xl font-bold gradient-text">欢迎来到我的博客</h1>
    
    <div v-if="loading" class="mt-4">加载中...</div>
    <div v-else-if="posts.length === 0" class="mt-4 text-gray-500">暂无文章</div>
    <div v-else class="mt-4 space-y-4">
      <div v-for="post in posts" :key="post.id" class="card p-4">
        <h2 class="text-xl font-bold">{{ post.title }}</h2>
        <p class="text-gray-400">{{ post.description }}</p>
        <div class="flex gap-2 mt-2">
          <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const posts = ref([])
const loading = ref(true)

const loadPosts = async () => {
  try {
    const result = await $fetch('/api/posts?status=published&limit=6')
    posts.value = result.data.posts || []
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

loadPosts()
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 1rem;
}
.tag {
  background: rgba(99, 102, 241, 0.12);
  color: #818cf8;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11px;
}
.gradient-text {
  background: linear-gradient(135deg, #818cf8, #a855f7, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>