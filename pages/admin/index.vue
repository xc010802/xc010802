<template>
  <div>
    <!-- 顶部导航 -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-white">
          <span class="gradient-text">后台管理</span>
        </h1>
        <p class="text-gray-400 mt-1">管理你的博客内容</p>
      </div>
      <NuxtLink
        to="/admin/editor"
        class="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        写文章
      </NuxtLink>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="card p-5 hover:border-indigo-500/30 transition">
        <p class="text-3xl font-bold text-indigo-400">{{ stats.totalPosts }}</p>
        <p class="text-sm text-gray-400 mt-1">全部文章</p>
      </div>
      <div class="card p-5 hover:border-green-500/30 transition">
        <p class="text-3xl font-bold text-green-400">{{ stats.publishedPosts }}</p>
        <p class="text-sm text-gray-400 mt-1">已发布</p>
      </div>
      <div class="card p-5 hover:border-amber-500/30 transition">
        <p class="text-3xl font-bold text-amber-400">{{ stats.draftPosts }}</p>
        <p class="text-sm text-gray-400 mt-1">草稿</p>
      </div>
      <div class="card p-5 hover:border-pink-500/30 transition">
        <p class="text-3xl font-bold text-pink-400">{{ stats.recentPosts }}</p>
        <p class="text-sm text-gray-400 mt-1">近7天新增</p>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="card p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white">文章管理</h2>
        <span class="text-xs text-gray-500">共 {{ posts.length }} 篇</span>
      </div>

      <div v-if="posts.length === 0" class="text-center py-10 text-gray-500">
        <p class="text-4xl mb-3">📝</p>
        <p>还没有文章，点击右上角"写文章"开始创作</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/5 text-left text-gray-500">
              <th class="pb-3 font-medium">标题</th>
              <th class="pb-3 font-medium hidden md:table-cell">状态</th>
              <th class="pb-3 font-medium hidden lg:table-cell">日期</th>
              <th class="pb-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="post in posts"
              :key="post.id"
              class="border-b border-white/5 hover:bg-white/5 transition group"
            >
              <td class="py-3 pr-4">
                <div class="flex items-center gap-2">
                  <span class="text-white truncate max-w-[180px] md:max-w-xs">{{ post.title }}</span>
                  <span
                    :class="
                      post.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-amber-500/20 text-amber-400'
                    "
                    class="px-2 py-0.5 rounded-full text-xs flex-shrink-0 md:hidden"
                  >
                    {{ post.status === 'published' ? '已发布' : '草稿' }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-0.5 truncate max-w-[200px] md:hidden">
                  {{ post.description || '暂无描述' }}
                </p>
              </td>
              <td class="py-3 hidden md:table-cell">
                <span
                  :class="
                    post.status === 'published'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-amber-500/20 text-amber-400'
                  "
                  class="px-2 py-0.5 rounded-full text-xs"
                >
                  {{ post.status === 'published' ? '已发布' : '草稿' }}
                </span>
              </td>
              <td class="py-3 hidden lg:table-cell text-gray-500 text-xs">
                {{ formatDate(post.created_at) }}
              </td>
              <td class="py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink
                    :to="`/admin/editor?id=${post.id}`"
                    class="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-indigo-400 transition"
                    title="编辑"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </NuxtLink>
                  <button
                    @click="openDeleteModal(post)"
                    class="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition"
                    title="删除"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ========== 删除确认弹窗 ========== -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      @click.self="closeDeleteModal"
    >
      <div class="bg-[#0A0A1A] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-fadeIn">
        <!-- 图标 -->
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
        </div>

        <h3 class="text-center text-xl font-bold text-white mb-2">确认删除</h3>

        <p class="text-center text-gray-400 text-sm mb-6">
          确定要删除文章 <br>
          <span class="text-white font-medium text-base">「{{ deletingPost?.title }}」</span> 吗？
          <br><br>
          <span class="text-red-400/60 text-xs">⚠️ 此操作不可撤销</span>
        </p>

        <div class="flex gap-3">
          <button
            @click="closeDeleteModal"
            class="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5 transition"
          >
            取消
          </button>
          <button
            @click="confirmDelete"
            :disabled="deleting"
            class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg
              v-if="deleting"
              class="w-4 h-4 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn, initFromStorage } = useUser()
const { getPosts, deletePost, getStats } = useApi()
const router = useRouter()

// ========== 数据 ==========
const posts = ref<any[]>([])
const stats = reactive({
  totalPosts: 0,
  publishedPosts: 0,
  draftPosts: 0,
  totalTags: 0,
  recentPosts: 0
})

// ========== 删除弹窗 ==========
const showDeleteModal = ref(false)
const deletingPost = ref<any>(null)
const deleting = ref(false)

// ========== 加载数据 ==========
onMounted(async () => {
  await initFromStorage()
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  await loadData()
})

const loadData = async () => {
  try {
    const [postsData, statsData] = await Promise.all([
      getPosts({ status: 'all' as any, limit: 50 }),
      getStats()
    ])
    posts.value = postsData.posts || []
    Object.assign(stats, statsData || {})
  } catch (e: any) {
    console.error('加载数据失败:', e)
  }
}

// ========== 删除操作 ==========
const openDeleteModal = (post: any) => {
  deletingPost.value = post
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingPost.value = null
  deleting.value = false
}

const confirmDelete = async () => {
  if (!deletingPost.value) return

  deleting.value = true
  try {
    const result = await deletePost(deletingPost.value.id)
    if (result?.success === false) {
      alert(result.message || '删除失败')
      return
    }
    posts.value = posts.value.filter((p) => p.id !== deletingPost.value.id)
    stats.totalPosts--
    if (deletingPost.value.status === 'published') stats.publishedPosts--
    else stats.draftPosts--
    closeDeleteModal()
  } catch (e: any) {
    alert(e.message || '删除失败')
  } finally {
    deleting.value = false
  }
}

// ========== 工具函数 ==========
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

useHead({ title: '后台管理' })
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

.gradient-text {
  background: linear-gradient(135deg, #818cf8, #a855f7, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>