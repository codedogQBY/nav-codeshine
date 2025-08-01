// 模拟AI网站信息提取服务
export async function extractWebsiteInfo(url: string) {
  // 模拟网络请求延迟
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // 简单的URL解析来模拟AI提取
  const domain = new URL(url).hostname.replace("www.", "")

  // 模拟不同网站的信息提取
  const mockData: Record<string, any> = {
    "github.com": {
      title: "GitHub",
      description: "全球最大的代码托管平台，开发者协作的首选工具",
      tags: ["代码", "开发", "版本控制", "Git", "开源"],
      suggestedCategory: "tools",
      favicon: "/placeholder.svg?height=32&width=32",
    },
    "figma.com": {
      title: "Figma",
      description: "协作式界面设计工具，现代设计团队的必备平台",
      tags: ["设计", "UI", "UX", "协作", "原型"],
      suggestedCategory: "design",
      favicon: "/placeholder.svg?height=32&width=32",
    },
    "notion.so": {
      title: "Notion",
      description: "集笔记、知识库、项目管理于一体的全能工作空间",
      tags: ["笔记", "知识管理", "项目管理", "协作", "文档"],
      suggestedCategory: "work",
      favicon: "/placeholder.svg?height=32&width=32",
    },
    "youtube.com": {
      title: "YouTube",
      description: "全球最大的视频分享平台，观看和分享精彩视频内容",
      tags: ["视频", "娱乐", "学习", "音乐", "教程"],
      suggestedCategory: "entertainment",
      favicon: "/placeholder.svg?height=32&width=32",
    },
    "openai.com": {
      title: "OpenAI",
      description: "人工智能研究公司，ChatGPT和GPT系列模型的开发者",
      tags: ["AI", "人工智能", "ChatGPT", "机器学习", "技术"],
      suggestedCategory: "tools",
      favicon: "/placeholder.svg?height=32&width=32",
    },
  }

  // 如果有预设数据，返回预设数据
  if (mockData[domain]) {
    return mockData[domain]
  }

  // 否则返回基于域名的通用数据
  const siteName = domain.split(".")[0]
  const capitalizedName = siteName.charAt(0).toUpperCase() + siteName.slice(1)

  return {
    title: capitalizedName,
    description: `${capitalizedName} - 一个优质的在线服务平台`,
    tags: ["网站", "在线服务", "工具"],
    suggestedCategory: "other",
    favicon: `/placeholder.svg?height=32&width=32&query=${siteName}+logo`,
  }
}
