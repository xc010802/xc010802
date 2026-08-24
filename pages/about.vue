<template>
  <div class="max-w-3xl mx-auto">
    <!-- Hero -->
    <div class="text-center py-12 mb-10">
      <img :src="user.avatar" alt="avatar" class="w-28 h-28 rounded-full mx-auto mb-6 object-cover ring-4 ring-white dark:ring-slate-800 shadow-xl animate-float" />
      <h1 class="text-3xl sm:text-4xl font-extrabold mb-3">
        关于 <span class="gradient-text">{{ user.nickname }}</span>
      </h1>
      <p class="text-gray-400 text-lg max-w-md mx-auto">{{ user.bio }}</p>
    </div>

    <!-- 内容 -->
    <div class="card p-8 sm:p-10">
      <div class="prose max-w-none">
        <h2>🚀 关于这个博客</h2>
        <p>这是一个使用现代前端技术栈构建的个人博客，追求极致的开发体验和阅读体验。</p>

        <h2>🛠️ 技术栈</h2>
        <div class="grid grid-cols-2 gap-4 not-prose my-6">
          <div class="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600">
            <p class="font-bold text-indigo-500">Nuxt 3</p>
            <p class="text-sm text-gray-400 mt-1">Vue 全栈框架</p>
          </div>
          <div class="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600">
            <p class="font-bold text-green-500">Vue 3</p>
            <p class="text-sm text-gray-400 mt-1">渐进式框架</p>
          </div>
          <div class="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600">
            <p class="font-bold text-blue-500">Tailwind CSS</p>
            <p class="text-sm text-gray-400 mt-1">原子化 CSS</p>
          </div>
          <div class="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600">
            <p class="font-bold text-purple-500">Nuxt Content</p>
            <p class="text-sm text-gray-400 mt-1">Markdown 引擎</p>
          </div>
        </div>

        <h2>✨ 特色功能</h2>
        <ul>
          <li>🌙 暗色/亮色主题切换</li>
          <li>🔍 全文搜索（Ctrl+K）</li>
          <li>📊 阅读进度条</li>
          <li> 文章目录导航</li>
          <li>🏷️ 标签分类筛选</li>
          <li>📱 响应式设计</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, initFromStorage } = useUser()
onMounted(() => { initFromStorage() })
useHead({ title: '关于' })
</script>