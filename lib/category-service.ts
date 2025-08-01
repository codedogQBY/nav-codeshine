import { prisma } from '@/lib/prisma'
import { IconNameUtil } from '@/lib/icon-utils'

export class CategoryService {
  // 根据名称查找或创建分类
  static async findOrCreateCategory(name: string, icon?: string): Promise<{
    id: string
    name: string
    icon: string
    count: number
  }> {
    try {
      // 首先尝试查找现有分类 (MySQL不支持insensitive，使用COLLATE)
      let category = await prisma.category.findFirst({
        where: {
          name: name // MySQL默认不区分大小写
        },
        include: {
          _count: {
            select: { websites: true }
          }
        }
      })

      if (category) {
        return {
          id: category.id,
          name: category.name,
          icon: category.icon,
          count: category._count.websites
        }
      }

      // 如果不存在，创建新分类
      const defaultIcon = IconNameUtil.normalize(icon) || this.getDefaultIconForCategory(name)
      
      // 获取当前最大的sortOrder值，新分类排在最后
      const maxSortOrder = await prisma.category.aggregate({
        _max: {
          sortOrder: true
        }
      })
      const nextSortOrder = (maxSortOrder._max.sortOrder || 0) + 1
      
      category = await prisma.category.create({
        data: {
          name,
          icon: defaultIcon,
          sortOrder: nextSortOrder
        },
        include: {
          _count: {
            select: { websites: true }
          }
        }
      })

      console.log(`自动创建新分类: ${name} (图标: ${defaultIcon})`)

      return {
        id: category.id,
        name: category.name,
        icon: category.icon,
        count: category._count.websites
      }
    } catch (error) {
      console.error('创建或查找分类失败:', error)
      throw new Error(`无法创建分类: ${name}`)
    }
  }

  // 根据分类名称获取默认图标
  private static getDefaultIconForCategory(categoryName: string): string {
    const iconMap: Record<string, string> = {
      // 工具类
      '工具效率': 'Wrench',
      '实用工具': 'Tool',
      '在线工具': 'Globe',
      
      // 开发类
      '开发技术': 'Code',
      '编程开发': 'Code',
      '技术文档': 'FileCode',
      '代码托管': 'GitBranch',
      
      // 设计类
      '设计创意': 'Palette',
      'UI设计': 'Paintbrush',
      '设计工具': 'Pen',
      '创意灵感': 'Lightbulb',
      
      // 学习类
      '学习教育': 'BookOpen',
      '在线课程': 'GraduationCap',
      '知识库': 'Library',
      '教程文档': 'Book',
      
      // 娱乐类
      '娱乐休闲': 'Gamepad2',
      '游戏': 'Gamepad',
      '音乐': 'Music',
      '视频': 'Video',
      
      // 社交类
      '社交媒体': 'MessageCircle',
      '社交平台': 'Users',
      '聊天通讯': 'MessageSquare',
      '社区论坛': 'Users',
      
      // 资讯类
      '新闻资讯': 'Newspaper',
      '博客': 'PenTool',
      '媒体': 'Radio',
      
      // 购物类
      '购物电商': 'ShoppingBag',
      '电商平台': 'ShoppingCart',
      '品牌官网': 'Store',
      
      // 生活类
      '生活服务': 'MapPin',
      '本地服务': 'Map',
      '实用服务': 'Settings',
      
      // 金融类
      '金融理财': 'TrendingUp',
      '银行': 'Building',
      '投资': 'TrendingUp',
      '支付': 'CreditCard',
      '证券': 'BarChart3',
      '股票': 'TrendingUp',
      '基金': 'PieChart',
      
      // 健康类
      '医疗健康': 'Heart',
      '健康管理': 'Activity',
      '健身运动': 'Activity',
      
      // 旅游类  
      '旅游出行': 'Plane',
      '交通': 'Car',
      '地图导航': 'Navigation',
      
      // 办公类
      '办公软件': 'FileText',
      '项目管理': 'Calendar',
      '团队协作': 'Users',
      
      // 数据类
      '数据分析': 'BarChart',
      '数据可视化': 'PieChart',
      '商业智能': 'Brain',
      
      // 技术类
      '人工智能': 'Cpu',
      '机器学习': 'Bot',
      '区块链': 'Link',
      '物联网': 'Wifi',
      '云服务': 'Cloud',
      
      // 默认
      '其他': 'MoreHorizontal',
      '未分类': 'Folder'
    }

    // 精确匹配
    if (iconMap[categoryName]) {
      return iconMap[categoryName]
    }

    // 模糊匹配
    for (const [key, icon] of Object.entries(iconMap)) {
      if (categoryName.includes(key) || key.includes(categoryName)) {
        return icon
      }
    }

    // 基于关键词匹配
    const keywords = categoryName.toLowerCase()
    if (keywords.includes('工具') || keywords.includes('tool')) return 'Wrench'
    if (keywords.includes('开发') || keywords.includes('code') || keywords.includes('编程')) return 'Code'
    if (keywords.includes('设计') || keywords.includes('design')) return 'Palette'
    if (keywords.includes('学习') || keywords.includes('教育') || keywords.includes('learn')) return 'BookOpen'
    if (keywords.includes('游戏') || keywords.includes('娱乐') || keywords.includes('game')) return 'Gamepad2'
    if (keywords.includes('社交') || keywords.includes('social')) return 'MessageCircle'
    if (keywords.includes('新闻') || keywords.includes('资讯') || keywords.includes('news')) return 'Newspaper'
    if (keywords.includes('购物') || keywords.includes('电商') || keywords.includes('shop')) return 'ShoppingBag'
    if (keywords.includes('生活') || keywords.includes('服务') || keywords.includes('life')) return 'MapPin'
    if (keywords.includes('金融') || keywords.includes('理财') || keywords.includes('股票') || keywords.includes('投资')) return 'TrendingUp'
    if (keywords.includes('健康') || keywords.includes('医疗')) return 'Heart'
    if (keywords.includes('旅游') || keywords.includes('出行')) return 'Plane'

    // 默认图标
    return 'MoreHorizontal'
  }

  // 智能建议相似分类（避免创建重复分类）
  static async suggestSimilarCategories(categoryName: string): Promise<string[]> {
    try {
      const existingCategories = await prisma.category.findMany({
        select: { name: true }
      })

      const suggestions = existingCategories
        .map(cat => cat.name)
        .filter(name => {
          const similarity = this.calculateSimilarity(categoryName, name)
          return similarity > 0.6 && similarity < 1.0 // 相似但不完全相同
        })
        .slice(0, 3) // 最多返回3个建议

      return suggestions
    } catch (error) {
      console.error('获取相似分类建议失败:', error)
      return []
    }
  }

  // 计算字符串相似度
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  // 计算编辑距离
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }
}

export default CategoryService