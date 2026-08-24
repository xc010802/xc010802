<template>
  <div class="min-h-screen flex flex-col">
    <!-- 导航栏 -->
    <header class="sticky top-0 z-50 nav-glass">
      <nav class="max-w-8xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-end gap-6">
        <!-- Logo -->
        <NuxtLink v-if="isLoggedIn" to="/admin" class="nav-link" active-class="nav-link-active">
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
  <span class="hidden sm:inline">管理</span>
</NuxtLink>

        <!-- 导航链接 -->
        <div class="flex items-center gap-1 sm:gap-2">
          <NuxtLink to="/" class="nav-link" active-class="nav-link-active">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span class="hidden sm:inline">首页</span>
          </NuxtLink>
          <NuxtLink to="/posts" class="nav-link" active-class="nav-link-active">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
            <span class="hidden sm:inline">文章</span>
          </NuxtLink>
          <NuxtLink to="/about" class="nav-link" active-class="nav-link-active">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span class="hidden sm:inline">关于</span>
          </NuxtLink>

          <div class="w-px h-6 bg-white/10 mx-1 sm:mx-2"></div>

          <!-- 搜索 -->
          <button @click="showSearch = true" class="nav-link" title="搜索 (Ctrl+K)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </button>

          <!-- 主题切换 -->
          <button @click="toggleTheme" class="nav-link" title="切换主题">
            <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          </button>

          <!-- 用户 -->
          <NuxtLink v-if="isLoggedIn" to="/profile" class="flex items-center gap-2 ml-2 group">
            <img :src="user.avatar" alt="avatar" class="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-indigo-500 transition-all" />
          </NuxtLink>
          <NuxtLink v-else to="/login" class="ml-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
            登录
          </NuxtLink>
        </div>
      </nav>
    </header>

    <!-- 搜索弹窗 -->
    <Teleport to="body">
      <div v-if="showSearch" class="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showSearch = false"></div>
        <div class="relative w-full max-w-lg bg-[#12122a]/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 animate-fade-in-up border border-white/10">
          <div class="flex items-center gap-3 mb-4">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="搜索文章..."
              class="flex-1 bg-transparent outline-none text-lg text-white"
              @keyup.enter="doSearch"
              @keyup.escape="showSearch = false"
            />
            <kbd class="px-2 py-1 text-xs bg-white/10 rounded text-gray-400">ESC</kbd>
          </div>
          <div v-if="searchResults.length" class="space-y-2 max-h-64 overflow-y-auto">
            <NuxtLink
              v-for="item in searchResults"
              :key="item._path"
              :to="item._path"
              class="block p-3 rounded-xl hover:bg-white/5 transition"
              @click="showSearch = false"
            >
              <p class="font-medium text-white">{{ item.title }}</p>
              <p class="text-sm text-gray-400 mt-1">{{ item.description }}</p>
            </NuxtLink>
          </div>
          <p v-else-if="searchQuery" class="text-gray-400 text-center py-4">没有找到相关文章</p>
        </div>
      </div>
    </Teleport>

    <!-- 主内容 -->
    <main class="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
      <slot />
    </main>

    <!-- 页脚 -->
    <footer class="border-t border-white/5 mt-auto">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-sm text-gray-500">
            © {{ new Date().getFullYear() }} <span>{{ user?.nickname }}</span> · Built with
            <span class="text-indigo-400">Nuxt 3</span> +
            <span class="text-green-400">Vue</span> +
            <span class="text-blue-400">Tailwind</span>
          </p>
          <div class="flex items-center gap-4">
            <a href="#" class="text-gray-500 hover:text-indigo-400 transition">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { user, isLoggedIn, initFromStorage } = useUser()
const { isDark, toggleTheme, initTheme } = useTheme()

const showSearch = ref(false)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const searchInput = ref<HTMLInputElement>()

onMounted(() => {
  initFromStorage()
  initTheme()
  // 默认暗色
  if (!localStorage.getItem('theme')) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      showSearch.value = true
    }
  })
})

watch(showSearch, (val) => {
  if (val) {
    nextTick(() => searchInput.value?.focus())
  } else {
    searchQuery.value = ''
    searchResults.value = []
  }
})

const doSearch = async () => {
  if (!searchQuery.value.trim()) return
  const results = await queryContent('/posts')
    .where({ title: { $contains: searchQuery.value } })
    .find()
  searchResults.value = results
}

watch(searchQuery, async (val) => {
  if (!val.trim()) {
    searchResults.value = []
    return
  }
  const results = await queryContent('/posts')
    .where({ title: { $contains: val } })
    .find()
  searchResults.value = results
})
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: rgba(255,255,255,0.6);
  transition: all 0.2s;
}
.nav-link:hover {
  background: rgba(255,255,255,0.05);
  color: white;
}
.nav-link-active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

</style>
