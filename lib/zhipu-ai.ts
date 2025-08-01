export interface ZhipuChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ZhipuChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

class ZhipuAI {
  private apiKey: string
  private baseURL: string = 'https://open.bigmodel.cn/api/paas/v4'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async chat(messages: ZhipuChatMessage[], model: string = 'glm-4-flash', stream: boolean = false): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 128000,
          stream,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      if (stream) {
        // 返回流式响应
        return response.body as any
      } else {
        const data: ZhipuChatResponse = await response.json()
        
        if (data.choices && data.choices.length > 0) {
          return data.choices[0].message.content
        } else {
          throw new Error('No response from AI')
        }
      }
    } catch (error) {
      console.error('Zhipu AI API Error:', error)
      throw error
    }
  }

  // 新增流式聊天方法
  async chatStream(messages: ZhipuChatMessage[], model: string = 'glm-4-flash'): Promise<ReadableStream> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 128000,
          stream: true,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      return response.body!
    } catch (error) {
      console.error('Zhipu AI Stream API Error:', error)
      throw error
    }
  }

  async analyzeWebsite(
    url: string, 
    title: string, 
    description: string, 
    keywords?: string[], 
    existingCategories?: { name: string; icon: string; count: number }[],
    pageContent?: string // 新增页面内容参数
  ): Promise<{
    category: string
    tags: string[]
    description: string
    suggestedCategoryIcon?: string
  }> {
    const messages: ZhipuChatMessage[] = [
      {
        role: 'system',
        content: `你是一个专业的网站分析师。请根据提供的网站信息，进行智能分析并返回合适的分类、标签和优化后的描述。

${existingCategories && existingCategories.length > 0 ? `
🔥 当前数据库中已有的分类（按使用频率排序）：
${existingCategories.map((cat, index) => `${index + 1}. "${cat.name}" (${cat.count}个网站)`).join('\n')}

🚨 严格要求：你必须从上述现有分类中选择一个！
📋 分类匹配规则：
- 金融/投资/理财/股票/基金/银行 → 选择"金融理财"
- 设计/UI/原型/Figma/Sketch → 选择"设计工具"  
- 编程/代码/GitHub/开发 → 选择"开发工具"
- 视频/音乐/电影/游戏 → 选择"娱乐媒体"
- 新闻/博客/资讯/文章 → 选择"新闻资讯"
- 社交/聊天/通讯/微博 → 选择"社交媒体"
- 学习/教育/课程/培训 → 选择"学习资源"
- 其他工具类 → 选择"实用工具"

❌ 禁止行为：
- 禁止创建与现有分类相似的新分类！
- 禁止创建"金融投资"（应该选择"金融理财"）
- 禁止创建"UI设计"（应该选择"设计工具"）
- 禁止创建"编程工具"（应该选择"开发工具"）

✅ 你的任务：从现有的${existingCategories.length}个分类中选择最合适的一个！
` : ''}

分析规则：
1. 🎯 分类选择（强制要求）：
   ⭐ 第一步：检查现有分类列表，找到最相关的分类
   ⭐ 第二步：如果有多个候选，选择最常用的（网站数量多的）
   ⭐ 第三步：只有在所有现有分类都完全不相关时才能创建新分类
   ⭐ 判断标准：只要有30%相关性就应该选择现有分类

2. 标签生成：必须生成3-5个相关标签，标签应该：
   - 基于页面实际内容和功能特点
   - 反映网站的核心功能和特点
   - 包含行业关键词和用户搜索词
   - 覆盖技术栈、使用场景、目标用户等维度

3. 描述优化：
   - 必须基于页面实际内容和网站的实际功能生成全新的描述
   - 不要直接使用网页自带的描述，要重新组织语言
   - 描述要简洁准确（30-80字），突出核心价值和用途
   - 使用客观、专业的语调，避免营销性语言

4. 图标建议：使用Lucide React图标的大驼峰命名格式

常见分类及推荐图标（仅供参考，优先使用现有分类）：
- 代码开发：Code, Terminal, GitBranch, Database
- UI设计：Palette, Paintbrush, Pen, Image  
- 在线工具：Wrench, Settings, Tool, Zap
- 学习资源：BookOpen, GraduationCap, Library, Brain
- 娱乐媒体：Gamepad2, Music, Video, Smile
- 社交通讯：MessageCircle, Users, MessageSquare, Share2
- 新闻博客：Newspaper, Radio, Rss, FileText
- 电商购物：ShoppingBag, ShoppingCart, Store, CreditCard
- 本地服务：MapPin, Map, Home, Calendar
- 金融投资：TrendingUp, BarChart3, DollarSign, PieChart, Coins
- 健康医疗：Heart, Activity, Stethoscope, Shield
- 旅行交通：Plane, Car, Navigation, Compass

重要提醒：
- 🔥 必须从现有分类中选择，不能创建新分类（除非完全不相关）
- 📝 必须提供有意义的标签，不能为空
- 💬 必须生成全新的描述，不要使用原网页描述
- 🎨 suggestedCategoryIcon必须是标准的Lucide图标名称

分类选择验证清单：
✅ 我检查了所有现有分类
✅ 我选择了最相关的现有分类
✅ 我没有创建相似的新分类
❌ 我绝不会创建"金融投资"、"UI设计"、"编程工具"等相似分类

请以JSON格式回复（category字段必须是现有分类名称）：
{
  "category": "必须从现有分类中选择",
  "tags": ["必须提供3-5个标签"],
  "description": "基于网站功能重新生成的描述（30-80字）",
  "suggestedCategoryIcon": "TrendingUp"
}`
      },
      {
        role: 'user',
        content: `请分析以下网站信息：
网站URL: ${url}
网站标题: ${title}
网站描述: ${description}
关键词: ${keywords?.join(', ') || '无'}
${pageContent ? `\n页面主要内容: ${pageContent.substring(0, 1000)}${pageContent.length > 1000 ? '...' : ''}` : ''}

请基于以上信息（特别是页面内容）提供详细的分析结果。`
      }
    ]

    try {
      const response = await this.chat(messages, 'glm-4-flash')
      
      // 清理AI返回的内容，移除可能的代码块标记
      let cleanedResponse = response.trim()
      
      // 移除可能的代码块标记
      if (cleanedResponse.includes('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '')
      }
      if (cleanedResponse.includes('```')) {
        cleanedResponse = cleanedResponse.replace(/```\s*$/g, '')
      }
      
      console.log('清理后的AI响应:', cleanedResponse)
      
      const analysis = JSON.parse(cleanedResponse)
      
      // 验证返回的数据结构
      if (!analysis.category || !Array.isArray(analysis.tags)) {
        throw new Error('AI返回的数据格式不正确')
      }

      // 验证AI是否选择了现有分类
      if (existingCategories && existingCategories.length > 0) {
        const categoryExists = existingCategories.some(cat => cat.name === analysis.category)
        if (!categoryExists) {
          console.warn(`AI创建了新分类"${analysis.category}"，但应该优先选择现有分类`)
          console.warn('现有分类:', existingCategories.map(cat => cat.name).join(', '))
          
          // 尝试找到最相似的现有分类
          const similarCategory = this.findMostSimilarCategory(analysis.category, existingCategories)
          if (similarCategory) {
            console.log(`自动修正为相似的现有分类: ${similarCategory.name}`)
            analysis.category = similarCategory.name
          }
        }
      }

      return {
        category: analysis.category,
        tags: analysis.tags.slice(0, 5), // 最多5个标签
        description: analysis.description || `${title} - ${analysis.category}相关服务`, // 如果AI没有生成描述，创建一个基于标题和分类的描述
        suggestedCategoryIcon: analysis.suggestedCategoryIcon
      }
    } catch (error) {
      console.error('AI分析网站失败:', error)
      
      // 降级到基于关键词的简单分析
      return this.simpleAnalyzeWebsite(url, title, description, keywords)
    }
  }

  // 简单的基于规则的网站分析（作为AI分析的后备）
  private simpleAnalyzeWebsite(url: string, title: string, description: string, keywords?: string[]): {
    category: string
    tags: string[]
    description: string
    suggestedCategoryIcon?: string
  } {
    const content = `${title} ${description} ${keywords?.join(' ') || ''}`.toLowerCase()
    
    // 基于关键词的智能分类 - 优先具体分类
    const categoryRules = [
      { 
        keywords: ['github', 'gitlab', 'bitbucket', 'code', 'repository', '代码', '仓库'], 
        category: '代码托管', 
        icon: 'GitBranch',
        tags: ['代码管理', '版本控制', '开源', '协作开发']
      },
      { 
        keywords: ['figma', 'sketch', 'adobe', 'design', 'ui', 'ux', '设计'], 
        category: 'UI设计工具', 
        icon: 'Palette',
        tags: ['界面设计', 'UI设计', '原型制作', '设计工具']
      },
      { 
        keywords: ['trading', 'stock', 'investment', 'finance', '股票', '交易', '投资', '证券'], 
        category: '股票交易', 
        icon: 'TrendingUp',
        tags: ['股票投资', '金融交易', '证券市场', '投资理财']
      },
      { 
        keywords: ['crypto', 'bitcoin', 'blockchain', '加密', '比特币', '区块链'], 
        category: '加密货币', 
        icon: 'Coins',
        tags: ['数字货币', '加密交易', '区块链', '虚拟货币']
      },
      { 
        keywords: ['translate', 'translation', '翻译', '语言'], 
        category: '在线翻译', 
        icon: 'Globe',
        tags: ['语言翻译', '多语言', '在线工具', '文本翻译']
      },
      { 
        keywords: ['video', 'youtube', 'streaming', '视频', '直播'], 
        category: '视频平台', 
        icon: 'Video',
        tags: ['视频播放', '在线视频', '流媒体', '视频分享']
      },
      { 
        keywords: ['music', 'spotify', 'audio', '音乐', '音频'], 
        category: '音乐平台', 
        icon: 'Music',
        tags: ['在线音乐', '音频播放', '音乐流媒体', '音乐分享']
      },
      { 
        keywords: ['news', 'blog', 'article', '新闻', '博客', '文章'], 
        category: '新闻博客', 
        icon: 'Newspaper',
        tags: ['新闻资讯', '文章阅读', '媒体内容', '信息获取']
      },
      { 
        keywords: ['shop', 'buy', 'store', 'ecommerce', '购物', '商店', '电商'], 
        category: '在线购物', 
        icon: 'ShoppingBag',
        tags: ['在线购物', '电子商务', '商品销售', '购买服务']
      },
      { 
        keywords: ['learn', 'education', 'course', 'tutorial', '学习', '教育', '课程'], 
        category: '在线学习', 
        icon: 'BookOpen',
        tags: ['在线教育', '学习资源', '知识获取', '技能培训']
      },
      { 
        keywords: ['game', 'gaming', 'play', '游戏', '娱乐'], 
        category: '在线游戏', 
        icon: 'Gamepad2',
        tags: ['网页游戏', '休闲娱乐', '游戏平台', '互动娱乐']
      },
      { 
        keywords: ['chat', 'message', 'social', '聊天', '社交', '消息'], 
        category: '社交通讯', 
        icon: 'MessageCircle',
        tags: ['即时通讯', '社交网络', '在线聊天', '沟通工具']
      },
      { 
        keywords: ['tool', 'utility', 'converter', '工具', '转换', '实用'], 
        category: '实用工具', 
        icon: 'Wrench',
        tags: ['在线工具', '实用功能', '效率工具', '便民服务']
      },
      { 
        keywords: ['programming', 'developer', 'api', 'documentation', '编程', '开发'], 
        category: '开发工具', 
        icon: 'Code',
        tags: ['软件开发', '编程工具', 'API服务', '开发资源']
      }
    ]

    // 查找匹配的分类
    for (const rule of categoryRules) {
      if (rule.keywords.some(keyword => content.includes(keyword))) {
        return {
          category: rule.category,
          tags: [...rule.tags, ...this.extractTagsFromContent(content, title, description)].slice(0, 5),
          description: this.generateSimpleDescription(title, rule.category, description),
          suggestedCategoryIcon: rule.icon
        }
      }
    }

    // 如果没有匹配，基于URL域名创建分类
    const domainCategory = this.createCategoryFromDomain(url)
    
    return {
      category: domainCategory.category,
      tags: domainCategory.tags,
      description: this.generateSimpleDescription(title, domainCategory.category, description),
      suggestedCategoryIcon: domainCategory.icon
    }
  }

  // 基于域名创建分类（避免使用"其他"）
  private createCategoryFromDomain(url: string): {
    category: string
    tags: string[]
    icon: string
  } {
    try {
      const domain = new URL(url).hostname.toLowerCase()
      
      // 知名网站域名识别
      const domainMap: Record<string, { category: string, tags: string[], icon: string }> = {
        'github.com': { category: '代码托管', tags: ['开源代码', '版本控制', '开发者社区'], icon: 'GitBranch' },
        'figma.com': { category: 'UI设计工具', tags: ['界面设计', '协作设计', '原型制作'], icon: 'Palette' },
        'youtube.com': { category: '视频平台', tags: ['视频播放', '在线视频', '视频分享'], icon: 'Video' },
        'twitter.com': { category: '社交媒体', tags: ['社交网络', '微博客', '实时资讯'], icon: 'MessageCircle' },
        'linkedin.com': { category: '职业社交', tags: ['职业网络', '求职招聘', '商务社交'], icon: 'Users' },
        'medium.com': { category: '内容平台', tags: ['文章发布', '知识分享', '博客平台'], icon: 'PenTool' },
        'stackoverflow.com': { category: '开发社区', tags: ['编程问答', '技术交流', '开发者社区'], icon: 'Code' }
      }
      
      for (const [key, value] of Object.entries(domainMap)) {
        if (domain.includes(key)) {
          return value
        }
      }
      
      // 基于域名后缀推测类型
      if (domain.includes('.edu')) {
        return { category: '教育机构', tags: ['教育资源', '学术网站', '高等教育'], icon: 'GraduationCap' }
      }
      if (domain.includes('.gov')) {
        return { category: '政府服务', tags: ['政府网站', '公共服务', '官方信息'], icon: 'Building' }
      }
      if (domain.includes('.org')) {
        return { category: '组织机构', tags: ['非营利组织', '公益机构', '社会组织'], icon: 'Users' }
      }
      
      // 基于域名关键词
      if (domain.includes('shop') || domain.includes('store') || domain.includes('mall')) {
        return { category: '在线商店', tags: ['电子商务', '在线购物', '商品销售'], icon: 'ShoppingBag' }
      }
      if (domain.includes('blog') || domain.includes('news')) {
        return { category: '内容网站', tags: ['内容发布', '信息分享', '文章阅读'], icon: 'FileText' }
      }
      if (domain.includes('app') || domain.includes('tool')) {
        return { category: '在线应用', tags: ['网页应用', '在线工具', '实用服务'], icon: 'Smartphone' }
      }
      
      // 最后的默认分类 - 基于域名创建有意义的分类
      const siteName = domain.split('.')[0].replace(/^www\./, '')
      const capitalizedName = siteName.charAt(0).toUpperCase() + siteName.slice(1)
      
      return {
        category: `${capitalizedName}服务`,
        tags: ['在线服务', '网站平台', '互联网服务'],
        icon: 'Globe'
      }
      
    } catch {
      return {
        category: '网络服务',
        tags: ['在线平台', '网络服务', '互联网应用'],
        icon: 'Globe'
      }
    }
  }

  // 从内容中提取更多标签
  private extractTagsFromContent(content: string, title: string, description: string): string[] {
    const allText = `${title} ${description}`.toLowerCase()
    
    const tagKeywords = [
      // 技术相关
      '人工智能', 'AI', '机器学习', '区块链', '云计算', '大数据',
      '前端', '后端', '全栈', '移动开发', '数据分析', '算法',
      // 功能相关  
      '免费', '付费', '订阅', '会员', '企业版', '个人版',
      '实时', '离线', '同步', '云端', '本地', '跨平台',
      // 行业相关
      '金融', '教育', '医疗', '电商', '游戏', '媒体',
      '设计', '营销', '办公', '娱乐', '社交', '新闻'
    ]

    const extractedTags = tagKeywords.filter(keyword => 
      allText.includes(keyword.toLowerCase())
    )

    // 如果提取的标签少于2个，添加通用标签
    if (extractedTags.length < 2) {
      extractedTags.push('在线服务', '网页应用')
    }

    return extractedTags.slice(0, 3)
  }

  // 生成简单的描述（用于AI分析失败时的回退）
  private generateSimpleDescription(title: string, category: string, originalDescription: string): string {
    // 如果原始描述简洁且有意义，保留部分内容
    const cleanTitle = title.replace(/[\s\-_]+/g, ' ').trim()
    
    // 基于分类生成描述模板
    const categoryDescriptions: Record<string, string> = {
      '代码托管': '提供代码版本管理和协作开发服务',
      'UI设计工具': '专业的界面设计和原型制作平台',
      '股票交易': '提供股票投资和金融交易服务',
      '加密货币': '数字货币交易和区块链服务平台',
      '在线翻译': '多语言翻译和语言学习工具',
      '视频平台': '在线视频播放和内容分享平台',
      '音乐平台': '数字音乐播放和音频内容服务',
      '新闻博客': '提供新闻资讯和内容发布服务',
      '在线购物': '电子商务和在线购物平台',
      '在线学习': '教育培训和知识分享平台',
      '在线游戏': '网页游戏和娱乐互动平台',
      '社交通讯': '社交网络和即时通讯服务',
      '实用工具': '提供各类在线工具和实用功能',
      '开发工具': '面向开发者的编程和开发工具'
    }

    // 尝试使用分类模板
    const categoryTemplate = categoryDescriptions[category]
    if (categoryTemplate) {
      return `${cleanTitle} - ${categoryTemplate}`
    }

    // 如果原始描述存在且不太长，进行简化处理
    if (originalDescription && originalDescription.length > 10 && originalDescription.length < 200) {
      const simplified = originalDescription
        .replace(/[（(].+?[）)]/g, '') // 移除括号内容
        .replace(/[，,。.！!？?；;：:]+/g, '，') // 标准化标点
        .replace(/\s+/g, ' ') // 标准化空格
        .trim()
      
      if (simplified.length > 80) {
        return simplified.substring(0, 77) + '...'
      }
      return simplified
    }

    // 最后的回退：基于标题和分类
    return `${cleanTitle} - ${category}相关服务平台`
  }

  // 找到最相似的现有分类
  private findMostSimilarCategory(newCategory: string, existingCategories: { name: string; icon: string; count: number }[]): { name: string; icon: string; count: number } | null {
    const similarities = existingCategories.map(cat => ({
      category: cat,
      similarity: this.calculateCategorySimilarity(newCategory, cat.name)
    }))

    // 按相似度排序，选择最相似的
    similarities.sort((a, b) => b.similarity - a.similarity)
    
    // 如果最高相似度大于0.3，则使用该分类
    if (similarities[0] && similarities[0].similarity > 0.3) {
      return similarities[0].category
    }

    return null
  }

  // 计算分类名称相似度
  private calculateCategorySimilarity(str1: string, str2: string): number {
    // 简单的关键词匹配算法
    const keywords1 = this.extractCategoryKeywords(str1)
    const keywords2 = this.extractCategoryKeywords(str2)
    
    let matchCount = 0
    keywords1.forEach(keyword1 => {
      keywords2.forEach(keyword2 => {
        if (keyword1.includes(keyword2) || keyword2.includes(keyword1)) {
          matchCount++
        }
      })
    })

    return matchCount / Math.max(keywords1.length, keywords2.length)
  }

  // 提取分类关键词
  private extractCategoryKeywords(categoryName: string): string[] {
    const keywordMap: Record<string, string[]> = {
      '金融': ['金融', '理财', '投资', '股票', '基金', '银行', '财务'],
      '设计': ['设计', 'UI', '界面', '原型', '视觉', '创意'],
      '开发': ['开发', '编程', '代码', '程序', '技术', '软件'],
      '工具': ['工具', '实用', '应用', '服务'],
      '学习': ['学习', '教育', '培训', '课程', '知识'],
      '娱乐': ['娱乐', '游戏', '视频', '音乐', '电影'],
      '媒体': ['媒体', '新闻', '资讯', '博客', '文章'],
      '社交': ['社交', '聊天', '通讯', '交流', '分享']
    }

    const result: string[] = []
    Object.entries(keywordMap).forEach(([key, keywords]) => {
      if (keywords.some(keyword => categoryName.includes(keyword))) {
        result.push(...keywords)
      }
    })

    return result.length > 0 ? result : [categoryName]
  }

  async recommendWebsites(userInterests: string[], visitHistory: string[]): Promise<string[]> {
    const messages: ZhipuChatMessage[] = [
      {
        role: 'system',
        content: '你是一个智能网站推荐助手。根据用户的兴趣和访问历史，推荐5-10个相关的优质网站。请只返回网站URL，每行一个。'
      },
      {
        role: 'user',
        content: `用户兴趣: ${userInterests.join(', ')}\n访问历史: ${visitHistory.join(', ')}`
      }
    ]

    try {
      const response = await this.chat(messages)
      return response.split('\n').filter(url => url.trim().startsWith('http'))
    } catch (error) {
      console.error('Failed to recommend websites:', error)
      return []
    }
  }
}

const zhipuAI = new ZhipuAI(process.env.ZHIPU_API_KEY || '')

export { zhipuAI }