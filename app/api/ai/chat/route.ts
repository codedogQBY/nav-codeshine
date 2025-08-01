import { NextRequest } from 'next/server'
import { zhipuAI, ZhipuChatMessage } from '@/lib/zhipu-ai'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, websites, categories } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ success: false, error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 获取数据库中所有网站（用于AI推荐）
    const allWebsites = await prisma.website.findMany({
      include: {
        category: true
      }
    })

    // 所有网站都可以用于推荐，不排除用户已收藏的
    const availableForRecommendation = allWebsites

    // 优化系统消息，提供更详细的网站信息用于推荐
    const websiteInfo = websites?.map((site: any) => 
      `• ${site.title} - ${site.description}\n  🏷️ 标签: ${site.tags?.join(', ') || '无'}\n  📂 分类: ${categories?.find((c: any) => c.id === site.category)?.name || '未分类'}\n  🔗 ${site.url}`
    ).join('\n\n') || '暂无收藏网站'

    const categoryInfo = categories?.map((cat: any) => 
      `• ${cat.name} (${cat.count}个网站)`
    ).join('\n') || '暂无分类'

    // 可推荐网站信息
    const recommendationPool = availableForRecommendation.map(site => 
      `• ${site.title} - ${site.description}\n  🏷️ 标签: ${Array.isArray(site.tags) ? site.tags.join(', ') : '无'}\n  📂 分类: ${site.category.name}\n  🔗 ${site.url}`
    ).join('\n\n')

    console.log('数据库网站总数:', availableForRecommendation.length)
    console.log('用户已收藏网站数量:', websites?.length || 0)

    const systemMessage: ZhipuChatMessage = {
      role: 'system',
      content: `你是一个智能导航助手 🤖。

📊 用户当前收藏情况：
📁 分类信息：
${categoryInfo}

🌐 用户已收藏的网站：
${websiteInfo}

🎯 数据库中所有可推荐的网站：
${recommendationPool}

💡 你的能力：
1. 根据用户的具体问题内容，从数据库中推荐0-3个最相关的网站
2. 回答各种网站使用、技术工具、行业趋势等问题
3. 提供专业的建议和解答

🔥 重要推荐规则：
- 根据用户问题的具体内容来判断是否需要推荐网站
- 如果问题与某些网站功能相关，可以推荐对应的网站
- 推荐时要说明网站如何解决用户的问题或满足需求
- 推荐数量：0-3个网站（根据相关性决定）
- 可以推荐用户已收藏的网站，如果它们与问题高度相关
- 如果用户问设计相关问题，推荐设计工具网站
- 如果用户问开发相关问题，推荐开发工具网站
- 如果用户问学习相关问题，推荐学习资源网站
- 如果问题不需要推荐网站，就不推荐

📝 推荐格式（非常重要）：
当需要推荐网站时，请严格按照以下格式在回复中包含特殊标记：
[RECOMMEND:完整的网站URL]

✅ 正确示例：
针对你的UI设计问题，我推荐这些工具：
[RECOMMEND:https://figma.com]
[RECOMMEND:https://www.sketch.com]

❌ 错误格式：
- RECOMMEND:https://figma.com （缺少方括号）
- [RECOMMEND:figma.com] （缺少协议）
- [推荐:https://figma.com] （使用中文）

🎯 推荐策略：
1. 必须从"数据库中所有可推荐的网站"中选择
2. 根据问题相关性推荐0-3个网站
3. 在推荐标记前后提供自然的中文解释
4. 说明推荐的网站如何帮助解决用户的问题

请用中文回复，保持友好、专业且富有洞察力的语调。`
    }

    const allMessages: ZhipuChatMessage[] = [systemMessage, ...messages]

    // 创建流式响应
    const stream = await zhipuAI.chatStream(allMessages)

    // 创建转换流来处理SSE格式和推荐提取
    let fullResponse = ''
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const decoder = new TextDecoder()
        const text = decoder.decode(chunk)
        
        // 处理SSE数据
        const lines = text.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              // 在结束时提取推荐
              const recommendations = extractRecommendations(fullResponse, availableForRecommendation)
              console.log('AI完整回复:', fullResponse)
              console.log('提取到的推荐:', recommendations.length)
              if (recommendations.length > 0) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ 
                  content: '',
                  recommendations 
                })}\n\n`))
              }
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              return
            }
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.choices?.[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content
                fullResponse += content
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    })

    const processedStream = stream.pipeThrough(transformStream)

    return new Response(processedStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Error in AI chat stream:', error)
    return new Response(JSON.stringify({ success: false, error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// 从AI回复中提取推荐网站
function extractRecommendations(response: string, availableWebsites: any[]): any[] {
  const recommendRegex = /\[RECOMMEND:(https?:\/\/[^\]]+)\]/g
  const matches = [...response.matchAll(recommendRegex)]
  
  console.log('推荐提取 - 搜索模式匹配数:', matches.length)
  
  const recommendedUrls = matches.map(match => match[1])
  console.log('推荐提取 - 提取到的URLs:', recommendedUrls)
  
  // 找到对应的网站信息
  const recommendations = recommendedUrls
    .map(url => availableWebsites.find(w => w.url === url))
    .filter(Boolean)
    .slice(0, 3) // 最多推荐3个
    .map(site => ({
      id: site.id,
      url: site.url,
      title: site.title,
      description: site.description,
      category: site.categoryId,
      tags: Array.isArray(site.tags) ? site.tags : [],
      favicon: site.favicon,
      visitCount: site.visitCount,
      createdAt: site.createdAt,
      lastVisited: site.lastVisited
    }))

  console.log('推荐提取 - 最终推荐网站:', recommendations.map(r => r.title))
  return recommendations
}