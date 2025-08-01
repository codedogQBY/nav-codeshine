import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始创建种子数据...')

  // 创建初始分类
  const categories = [
    { name: '开发工具', icon: 'Code', sortOrder: 1 },
    { name: '设计工具', icon: 'Palette', sortOrder: 2 },
    { name: '学习资源', icon: 'BookOpen', sortOrder: 3 },
    { name: '娱乐媒体', icon: 'Video', sortOrder: 4 },
    { name: '实用工具', icon: 'Wrench', sortOrder: 5 },
    { name: '社交媒体', icon: 'MessageCircle', sortOrder: 6 },
    { name: '新闻资讯', icon: 'Newspaper', sortOrder: 7 },
    { name: '金融理财', icon: 'TrendingUp', sortOrder: 8 }
  ]

  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData,
    })
    console.log(`创建分类: ${category.name}`)
  }

  // 创建一些示例网站
  const websites = [
    // 开发工具
    {
      url: 'https://github.com',
      title: 'GitHub',
      description: '全球最大的代码托管和协作开发平台',
      categoryName: '开发工具',
      tags: ['代码托管', '版本控制', '开源', '协作开发'],
      favicon: 'https://github.com/favicon.ico'
    },
    {
      url: 'https://vercel.com',
      title: 'Vercel',
      description: '现代化的前端部署和托管平台',
      categoryName: '开发工具',
      tags: ['前端部署', '静态网站', 'Serverless', 'CI/CD'],
      favicon: 'https://vercel.com/favicon.ico'
    },
    {
      url: 'https://docs.docker.com',
      title: 'Docker',
      description: '容器化应用部署和管理平台',
      categoryName: '开发工具',
      tags: ['容器化', 'DevOps', '应用部署', '微服务'],
      favicon: 'https://docs.docker.com/favicon.ico'
    },
    
    // 设计工具
    {
      url: 'https://figma.com',
      title: 'Figma',
      description: '专业的界面设计和原型制作工具',
      categoryName: '设计工具',
      tags: ['UI设计', '原型制作', '协作设计', '界面设计'],
      favicon: 'https://static.figma.com/app/icon/1/favicon.ico'
    },
    {
      url: 'https://www.sketch.com',
      title: 'Sketch',
      description: 'Mac平台专业的UI设计工具',
      categoryName: '设计工具',
      tags: ['UI设计', 'Mac应用', '界面设计', '矢量设计'],
      favicon: 'https://www.sketch.com/favicon.ico'
    },
    {
      url: 'https://www.adobe.com/products/xd.html',
      title: 'Adobe XD',
      description: 'Adobe出品的UX/UI设计和原型工具',
      categoryName: '设计工具',
      tags: ['UX设计', 'UI设计', '原型制作', 'Adobe'],
      favicon: 'https://www.adobe.com/favicon.ico'
    },
    
    // 学习资源
    {
      url: 'https://stackoverflow.com',
      title: 'Stack Overflow',
      description: '程序员问答社区和知识分享平台',
      categoryName: '学习资源',
      tags: ['编程问答', '技术交流', '开发者社区', '编程学习'],
      favicon: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico'
    },
    {
      url: 'https://developer.mozilla.org',
      title: 'MDN Web Docs',
      description: 'Web开发技术权威文档和学习资源',
      categoryName: '学习资源',
      tags: ['Web开发', '技术文档', 'JavaScript', 'HTML'],
      favicon: 'https://developer.mozilla.org/favicon.ico'
    },
    {
      url: 'https://www.freecodecamp.org',
      title: 'freeCodeCamp',
      description: '免费的编程学习平台和社区',
      categoryName: '学习资源',
      tags: ['编程学习', '免费课程', '认证项目', '开发者培训'],
      favicon: 'https://www.freecodecamp.org/favicon.ico'
    },
    
    // 实用工具
    {
      url: 'https://tinypng.com',
      title: 'TinyPNG',
      description: '在线图片压缩工具，保持质量的同时减少文件大小',
      categoryName: '实用工具',
      tags: ['图片压缩', '优化', '在线工具', 'PNG'],
      favicon: 'https://tinypng.com/favicon.ico'
    },
    {
      url: 'https://www.json.org',
      title: 'JSON.org',
      description: 'JSON数据格式的官方介绍和验证工具',
      categoryName: '实用工具',
      tags: ['JSON', '数据格式', 'API', '开发工具'],
      favicon: 'https://www.json.org/favicon.ico'
    },
    
    // 娱乐媒体
    {
      url: 'https://www.youtube.com',
      title: 'YouTube',
      description: '全球最大的视频分享和观看平台',
      categoryName: '娱乐媒体',
      tags: ['视频', '娱乐', '学习', '音乐'],
      favicon: 'https://www.youtube.com/favicon.ico'
    },
    {
      url: 'https://open.spotify.com',
      title: 'Spotify',
      description: '全球领先的音乐流媒体平台',
      categoryName: '娱乐媒体',
      tags: ['音乐', '流媒体', '播客', '娱乐'],
      favicon: 'https://open.spotify.com/favicon.ico'
    },
    
    // 社交媒体
    {
      url: 'https://twitter.com',
      title: 'Twitter',
      description: '实时信息分享和社交网络平台',
      categoryName: '社交媒体',
      tags: ['社交网络', '微博客', '实时资讯', '新闻'],
      favicon: 'https://twitter.com/favicon.ico'
    },
    {
      url: 'https://www.linkedin.com',
      title: 'LinkedIn',
      description: '职业社交网络和求职招聘平台',
      categoryName: '社交媒体',
      tags: ['职业社交', '求职', '招聘', '商务网络'],
      favicon: 'https://www.linkedin.com/favicon.ico'
    },
    
    // 新闻资讯
    {
      url: 'https://news.ycombinator.com',
      title: 'Hacker News',
      description: '技术创业者和程序员的新闻聚合平台',
      categoryName: '新闻资讯',
      tags: ['科技新闻', '创业', '程序员', '技术讨论'],
      favicon: 'https://news.ycombinator.com/favicon.ico'
    },
    {
      url: 'https://medium.com',
      title: 'Medium',
      description: '高质量的文章发布和阅读平台',
      categoryName: '新闻资讯',
      tags: ['博客', '文章', '写作', '知识分享'],
      favicon: 'https://medium.com/favicon.ico'
    },
    
    // 金融理财
    {
      url: 'https://www.coinbase.com',
      title: 'Coinbase',
      description: '领先的加密货币交易和钱包平台',
      categoryName: '金融理财',
      tags: ['加密货币', '区块链', '投资', '数字钱包'],
      favicon: 'https://www.coinbase.com/favicon.ico'
    },
    {
      url: 'https://finance.yahoo.com',
      title: 'Yahoo Finance',
      description: '股票行情、财经新闻和投资分析平台',
      categoryName: '金融理财',
      tags: ['股票', '财经新闻', '投资分析', '市场数据'],
      favicon: 'https://finance.yahoo.com/favicon.ico'
    }
  ]

  for (const websiteData of websites) {
    // 查找分类
    const category = await prisma.category.findUnique({
      where: { name: websiteData.categoryName }
    })

    if (category) {
      const website = await prisma.website.upsert({
        where: { url: websiteData.url },
        update: {},
        create: {
          url: websiteData.url,
          title: websiteData.title,
          description: websiteData.description,
          categoryId: category.id,
          tags: websiteData.tags,
          favicon: websiteData.favicon,
          visitCount: 0
        }
      })
      console.log(`创建网站: ${website.title}`)
    }
  }

  console.log('种子数据创建完成!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })