"use client"

import { Download, Upload, Moon, Sun, Monitor, Palette } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import type { Settings, Website } from "@/types"

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: Settings
  onSettingsChange: (settings: Partial<Settings>) => void
  websites: Website[]
}

export function SettingsPanel({ open, onOpenChange, settings, onSettingsChange, websites }: SettingsPanelProps) {
  const { toast } = useToast()

  const handleExport = () => {
    const data = {
      websites,
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `智能导航-备份-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "导出成功",
      description: "数据已导出到本地文件。",
    })
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            // 这里应该调用导入逻辑
            toast({
              title: "导入成功",
              description: "数据已成功导入。",
            })
          } catch (error) {
            toast({
              title: "导入失败",
              description: "文件格式不正确。",
              variant: "destructive",
            })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            设置
          </SheetTitle>
          <SheetDescription>个性化你的导航站体验</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* 外观设置 */}
          <div>
            <h3 className="text-lg font-medium mb-4">外观设置</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">主题模式</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value: "light" | "dark" | "system") => onSettingsChange({ theme: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        浅色
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        深色
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        跟随系统
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="view-mode">显示模式</Label>
                <Select
                  value={settings.viewMode}
                  onValueChange={(value: "grid" | "list") => onSettingsChange({ viewMode: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">网格</SelectItem>
                    <SelectItem value="list">列表</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="animations">动画效果</Label>
                  <p className="text-sm text-gray-500">启用界面动画效果</p>
                </div>
                <Switch
                  id="animations"
                  checked={settings.enableAnimations}
                  onCheckedChange={(checked) => onSettingsChange({ enableAnimations: checked })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 功能设置 */}
          <div>
            <h3 className="text-lg font-medium mb-4">功能设置</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-extract">自动信息提取</Label>
                  <p className="text-sm text-gray-500">添加网站时自动提取信息</p>
                </div>
                <Switch
                  id="auto-extract"
                  checked={settings.autoExtractInfo}
                  onCheckedChange={(checked) => onSettingsChange({ autoExtractInfo: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smart-category">智能分类</Label>
                  <p className="text-sm text-gray-500">AI自动分类新添加的网站</p>
                </div>
                <Switch
                  id="smart-category"
                  checked={settings.enableSmartCategory}
                  onCheckedChange={(checked) => onSettingsChange({ enableSmartCategory: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="visit-tracking">访问统计</Label>
                  <p className="text-sm text-gray-500">记录网站访问次数和时间</p>
                </div>
                <Switch
                  id="visit-tracking"
                  checked={settings.trackVisits}
                  onCheckedChange={(checked) => onSettingsChange({ trackVisits: checked })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 数据管理 */}
          <div>
            <h3 className="text-lg font-medium mb-4">数据管理</h3>

            <div className="space-y-3">
              <Button onClick={handleExport} variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                导出数据
              </Button>

              <Button onClick={handleImport} variant="outline" className="w-full justify-start bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                导入数据
              </Button>
            </div>

            <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                当前已收藏 <span className="font-medium">{websites.length}</span> 个网站
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
