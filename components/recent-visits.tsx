"use client"

import { Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WebsiteCard } from "@/components/website-card"
import type { Website } from "@/types"

interface RecentVisitsProps {
  websites: Website[]
  onUpdate: (id: string, updates: Partial<Website>) => void
  onDelete: (id: string) => void
}

export function RecentVisits({ websites, onUpdate, onDelete }: RecentVisitsProps) {
  // 获取最近访问的网站（按最后访问时间排序）
  const recentWebsites = websites
    .filter((website) => website.lastVisited)
    .sort((a, b) => new Date(b.lastVisited!).getTime() - new Date(a.lastVisited!).getTime())
    .slice(0, 20)

  // 按时间分组
  const groupByTime = (websites: Website[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const groups = {
      today: [] as Website[],
      yesterday: [] as Website[],
      thisWeek: [] as Website[],
      older: [] as Website[],
    }

    websites.forEach((website) => {
      const visitDate = new Date(website.lastVisited!)
      if (visitDate >= today) {
        groups.today.push(website)
      } else if (visitDate >= yesterday) {
        groups.yesterday.push(website)
      } else if (visitDate >= weekAgo) {
        groups.thisWeek.push(website)
      } else {
        groups.older.push(website)
      }
    })

    return groups
  }

  const groupedWebsites = groupByTime(recentWebsites)

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    })
  }

  const renderGroup = (title: string, websites: Website[], showTime = false) => {
    if (websites.length === 0) return null

    return (
      <div key={title} className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {websites.length}
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {websites.map((website) => (
            <div key={website.id} className="relative">
              <WebsiteCard website={website} viewMode="grid" onUpdate={onUpdate} onDelete={onDelete} />
              {showTime && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                  {formatTime(website.lastVisited!)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (recentWebsites.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
          <Clock className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">还没有访问记录</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
          开始访问你收藏的网站，这里将显示你的访问历史
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center">
          <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">最近访问</h2>
          <p className="text-slate-600 dark:text-slate-400">查看你最近访问的网站</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">今天访问</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{groupedWebsites.today.length}</div>
            <p className="text-xs text-slate-500 dark:text-slate-500">个网站</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">本周访问</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {groupedWebsites.today.length + groupedWebsites.yesterday.length + groupedWebsites.thisWeek.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500">个网站</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">总访问次数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {websites.reduce((sum, website) => sum + website.visitCount, 0)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500">次</p>
          </CardContent>
        </Card>
      </div>

      {/* 分组显示 */}
      <div className="space-y-8">
        {renderGroup("今天", groupedWebsites.today, true)}
        {renderGroup("昨天", groupedWebsites.yesterday, true)}
        {renderGroup("本周", groupedWebsites.thisWeek)}
        {renderGroup("更早", groupedWebsites.older)}
      </div>
    </div>
  )
}
