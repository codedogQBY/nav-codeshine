"use client"

import { useState } from "react"
import { ExternalLink, Edit, Trash2, MoreHorizontal, Globe, Eye, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EditWebsiteDialog } from "@/components/edit-website-dialog"
import type { Website } from "@/types"

interface WebsiteCardProps {
  website: Website
  viewMode: "grid" | "list"
  onUpdate: (id: string, updates: Partial<Website>) => void
  onDelete: (id: string) => void
}

export function WebsiteCard({ website, viewMode, onUpdate, onDelete }: WebsiteCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const handleVisit = () => {
    window.open(website.url, "_blank", "noopener,noreferrer")
    // 更新访问次数和最后访问时间
    onUpdate(website.id, {
      visitCount: website.visitCount + 1,
      lastVisited: new Date().toISOString(),
    })
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "从未访问"
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "今天"
    if (diffDays <= 7) return `${diffDays} 天前`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} 周前`
    return `${Math.ceil(diffDays / 30)} 月前`
  }

  if (viewMode === "list") {
    return (
      <>
        <Card className="hover:shadow-lg transition-all duration-200 group border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  {website.favicon ? (
                    <img
                      src={website.favicon || "/placeholder.svg"}
                      alt={website.title}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                        target.nextElementSibling?.classList.remove("hidden")
                      }}
                    />
                  ) : null}
                  <Globe className={`h-6 w-6 text-slate-500 dark:text-slate-400 ${website.favicon ? "hidden" : ""}`} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white truncate text-lg">{website.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate mb-2">{website.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{website.visitCount} 次访问</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(website.lastVisited)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {website.tags.slice(0, 4).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {website.tags.length > 4 && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      +{website.tags.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVisit}
                  className="border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 bg-transparent"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 bg-transparent"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  >
                    <DropdownMenuItem
                      onClick={() => setIsEditOpen(true)}
                      className="hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsDeleteOpen(true)}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        <EditWebsiteDialog website={website} open={isEditOpen} onOpenChange={setIsEditOpen} onUpdate={onUpdate} />

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-900 dark:text-white">确认删除</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                确定要删除网站 "{website.title}" 吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                取消
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(website.id)} className="bg-red-600 hover:bg-red-700">
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <>
      <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
              {website.favicon ? (
                <img
                  src={website.favicon || "/placeholder.svg"}
                  alt={website.title}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    target.nextElementSibling?.classList.remove("hidden")
                  }}
                />
              ) : null}
              <Globe className={`h-6 w-6 text-slate-500 dark:text-slate-400 ${website.favicon ? "hidden" : ""}`} />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              >
                <DropdownMenuItem
                  onClick={() => setIsEditOpen(true)}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div onClick={handleVisit} className="cursor-pointer">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 text-lg leading-tight">
              {website.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
              {website.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {website.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {tag}
              </Badge>
            ))}
            {website.tags.length > 3 && (
              <Badge
                variant="secondary"
                className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                +{website.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{website.visitCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(website.lastVisited)}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVisit}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditWebsiteDialog website={website} open={isEditOpen} onOpenChange={setIsEditOpen} onUpdate={onUpdate} />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">确认删除</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              确定要删除网站 "{website.title}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(website.id)} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
