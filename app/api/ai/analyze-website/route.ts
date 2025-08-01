import { NextRequest, NextResponse } from 'next/server'
import { WebsiteExtractor } from '@/lib/website-extractor-new'
import { zhipuAI } from '@/lib/zhipu-ai'
import { CategoryService } from '@/lib/category-service'
import { IconNameUtil } from '@/lib/icon-utils'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    console.log(`开始分析网站: ${url}`)

    // 第一步：获取数据库中所有现有分类
    const existingCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: { websites: true }
        }
      }
    })

    // 按使用频率排序（在JavaScript中排序）
    const sortedCategories = existingCategories.sort((a, b) => b._count.websites - a._count.websites)

    const categoryList = sortedCategories.map(cat => ({
      name: cat.name,
      icon: cat.icon,
      count: cat._count.websites
    }))

    console.log('数据库中现有分类:', categoryList)

    // 第二步：提取网站基本信息
    const extractedInfo = await WebsiteExtractor.extractWebsiteInfo(url)
    console.log('提取的网站信息:', extractedInfo)

    // 第三步：使用AI分析网站内容，生成分类和标签（传入现有分类和页面内容作参考）
    const aiAnalysis = await zhipuAI.analyzeWebsite(
      url,
      extractedInfo.title,
      extractedInfo.description,
      extractedInfo.keywords,
      categoryList, // 传入现有分类列表
      extractedInfo.pageContent // 传入页面内容
    )
    console.log('AI分析结果:', aiAnalysis)

    // 第四步：查找或创建分类 (确保图标名称正确转换)
    const normalizedIcon = IconNameUtil.normalize(aiAnalysis.suggestedCategoryIcon)
    const category = await CategoryService.findOrCreateCategory(
      aiAnalysis.category,
      normalizedIcon
    )
    console.log('分类信息:', category)

    // 第五步：获取高质量图标
    let favicon = extractedInfo.favicon
    if (!favicon || favicon.includes('placeholder')) {
      favicon = await WebsiteExtractor.getHighQualityFavicon(url)
    }

    // 第六步：建议相似分类（用于前端提示）
    const similarCategories = await CategoryService.suggestSimilarCategories(aiAnalysis.category)

    const result = {
      // 提取的基本信息
      url: url,
      title: extractedInfo.title,
      description: aiAnalysis.description, // 使用AI优化后的描述
      favicon: favicon,
      
      // AI分析结果
      categoryId: category.id,
      categoryName: category.name,
      tags: aiAnalysis.tags,
      
      // 额外信息
      extractedKeywords: extractedInfo.keywords,
      ogImage: extractedInfo.ogImage,
      siteName: extractedInfo.siteName,
      
      // 建议信息
      suggestedCategoryIcon: aiAnalysis.suggestedCategoryIcon,
      similarCategories: similarCategories,
      
      // 是否为新创建的分类
      isNewCategory: category.count === 0
    }

    console.log('最终分析结果:', result)

    return NextResponse.json({ 
      success: true, 
      data: result 
    })
  } catch (error) {
    console.error('网站分析失败:', error)
    
    // 提供基本的错误恢复
    const body = await request.json().catch(() => ({}))
    const url = body.url || 'unknown'
    
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze website',
      data: {
        url: url,
        title: WebsiteExtractor.getTitleFromUrl(url),
        description: '',
        favicon: '/placeholder.svg?height=32&width=32',
        categoryId: null,
        categoryName: '其他',
        tags: [],
        extractedKeywords: [],
        similarCategories: [],
        isNewCategory: false
      }
    }, { status: 200 }) // 返回200但标记为失败，让前端可以使用基本数据
  }
}