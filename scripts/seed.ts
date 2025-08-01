import { prisma } from '../lib/prisma'

const defaultCategories = [
  { name: "工具效率", icon: "Wrench" },
  { name: "开发技术", icon: "Code" },
  { name: "设计创意", icon: "Palette" },
  { name: "学习教育", icon: "BookOpen" },
  { name: "娱乐休闲", icon: "Gamepad2" },
  { name: "社交媒体", icon: "MessageCircle" },
  { name: "新闻资讯", icon: "Newspaper" },
  { name: "购物电商", icon: "ShoppingBag" },
  { name: "生活服务", icon: "MapPin" },
  { name: "其他", icon: "MoreHorizontal" }
]

const sampleWebsites = [
  {
    url: "https://github.com",
    title: "GitHub",
    description: "全球最大的代码托管平台，开发者协作的首选工具，支持Git版本控制和项目管理",
    tags: ["代码托管", "版本控制", "开源", "协作开发", "Git"],
    favicon: "/placeholder.svg?height=32&width=32",
    visitCount: 15,
  },
  {
    url: "https://figma.com",
    title: "Figma",
    description: "现代化的协作式界面设计工具，支持实时协作和原型制作，设计师团队的必备平台",
    tags: ["UI设计", "UX设计", "原型制作", "协作设计", "矢量设计"],
    favicon: "/placeholder.svg?height=32&width=32",
    visitCount: 8,
  },
  {
    url: "https://notion.so",
    title: "Notion",
    description: "集笔记、知识库、项目管理于一体的全能工作空间，支持团队协作和个人知识管理",
    tags: ["笔记应用", "知识管理", "项目管理", "团队协作", "文档编辑"],
    favicon: "/placeholder.svg?height=32&width=32",
    visitCount: 23,
  }
]

async function seed() {
  try {
    console.log('🌱 开始数据库初始化...')

    // 创建默认分类
    console.log('📁 创建默认分类...')
    const createdCategories = []
    
    for (const category of defaultCategories) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: category.name }
      })
      
      if (!existingCategory) {
        const created = await prisma.category.create({
          data: category
        })
        createdCategories.push(created)
        console.log(`  ✅ 创建分类: ${category.name}`)
      } else {
        createdCategories.push(existingCategory)
        console.log(`  ⏭️  分类已存在: ${category.name}`)
      }
    }

    // 创建示例网站
    console.log('🌐 创建示例网站...')
    const developmentCategory = createdCategories.find(c => c.name === '开发技术')
    const designCategory = createdCategories.find(c => c.name === '设计创意')
    const toolsCategory = createdCategories.find(c => c.name === '工具效率')

    const websitesWithCategories = [
      { ...sampleWebsites[0], categoryId: developmentCategory?.id || createdCategories[0].id },
      { ...sampleWebsites[1], categoryId: designCategory?.id || createdCategories[0].id },
      { ...sampleWebsites[2], categoryId: toolsCategory?.id || createdCategories[0].id }
    ]

    for (const website of websitesWithCategories) {
      const existingWebsite = await prisma.website.findUnique({
        where: { url: website.url }
      })
      
      if (!existingWebsite) {
        await prisma.website.create({
          data: website
        })
        console.log(`  ✅ 创建网站: ${website.title}`)
      } else {
        console.log(`  ⏭️  网站已存在: ${website.title}`)
      }
    }

    console.log('🎉 数据库初始化完成！')
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed()