"use client"

import { TrendingUp, Eye, Star, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { WebsiteCard } from "@/components/website-card"
import type { Website } from "@/types"

interface PopularSitesProps {
  websites: Website[]
  categories: { id: string; name: string; icon: string; count: number }[]
  onUpdate: (id: string, updates: Partial<Website>) => void
  onDelete: (id: string) => void
}

export function PopularSites({ websites, categories, onUpdate, onDelete }: PopularSitesProps) {
  // 按访问次数排序
  const popularWebsites = websites
    .filter((website) => website.visitCount > 0)
    .sort((a, b) => b.visitCount - a.visitCount)

  // 获取前10个最热门的网站
  const top10Websites = popularWebsites.slice(0, 10)

  // 获取访问次数统计
  const totalVisits = websites.reduce((sum, website) => sum + website.visitCount, 0)
  const maxVisits = Math.max(...websites.map((w) => w.visitCount), 1)

  // 按分类统计热门网站
  const categoryStats = websites.reduce(
    (acc, website) => {
      if (website.visitCount > 0) {
        acc[website.category] = (acc[website.category] || 0) + website.visitCount
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const topCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  if (popularWebsites.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
          <TrendingUp className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">还没有访问数据</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
          开始访问你收藏的网站，这里将显示最受欢迎的网站
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-200 dark:from-orange-900/20 dark:to-red-800/20 flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">热门网站</h2>
          <p className="text-slate-600 dark:text-slate-400">查看你最常访问的网站</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">总访问次数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalVisits}</div>
            <p className="text-xs text-slate-500 dark:text-slate-500">次</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">活跃网站</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{popularWebsites.length}</div>
            <p className="text-xs text-slate-500 dark:text-slate-500">个网站</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">最高访问</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{maxVisits}</div>
            <p className="text-xs text-slate-500 dark:text-slate-500">次</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">平均访问</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {Math.round(totalVisits / Math.max(popularWebsites.length, 1))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500">次</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 热门网站排行榜 */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">热门排行榜</h3>
          </div>

          <div className="space-y-4">
            {top10Websites.map((website, index) => (
              <Card
                key={website.id}
                className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            : index === 1
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              : index === 2
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                    </div>

                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center flex-shrink-0">
                      {website.favicon ? (
                        <img
                          src={website.favicon || "/placeholder.svg"}
                          alt={website.title}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-500 dark:text-slate-400" />
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

                  <div className="mt-3">
                    <Progress
                      value={(website.visitCount / maxVisits) * 100}
                      className="h-2 bg-slate-100 dark:bg-slate-800"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 分类统计 */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">热门分类</h3>
          </div>

          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardContent className="p-6">
              <div className="space-y-4">
                {topCategories.map(([categoryId, visits], index) => {
                  const category = categories.find(c => c.id === categoryId)
                  return (
                    <div key={categoryId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                          {category?.name || categoryId}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{visits}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          {Math.round((visits / totalVisits) * 100)}%
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 所有热门网站网格 */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">所有热门网站</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {popularWebsites.map((website) => (
            <WebsiteCard key={website.id} website={website} viewMode="grid" onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      </div>
    </div>
  )
}
