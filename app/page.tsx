"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Settings, Grid, List, Menu, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { WebsiteCard } from "@/components/website-card"
import { AddWebsiteDialog } from "@/components/add-website-dialog"
import { Sidebar } from "@/components/sidebar"
import { SettingsPanel } from "@/components/settings-panel"
import { RecentVisits } from "@/components/recent-visits"
import { PopularSites } from "@/components/popular-sites"
import { UsageStats } from "@/components/usage-stats"
import { CategoryManager } from "@/components/category-manager"
import { useWebsites } from "@/hooks/use-websites"
import { useSettings } from "@/hooks/use-settings"
import { AIFloatingButton } from "@/components/ai-floating-button"
import { AIChatBox } from "@/components/ai-chat-box"

export default function HomePage() {
  const {
    websites,
    addWebsite,
    updateWebsite,
    deleteWebsite,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories, // Destructure new reorder function
    refetch, // Add refetch function
  } = useWebsites()
  const { settings, updateSettings } = useSettings()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState("all") // all, recent, popular, stats
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)

  // 过滤网站
  const filteredWebsites = websites.filter((website) => {
    const matchesSearch =
      searchQuery === "" ||
      website.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      website.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      website.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || website.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        document.getElementById("search-input")?.focus()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault()
        setIsAddDialogOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const getPageTitle = () => {
    switch (currentPage) {
      case "recent":
        return "最近访问"
      case "popular":
        return "热门网站"
      case "stats":
        return "使用统计"
      default:
        return selectedCategory === "all" ? "所有网站" : categories.find((c) => c.id === selectedCategory)?.name
    }
  }

  const renderMainContent = () => {
    switch (currentPage) {
      case "recent":
        return <RecentVisits websites={websites} onUpdate={updateWebsite} onDelete={deleteWebsite} />
      case "popular":
        return <PopularSites websites={websites} onUpdate={updateWebsite} onDelete={deleteWebsite} />
      case "stats":
        return <UsageStats websites={websites} categories={categories} />
      default:
        return (
          <>
            {/* 页面标题和统计 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{getPageTitle()}</h2>
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {filteredWebsites.length} 个网站
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={settings.viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSettings({ viewMode: "grid" })}
                    className={
                      settings.viewMode === "grid"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    }
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={settings.viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSettings({ viewMode: "list" })}
                    className={
                      settings.viewMode === "list"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    }
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {searchQuery && (
                <p className="text-slate-600 dark:text-slate-400">
                  搜索 "<span className="font-medium text-slate-900 dark:text-white">{searchQuery}</span>" 的结果
                </p>
              )}
            </div>

            {/* 网站列表 */}
            {filteredWebsites.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                  <Search className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {searchQuery ? "未找到相关网站" : "还没有网站"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? "尝试使用其他关键词搜索，或者检查拼写是否正确"
                    : "开始添加你的第一个网站，让AI帮你智能管理和分类"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加第一个网站
                  </Button>
                )}
              </div>
            ) : (
              <div
                className={
                  settings.viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                    : "space-y-4"
                }
              >
                {filteredWebsites.map((website) => (
                  <WebsiteCard
                    key={website.id}
                    website={website}
                    viewMode={settings.viewMode}
                    onUpdate={updateWebsite}
                    onDelete={deleteWebsite}
                  />
                ))}
              </div>
            )}
          </>
        )
    }
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        settings.theme === "dark" ? "dark bg-slate-950" : "bg-slate-50"
      }`}
    >
      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/60">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-950"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
                  智能导航
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI-Powered Navigation</p>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-lg mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="search-input"
                placeholder="搜索网站、标签或描述... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-slate-100/50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 dark:bg-slate-800/50 dark:border-slate-700 dark:focus:bg-slate-800 dark:focus:border-blue-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              添加网站
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              className="sm:hidden border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]"> {/* 减去header高度 */}
        {/* 侧边栏 */}
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          currentPage={currentPage}
          onCategorySelect={(categoryId) => {
            setSelectedCategory(categoryId)
            setCurrentPage("all")
          }}
          onPageSelect={(page) => {
            setCurrentPage(page)
            setSelectedCategory("all")
          }}
          onManageCategories={() => setIsCategoryManagerOpen(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderMainContent()}</div>
        </main>
      </div>

      {/* 对话框 */}
      <AddWebsiteDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={addWebsite}
        categories={categories}
        onRefreshCategories={() => {
          // 刷新分类列表，以便新创建的分类能在选择器中显示
          refetch()
        }}
      />

      <SettingsPanel
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={settings}
        onSettingsChange={updateSettings}
        websites={websites}
      />

      <CategoryManager
        open={isCategoryManagerOpen}
        onOpenChange={setIsCategoryManagerOpen}
        categories={categories}
        onAddCategory={addCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
        onReorderCategories={reorderCategories} // Pass the new reorder function
        websites={websites}
      />

      {/* AI助手 */}
      <AIFloatingButton onClick={() => setIsAIChatOpen(true)} />

      <AIChatBox
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        websites={websites}
        categories={categories}
        onVisitWebsite={(website) => {
          updateWebsite(website.id, {
            visitCount: website.visitCount + 1,
            lastVisited: new Date().toISOString(),
          })
          window.open(website.url, "_blank", "noopener,noreferrer")
        }}
      />
    </div>
  )
}
