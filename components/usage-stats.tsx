"use client"

import { BarChart3, Calendar, Clock, Globe, TrendingUp, Users, Hash } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Website, Category } from "@/types"

interface UsageStatsProps {
  websites: Website[]
  categories: Category[]
}

export function UsageStats({ websites, categories }: UsageStatsProps) {
  // 基础统计
  const totalWebsites = websites.length
  const totalVisits = websites.reduce((sum, website) => sum + website.visitCount, 0)
  const visitedWebsites = websites.filter((w) => w.visitCount > 0).length
  const averageVisits = totalVisits / Math.max(visitedWebsites, 1)

  // 分类统计
  const categoryStats = categories.map((category) => {
    const categoryWebsites = websites.filter((w) => w.category === category.id)
    const categoryVisits = categoryWebsites.reduce((sum, w) => sum + w.visitCount, 0)
    return {
      ...category,
      websiteCount: categoryWebsites.length,
      totalVisits: categoryVisits,
      averageVisits: categoryVisits / Math.max(categoryWebsites.length, 1),
    }
  })

  // 时间统计
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const todayVisits = websites.filter((w) => w.lastVisited && new Date(w.lastVisited) >= today).length

  const weekVisits = websites.filter((w) => w.lastVisited && new Date(w.lastVisited) >= thisWeek).length

  const monthVisits = websites.filter((w) => w.lastVisited && new Date(w.lastVisited) >= thisMonth).length

  // 标签统计
  const allTags = websites.flatMap((w) => w.tags)
  const tagStats = allTags.reduce(
    (acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topTags = Object.entries(tagStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  // 最活跃的网站
  const mostActiveWebsites = websites
    .filter((w) => w.visitCount > 0)
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/20 dark:to-emerald-800/20 flex items-center justify-center">
          <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">使用统计</h2>
          <p className="text-slate-600 dark:text-slate-400">查看你的网站使用情况和数据分析</p>
        </div>
      </div>

      {/* 总体统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              总网站数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalWebsites}</div>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              活跃: {visitedWebsites} ({Math.round((visitedWebsites / Math.max(totalWebsites, 1)) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              总访问次数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalVisits}</div>
            <p className="text-xs text-slate-500 dark:text-slate-500">平均: {Math.round(averageVisits)} 次/站</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              本月活跃
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{monthVisits}</div>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              本周: {weekVisits} | 今天: {todayVisits}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Users className="h-5 w-5" />
              分类数量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{categories.length}</div>
            <p className="text-xs text-slate-500 dark:text-slate-500">标签: {Object.keys(tagStats).length} 个</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 分类统计 */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <BarChart3 className="h-5 w-5" />
              分类统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats
                .sort((a, b) => b.totalVisits - a.totalVisits)
                .map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{category.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {category.websiteCount}
                        </Badge>
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{category.totalVisits}</div>
                    </div>
                    <Progress
                      value={(category.totalVisits / Math.max(totalVisits, 1)) * 100}
                      className="h-2 bg-slate-100 dark:bg-slate-800"
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* 热门标签 */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Hash className="h-5 w-5" />
              热门标签
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTags.map(([tag, count], index) => (
                <div key={tag} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                      {index + 1}
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {tag}
                    </Badge>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最活跃网站 */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Clock className="h-5 w-5" />
            最活跃网站
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mostActiveWebsites.map((website, index) => (
              <div key={website.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>

                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0">
                  {website.favicon ? (
                    <img
                      src={website.favicon || "/placeholder.svg"}
                      alt={website.title}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <Globe className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 dark:text-white truncate">{website.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{website.description}</p>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{website.visitCount}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">次访问</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
