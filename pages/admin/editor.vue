<template>
  <div class="relative min-h-screen">
    <!-- 雪花特效 -->
    <Snowfall v-if="showSnow" />

    <!-- 切换雪花按钮 -->
    <button
      @click="showSnow = !showSnow"
      class="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all flex items-center justify-center text-xl shadow-lg hover:scale-110"
      title="切换雪花特效"
    >
      ❄️
    </button>
    <div class="max-w-7xl mx-auto px-4 py-4 relative z-10 h-screen max-h-screen flex flex-col">
      <!-- 顶部导航 -->
      <div class="flex items-center justify-between mb-4 flex-shrink-0">
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/admin"
            class="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-400/50 transition-all duration-300"
          >
            <svg class="w-4 h-4 text-gray-400 group-hover:text-indigo-400 group-hover:-translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            <span class="text-sm text-gray-300 group-hover:text-white font-medium">返回</span>
          </NuxtLink>
          <h1 class="text-xl font-bold text-white">{{ isEdit ? '编辑文章' : '写文章' }}</h1>
        </div>
        <div class="flex gap-3">
          <button
            @click="saveDraft"
            :disabled="saving"
            class="px-5 py-2 border border-white/10 text-gray-300 rounded-xl text-sm font-medium hover:bg-white/5 transition disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '📥 存草稿' }}
          </button>
          <button
            @click="publish"
            :disabled="saving"
            class="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {{ saving ? '发布中...' : '🚀 发布文章' }}
          </button>
        </div>
      </div>

      <!-- 主体：左右两栏 3:1，flex-1 撑满剩余高度 -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        <!-- 左侧：编辑器（占3/4） -->
        <div class="lg:col-span-3 space-y-3 flex flex-col min-h-0">
          <!-- 标题 -->
          <input
            v-model="form.title"
            type="text"
            placeholder="输入文章标题..."
            class="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-lg font-bold text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder:text-gray-500 flex-shrink-0"
          />

          <!-- 内容编辑器 - flex-1 撑满 -->
          <div class="card overflow-hidden flex-1 flex flex-col min-h-0">
            <!-- 工具栏 -->
            <div class="flex items-center gap-1 px-4 py-1.5 border-b border-white/5 flex-wrap flex-shrink-0">
              <button @click="insertMd('**', '**')" class="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition text-sm font-bold" title="加粗">B</button>
              <button @click="insertMd('*', '*')" class="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition text-sm italic" title="斜体">I</button>
              <button @click="insertMd('\n```\n', '\n```\n')" class="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition text-xs" title="代码块">&lt;/&gt;</button>
              <button @click="insertMd('\n> ', '')" class="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition text-sm" title="引用">❝</button>
              <button @click="insertMd('\n- ', '')" class="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition text-sm" title="列表">•</button>
              <div class="flex-1"></div>
              <span class="text-xs text-gray-500 mr-2">{{ contentPlainText.length }} 字</span>
              <button @click="showPreview = !showPreview" :class="showPreview ? 'text-indigo-400' : 'text-gray-400'" class="p-1 rounded hover:bg-white/10 transition text-sm">
                {{ showPreview ? '📝 编辑' : '👁️ 预览' }}
              </button>
            </div>

            <!-- 编辑区域 - flex-1 撑满 -->
            <div class="flex-1 min-h-0 relative">
              <textarea
                v-show="!showPreview"
                ref="editorRef"
                v-model="form.content"
                placeholder="在这里写下你的文章内容（支持 Markdown 语法）..."
                class="w-full h-full px-5 py-3 bg-transparent text-gray-200 outline-none resize-none font-mono text-sm leading-relaxed"
              ></textarea>
              <div v-show="showPreview" class="w-full h-full px-5 py-3 prose prose-invert max-w-none overflow-y-auto">
                <div v-html="renderedContent"></div>
              </div>
            </div>
          </div>

          <!-- 消息提示 -->
          <div v-if="msg" :class="msgType === 'success' ? 'text-green-400 border-green-400/30 bg-green-500/10' : 'text-red-400 border-red-400/30 bg-red-500/10'" class="card p-2 text-sm border flex-shrink-0">
            {{ msg }}
          </div>
        </div>

        <!-- 右侧：设置面板（占1/4） -->
        <div class="lg:col-span-1 space-y-3 flex flex-col min-h-0 overflow-y-auto">
          <!-- AI 写作助手 -->
          <div class="card p-3 flex-shrink-0">
            <h3 class="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <span class="text-lg">🤖</span> AI助手
            </h3>

            <div class="grid grid-cols-2 gap-1.5 mb-2">
              <button
                v-for="mode in aiModes"
                :key="mode.key"
                @click="aiMode = mode.key"
                :class="aiMode === mode.key ? 'bg-indigo-500/30 border-indigo-500' : 'bg-white/5 border-white/10 hover:bg-white/10'"
                class="py-1 rounded-lg border text-[10px] text-center transition text-white"
              >
                <div class="text-sm mb-0.5">{{ mode.icon }}</div>
                {{ mode.label }}
              </button>
            </div>

            <textarea
              v-model="aiInput"
              :placeholder="aiPlaceholder"
              class="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs resize-none focus:border-indigo-500 focus:outline-none"
              rows="2"
            ></textarea>

            <button
              @click="handleAI"
              :disabled="loadingAI || !aiInput"
              class="w-full mt-2 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-xs font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loadingAI ? 'AI思考中...' : '✨ 生成' }}
            </button>

            <div v-if="aiResult" class="mt-2 p-2 rounded-lg bg-white/5 border border-indigo-500/30 max-h-[80px] overflow-y-auto">
              <div class="flex items-start justify-between gap-2">
                <p class="text-white text-xs whitespace-pre-wrap flex-1 leading-relaxed">{{ aiResult }}</p>
                <button @click="applyAIResult" class="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition flex-shrink-0">
                  应用
                </button>
              </div>
            </div>
          </div>

          <!-- 摘要 -->
          <div class="card p-3 flex-shrink-0">
            <label class="text-xs font-medium text-gray-400 block mb-1">📝 摘要</label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="输入文章摘要（选填）..."
              class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs resize-none focus:border-indigo-500 focus:outline-none placeholder:text-gray-500"
            ></textarea>
          </div>

          <!-- 标签 -->
          <div class="card p-3 flex-shrink-0">
            <label class="text-xs font-medium text-gray-400 block mb-1">🏷️ 标签</label>
            <div class="flex flex-wrap gap-1 mb-1">
              <span
                v-for="(tag, idx) in form.tags"
                :key="idx"
                class="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-xs"
              >
                #{{ tag }}
                <button @click="form.tags.splice(idx, 1)" class="hover:text-red-400 transition">×</button>
              </span>
              <span v-if="form.tags.length === 0" class="text-xs text-gray-500">暂无标签</span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="tagInput"
                @keydown.enter.prevent="addTag"
                type="text"
                placeholder="输入后回车"
                class="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:border-indigo-500 focus:outline-none placeholder:text-gray-500"
              />
              <button @click="addTag" class="px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg text-xs hover:bg-white/20 transition">添加</button>
            </div>
          </div>

          <!-- 状态 -->
          <div class="card p-3 flex-shrink-0">
            <label class="text-xs font-medium text-gray-400 block mb-1">📌 状态</label>
            <select
              v-model="form.status"
              class="w-full px-3 py-2 bg-[#0A0A1A] border border-white/10 rounded-lg text-white text-xs focus:border-indigo-500 focus:outline-none"
            >
              <option value="draft" style="background-color: #0A0A1A;">📝 草稿</option>
              <option value="published" style="background-color: #0A0A1A;">🚀 已发布</option>
            </select>
          </div>

          <!-- 发布信息 -->
          <div class="card p-2 text-xs text-gray-500 space-y-0.5 flex-shrink-0">
            <p v-if="form.created_at">创建：{{ formatDate(form.created_at) }}</p>
            <p v-if="form.updated_at">更新：{{ formatDate(form.updated_at) }}</p>
            <p v-if="form.published_at">发布：{{ formatDate(form.published_at) }}</p>
            <p v-if="!form.created_at" class="text-gray-600">尚未保存</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn, initFromStorage } = useUser()
const { createPost, updatePost, getPost, askAI } = useApi()
const router = useRouter()
const route = useRoute()

// ========== 雪花特效 ==========
const showSnow = ref(true)

// ========== 状态 ==========
const isEdit = computed(() => !!route.query.id)
const saving = ref(false)
const msg = ref('')
const msgType = ref<'success' | 'error'>('success')
const showPreview = ref(false)
const tagInput = ref('')
const editorRef = ref<HTMLTextAreaElement>()

// ========== 表单数据 ==========
const form = reactive({
  id: null as number | null,
  title: '',
  content: '',
  description: '',
  tags: [] as string[],
  status: 'draft' as 'draft' | 'published',
  created_at: null as string | null,
  updated_at: null as string | null,
  published_at: null as string | null,
})

// ========== AI 相关 ==========
const aiMode = ref<'title' | 'summary' | 'tag' | 'polish'>('title')
const aiInput = ref('')
const aiResult = ref('')
const loadingAI = ref(false)

const aiModes = [
  { key: 'title', label: '标题', icon: '💡' },
  { key: 'summary', label: '摘要', icon: '✍️' },
  { key: 'tag', label: '标签', icon: '🏷️' },
  { key: 'polish', label: '润色', icon: '✨' },
]

const aiPlaceholder = computed(() => {
  switch (aiMode.value) {
    case 'title': return '输入文章主题...'
    case 'summary': return '粘贴文章内容...'
    case 'tag': return '输入文章内容...'
    case 'polish': return '输入需要润色的文字...'
    default: return '输入内容...'
  }
})

// ========== 字数统计 ==========
const contentPlainText = computed(() => {
  return form.content?.replace(/[#*`>\-\[\]]/g, '').trim() || ''
})

// ========== Markdown 渲染 ==========
const renderedContent = computed(() => {
  let html = form.content
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-indigo-400 pl-4 py-1 my-2 text-gray-300">$1</blockquote>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-black/30 p-4 rounded-lg overflow-x-auto my-2"><code class="text-sm text-green-300">$1</code></pre>')
    .replace(/\n/g, '<br>')
  return html
})

// ========== 工具函数 ==========
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// ========== 加载文章 ==========
onMounted(async () => {
  await initFromStorage()
  if (!isLoggedIn.value) { router.push('/login'); return }

  const id = route.query.id
  if (id) {
    try {
      const data = await getPost(id as string)
      form.id = data.id
      form.title = data.title || ''
      form.content = data.content || ''
      form.description = data.description || ''
      form.tags = data.tags || []
      form.status = data.status || 'draft'
      form.created_at = data.created_at
      form.updated_at = data.updated_at
      form.published_at = data.published_at
    } catch (e: any) {
      msg.value = '加载文章失败：' + e.message
      msgType.value = 'error'
    }
  }
})

// ========== 标签操作 ==========
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
    tagInput.value = ''
  }
}

// ========== Markdown 插入 ==========
const insertMd = (before: string, after: string) => {
  const el = editorRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = form.content.substring(start, end)
  form.content = form.content.substring(0, start) + before + selected + after + form.content.substring(end)
  nextTick(() => {
    el.focus()
    el.selectionStart = start + before.length
    el.selectionEnd = start + before.length + selected.length
  })
}

// ========== AI 处理 ==========
const handleAI = async () => {
  if (!aiInput.value) return

  loadingAI.value = true
  try {
    let prompt = ''
    let systemPrompt = '你是一个专业的博客编辑助手。'

    switch (aiMode.value) {
      case 'title':
        prompt = `根据以下内容生成5个吸引人的博客标题（直接返回标题列表，每行一个）：\n\n${aiInput.value}`
        systemPrompt = '你是一个标题创作专家。'
        break
      case 'summary':
        prompt = `为以下内容写一段50-80字的摘要（直接返回摘要内容）：\n\n${aiInput.value}`
        systemPrompt = '你是一个摘要写作专家。'
        break
      case 'tag':
        prompt = `根据以下内容推荐3-5个标签（直接返回标签列表，用逗号分隔）：\n\n${aiInput.value}`
        systemPrompt = '你是一个内容分类专家。'
        break
      case 'polish':
        prompt = `润色以下文字，使其更流畅、更专业（直接返回润色后的内容）：\n\n${aiInput.value}`
        systemPrompt = '你是一个专业的文字润色专家。'
        break
    }

    aiResult.value = await askAI(prompt, systemPrompt)
  } catch (error: any) {
    alert('AI调用失败：' + error.message)
  } finally {
    loadingAI.value = false
  }
}

// ========== 应用 AI 结果 ==========
const applyAIResult = () => {
  if (!aiResult.value) return

  switch (aiMode.value) {
    case 'title':
      alert(`✅ AI生成的标题：\n\n${aiResult.value}`)
      break
    case 'summary':
      form.description = aiResult.value
      alert('✅ 摘要已应用！')
      break
    case 'tag':
      const tags = aiResult.value.split(',').map((t: string) => t.trim()).filter(Boolean)
      tags.forEach((t: string) => {
        if (!form.tags.includes(t)) form.tags.push(t)
      })
      alert('✅ 标签已应用！')
      break
    case 'polish':
      if (confirm(`✅ 是否用润色后的内容替换原文？\n\n${aiResult.value}`)) {
        form.content = aiResult.value
        alert('✅ 内容已替换！')
      }
      break
  }
  aiResult.value = ''
}

// ========== 保存 ==========
const save = async (status: string) => {
  if (!form.title.trim()) {
    msg.value = '⚠️ 请输入标题'
    msgType.value = 'error'
    return
  }
  if (!form.content.trim()) {
    msg.value = '⚠️ 请输入文章内容'
    msgType.value = 'error'
    return
  }

  saving.value = true
  msg.value = ''

  try {
    const data = {
      title: form.title.trim(),
      content: form.content,
      description: form.description.trim(),
      tags: form.tags,
      status: status
    }

    let result
    if (isEdit.value && route.query.id) {
      result = await updatePost(route.query.id as string, data)
    } else {
      result = await createPost(data)
    }

    const successMsg = status === 'published' ? '✅ 文章已发布！' : '✅ 草稿已保存！'
    msg.value = successMsg
    msgType.value = 'success'

    if (status === 'published') {
      setTimeout(() => router.push('/admin'), 800)
    } else {
      if (!isEdit.value && result?.id) {
        router.replace(`/admin/editor?id=${result.id}`)
        form.id = result.id
      }
    }
  } catch (e: any) {
    msg.value = e.message || '❌ 保存失败，请重试'
    msgType.value = 'error'
  } finally {
    saving.value = false
  }
}

const saveDraft = () => save('draft')
const publish = () => save('published')

useHead({ title: isEdit.value ? '编辑文章' : '写文章' })
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}

.prose-invert {
  color: #e5e7eb;
}

.prose-invert h1,
.prose-invert h2,
.prose-invert h3 {
  color: #ffffff;
}

.prose-invert blockquote {
  color: #d1d5db;
}
</style>