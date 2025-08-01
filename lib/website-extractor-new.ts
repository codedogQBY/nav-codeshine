import { parse } from 'node-html-parser'

export interface ExtractedWebsiteInfo {
  title: string
  description: string
  favicon: string
  keywords: string[]
  ogImage?: string
  siteName?: string
  pageContent?: string // 新增：页面主要文本内容
}

export class WebsiteExtractor {
  private static readonly USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  private static readonly TIMEOUT = 10000 // 10秒超时

  static async extractWebsiteInfo(url: string): Promise<ExtractedWebsiteInfo> {
    try {
      // 确保URL格式正确
      const normalizedUrl = this.normalizeUrl(url)
      
      console.log(`正在提取网站信息: ${normalizedUrl}`)

      // 获取网页HTML
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT)

      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      const root = parse(html)

      // 提取基本信息
      const title = this.extractTitle(root, normalizedUrl)
      const description = this.extractDescription(root)
      const favicon = this.extractFavicon(root, normalizedUrl)
      const keywords = this.extractKeywords(root)
      const ogImage = this.extractOgImage(root, normalizedUrl)
      const siteName = this.extractSiteName(root)
      const pageContent = this.extractPageContent(root) // 新增：提取页面内容

      console.log(`提取完成: ${title}`)

      return {
        title,
        description,
        favicon,
        keywords,
        ogImage,
        siteName,
        pageContent
      }
    } catch (error) {
      console.error(`提取网站信息失败 (${url}):`, error)
      
      // 返回基本信息作为后备
      return {
        title: WebsiteExtractor.getTitleFromUrl(url),
        description: '',
        favicon: this.getDefaultFavicon(url),
        keywords: []
      }
    }
  }

  private static normalizeUrl(url: string): string {
    // 如果没有协议，添加 https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    return url
  }

  private static extractTitle(root: any, url: string): string {
    // 尝试多种方式获取标题
    const selectors = [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'title',
      'h1'
    ]

    for (const selector of selectors) {
      const element = root.querySelector(selector)
      if (element) {
        const title = selector.includes('meta') 
          ? element.getAttribute('content')?.trim()
          : element.text?.trim()
        
        if (title && title.length > 0) {
          return title
        }
      }
    }

    return WebsiteExtractor.getTitleFromUrl(url)
  }

  private static extractDescription(root: any): string {
    // 尝试多种方式获取描述
    const selectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[itemprop="description"]'
    ]

    for (const selector of selectors) {
      const element = root.querySelector(selector)
      if (element) {
        const desc = element.getAttribute('content')?.trim()
        if (desc && desc.length > 0) {
          return desc
        }
      }
    }

    // 如果没有找到meta描述，尝试提取第一段文字
    const firstP = root.querySelector('p')
    if (firstP?.text) {
      const text = firstP.text.trim()
      if (text.length > 20) {
        return text.length > 200 ? text.substring(0, 200) + '...' : text
      }
    }

    return ''
  }

  private static extractFavicon(root: any, url: string): string {
    // 尝试多种方式获取图标
    const selectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]',
      'meta[property="og:image"]'
    ]

    for (const selector of selectors) {
      const element = root.querySelector(selector)
      if (element) {
        const iconUrl = element.getAttribute('href') || element.getAttribute('content')
        if (iconUrl) {
          return this.resolveUrl(iconUrl, url)
        }
      }
    }

    return this.getDefaultFavicon(url)
  }

  private static extractKeywords(root: any): string[] {
    const keywordsElement = root.querySelector('meta[name="keywords"]')
    if (keywordsElement) {
      const keywords = keywordsElement.getAttribute('content')
      if (keywords) {
        return keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0)
      }
    }
    return []
  }

  private static extractOgImage(root: any, url: string): string | undefined {
    const ogImageElement = root.querySelector('meta[property="og:image"]')
    if (ogImageElement) {
      const imageUrl = ogImageElement.getAttribute('content')
      if (imageUrl) {
        return this.resolveUrl(imageUrl, url)
      }
    }
    return undefined
  }

  private static extractSiteName(root: any): string | undefined {
    const siteNameElement = root.querySelector('meta[property="og:site_name"]')
    if (siteNameElement) {
      return siteNameElement.getAttribute('content')?.trim()
    }
    return undefined
  }

  private static resolveUrl(relativeUrl: string, baseUrl: string): string {
    try {
      // 如果是完整URL，直接返回
      if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
        return relativeUrl
      }

      // 创建基础URL对象
      const base = new URL(baseUrl)
      
      // 如果是协议相对URL（//example.com/icon.ico）
      if (relativeUrl.startsWith('//')) {
        return base.protocol + relativeUrl
      }

      // 如果是绝对路径（/favicon.ico）
      if (relativeUrl.startsWith('/')) {
        return `${base.protocol}//${base.host}${relativeUrl}`
      }

      // 相对路径
      return new URL(relativeUrl, baseUrl).href
    } catch {
      return relativeUrl
    }
  }

  private static getTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.replace('www.', '')
      
      // 将域名转换为更友好的标题
      const parts = hostname.split('.')
      if (parts.length >= 2) {
        const name = parts[parts.length - 2]
        return name.charAt(0).toUpperCase() + name.slice(1)
      }
      
      return hostname
    } catch {
      return 'Unknown Website'
    }
  }

  // 公开这个方法供外部使用
  static getTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.replace('www.', '')
      
      // 将域名转换为更友好的标题
      const parts = hostname.split('.')
      if (parts.length >= 2) {
        const name = parts[parts.length - 2]
        return name.charAt(0).toUpperCase() + name.slice(1)
      }
      
      return hostname
    } catch {
      return 'Unknown Website'
    }
  }

  private static getDefaultFavicon(url: string): string {
    try {
      const urlObj = new URL(url)
      return `${urlObj.protocol}//${urlObj.host}/favicon.ico`
    } catch {
      return '/placeholder.svg?height=32&width=32'
    }
  }

  // 获取高质量图标的方法
  static async getHighQualityFavicon(url: string): Promise<string> {
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname

      // 尝试多个图标服务
      const iconServices = [
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        `https://favicon.yandex.net/favicon/${domain}`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        `https://${domain}/apple-touch-icon.png`,
        `https://${domain}/favicon.ico`
      ]

      for (const iconUrl of iconServices) {
        try {
          const response = await fetch(iconUrl, { 
            method: 'HEAD',
            timeout: 5000 
          })
          if (response.ok && response.headers.get('content-type')?.includes('image')) {
            return iconUrl
          }
        } catch {
          continue
        }
      }

      return this.getDefaultFavicon(url)
    } catch {
      return '/placeholder.svg?height=32&width=32'
    }
  }

  // 提取页面主要文本内容
  private static extractPageContent(root: any): string {
    try {
      // 移除不需要的元素
      const elementsToRemove = [
        'script', 'style', 'nav', 'header', 'footer', 
        'aside', '.advertisement', '.ads', '.sidebar',
        '.navigation', '.menu', '.cookie', '.popup'
      ]
      
      elementsToRemove.forEach(selector => {
        const elements = root.querySelectorAll(selector)
        elements.forEach((el: any) => el.remove())
      })

      // 优先提取主要内容区域
      const contentSelectors = [
        'main', 'article', '.content', '.main-content', 
        '.post-content', '.entry-content', '.article-content',
        '.page-content', 'section', '.container'
      ]

      let content = ''
      
      // 尝试从主要内容区域提取
      for (const selector of contentSelectors) {
        const element = root.querySelector(selector)
        if (element) {
          content = element.text || element.innerText || ''
          if (content.trim().length > 100) {
            break // 找到有意义的内容就停止
          }
        }
      }

      // 如果主要内容区域没有足够内容，提取body
      if (content.trim().length < 100) {
        const bodyElement = root.querySelector('body')
        if (bodyElement) {
          content = bodyElement.text || bodyElement.innerText || ''
        }
      }

      // 清理文本内容
      const cleanContent = content
        .replace(/\s+/g, ' ') // 标准化空白字符
        .replace(/[\r\n\t]+/g, ' ') // 移除换行和制表符
        .replace(/\s{2,}/g, ' ') // 合并多余空格
        .trim()

      // 限制长度，避免内容过长
      const maxLength = 2000
      if (cleanContent.length > maxLength) {
        return cleanContent.substring(0, maxLength) + '...'
      }

      return cleanContent
    } catch (error) {
      console.error('提取页面内容失败:', error)
      return ''
    }
  }
}

export default WebsiteExtractor