export interface Website {
  id: string
  url: string
  title: string
  description: string
  category: string
  tags: string[]
  favicon: string
  visitCount: number
  createdAt: string
  lastVisited: string | null
}

export interface Category {
  id: string
  name: string
  icon: string
  count: number
}

export interface Settings {
  theme: "light" | "dark" | "system"
  viewMode: "grid" | "list"
  enableAnimations: boolean
  autoExtractInfo: boolean
  enableSmartCategory: boolean
  trackVisits: boolean
}
