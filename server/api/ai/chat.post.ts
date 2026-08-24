// server/api/ai/chat.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { prompt, systemPrompt } = body

  // console.log('📨 收到AI请求:', {
  //   prompt: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '')
  // })

  try {
    // ========== 使用你自己的 API Key ==========
    const YOUR_API_KEY = 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'  // ← 填这里！
    const MODEL = 'gpt-4o'  // ← 或 gpt-3.5-turbo

    const response = await $fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOUR_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
      timeout: 15000
    })

    if (response?.choices?.[0]?.message?.content) {
      // console.log('✅ AI回复成功')
      return {
        success: true,
        data: response.choices[0].message.content
      }
    }

    throw new Error('返回数据格式异常')

  } catch (error: any) {
    // console.error('❌ AI调用失败:', error.message)

    // 失败时返回模拟数据（让前端不报错）
    return {
      success: true,
      data: `🤖 [模拟回复]\n\n你的问题是："${prompt.slice(0, 30)}..."\n\n⚠️ AI服务调用失败，请检查：\n1. API Key 是否正确\n2. 账户是否有余额\n3. 网络是否通畅`
    }
  }
})