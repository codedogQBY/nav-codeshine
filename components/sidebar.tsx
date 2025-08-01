"use client"

import { useState } from "react"
import { Hash, Folder, Star, TrendingUp, BarChart3, ChevronDown, ChevronRight, Settings, Plus } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Category } from "@/types"

interface SidebarProps {
  categories: Category[]
  selectedCategory: string
  currentPage: string
  onCategorySelect: (categoryId: string) => void
  onPageSelect: (page: string) => void
  onManageCategories: () => void
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({
  categories,
  selectedCategory,
  currentPage,
  onCategorySelect,
  onPageSelect,
  onManageCategories,
  isOpen,
  onClose,
}: SidebarProps) {
  const [isCategoriesCollapsed, setIsCategoriesCollapsed] = useState(false)
  const [isQuickActionsCollapsed, setIsQuickActionsCollapsed] = useState(false)

  // 获取图标组件
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.MoreHorizontal
    return IconComponent
  }

  const sidebarContent = (
    <div className="space-y-6">
      {/* 分类 */}
      <Collapsible open={!isCategoriesCollapsed} onOpenChange={(open) => setIsCategoriesCollapsed(!open)}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 p-0 h-auto"
            >
              {isCategoriesCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <Folder className="h-4 w-4" />
              分类
            </Button>
          </CollapsibleTrigger>
          <Button
            variant="ghost"
            size="sm"
            onClick={onManageCategories}
            className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>

        <CollapsibleContent className="space-y-1 mt-3">
          <Button
            variant={selectedCategory === "all" && currentPage === "all" ? "secondary" : "ghost"}
            className={`w-full justify-start h-11 ${
              selectedCategory === "all" && currentPage === "all"
                ? "bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
            onClick={() => {
              onCategorySelect("all")
              onClose()
            }}
          >
            <Hash className="mr-3 h-4 w-4" />
            全部网站
          </Button>
          {categories.map((category) => {
            const IconComponent = getIconComponent(category.icon)
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id && currentPage === "all" ? "secondary" : "ghost"}
                className={`w-full justify-between h-11 ${
                  selectedCategory === category.id && currentPage === "all"
                    ? "bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
                onClick={() => {
                  onCategorySelect(category.id)
                  onClose()
                }}
              >
                <div className="flex items-center">
                  <IconComponent className="mr-3 h-4 w-4" />
                  {category.name}
                </div>
                <Badge
                  variant="outline"
                  className="ml-auto bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600"
                >
                  {category.count}
                </Badge>
              </Button>
            )
          })}

          <Button
            variant="ghost"
            className="w-full justify-start h-11 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 mt-2"
            onClick={() => {
              onManageCategories()
              onClose()
            }}
          >
            <Plus className="mr-3 h-4 w-4" />
            添加分类
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* 快捷操作 */}
      <Collapsible open={!isQuickActionsCollapsed} onOpenChange={(open) => setIsQuickActionsCollapsed(!open)}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 p-0 h-auto"
          >
            {isQuickActionsCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <Hash className="h-4 w-4" />
            快捷操作
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-1 mt-3">
          <Button
            variant={currentPage === "recent" ? "secondary" : "ghost"}
            className={`w-full justify-start h-11 ${
              currentPage === "recent"
                ? "bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
            onClick={() => {
              onPageSelect("recent")
              onClose()
            }}
          >
            <Star className="mr-3 h-4 w-4" />
            最近访问
          </Button>
          <Button
            variant={currentPage === "popular" ? "secondary" : "ghost"}
            className={`w-full justify-start h-11 ${
              currentPage === "popular"
                ? "bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
            onClick={() => {
              onPageSelect("popular")
              onClose()
            }}
          >
            <TrendingUp className="mr-3 h-4 w-4" />
            热门网站
          </Button>
          <Button
            variant={currentPage === "stats" ? "secondary" : "ghost"}
            className={`w-full justify-start h-11 ${
              currentPage === "stats"
                ? "bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
            onClick={() => {
              onPageSelect("stats")
              onClose()
            }}
          >
            <BarChart3 className="mr-3 h-4 w-4" />
            使用统计
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )

  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside className="hidden lg:block w-80 border-r border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 overflow-y-auto">
        <div className="p-6 pt-8">{sidebarContent}</div>
      </aside>

      {/* 移动端侧边栏 */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-80 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <SheetHeader>
            <SheetTitle className="text-slate-900 dark:text-white">导航菜单</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{sidebarContent}</div>
        </SheetContent>
      </Sheet>
    </>
  )
}
