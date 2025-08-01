"use client"

import { useState } from "react"
import { Loader2, Globe, Sparkles, AlertCircle, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import type { Website, Category } from "@/types"

interface AddWebsiteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (website: Omit<Website, "id">) => void
  categories: Category[]
  onRefreshCategories?: () => void
}

interface AnalysisResult {
  url: string
  title: string
  description: string
  favicon: string
  categoryId: string | null
  categoryName: string
  tags: string[]
  extractedKeywords: string[]
  similarCategories: string[]
  isNewCategory: boolean
}

export function AddWebsiteDialog({ open, onOpenChange, onAdd, categories, onRefreshCategories }: AddWebsiteDialogProps) {
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [favicon, setFavicon] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const { toast } = useToast()

  const resetForm = () => {
    setUrl("")
    setTitle("")
    setDescription("")
    setCategory("")
    setTags([])
    setTagInput("")
    setFavicon("")
    setHasAnalyzed(false)
    setAnalysisResult(null)
    setAnalysisError(null)
  }

  const handleSmartAnalysis = async () => {
    if (!url) return

    setIsAnalyzing(true)
    setAnalysisError(null)
    
    try {
      const response = await fetch('/api/ai/analyze-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()
      
      if (result.success) {
        const data = result.data
        setAnalysisResult(data)
        
        // 自动填充表单
        setTitle(data.title)
        setDescription(data.description)
        setFavicon(data.favicon)
        setTags(data.tags)
        setCategory(data.categoryId || '')
        setHasAnalyzed(true)

        toast({
          title: "智能分析完成 ✨",
          description: `已自动提取网站信息${data.isNewCategory ? '，并创建了新分类' : ''}`,
        })

        // 如果创建了新分类，刷新分类列表
        if (data.isNewCategory && onRefreshCategories) {
          onRefreshCategories()
        }
      } else {
        // 即使分析失败，也可能返回基本信息
        if (result.data) {
          const data = result.data
          setTitle(data.title)
          setDescription(data.description || '')
          setFavicon(data.favicon)
          setTags(data.tags || [])
          setCategory(data.categoryId || '')
          setHasAnalyzed(true)
        }
        
        setAnalysisError(result.error || '分析过程中遇到问题，已填入基本信息')
        
        toast({
          title: "部分分析完成",
          description: "AI分析遇到问题，但已提取基本信息",
          variant: "default",
        })
      }
    } catch (error) {
      console.error('分析网站失败:', error)
      setAnalysisError('网络错误或服务暂时不可用')
      
      toast({
        title: "分析失败",
        description: "请检查网络连接或手动填写信息",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async () => {
    if (!url || !title || !category) {
      toast({
        title: "请填写必填项",
        description: "网址、标题和分类为必填项。",
        variant: "destructive",
      })
      return
    }

    try {
      const website: Omit<Website, "id"> = {
        url,
        title,
        description,
        category,
        tags,
        favicon,
        visitCount: 0,
        createdAt: new Date().toISOString(),
        lastVisited: null,
      }

      await onAdd(website)
      resetForm()
      onOpenChange(false)

      toast({
        title: "添加成功 🎉",
        description: `网站 "${title}" 已添加到收藏`,
      })
    } catch (error) {
      toast({
        title: "添加失败",
        description: "保存网站时出现错误，请重试",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            添加网站
          </DialogTitle>
          <DialogDescription>
            输入网址，AI将自动提取网站信息、生成标签并智能分类
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 网址输入和智能分析 */}
          <div className="space-y-2">
            <Label htmlFor="url">网址 *</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                placeholder="https://example.com 或 example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !hasAnalyzed) {
                    handleSmartAnalysis()
                  }
                }}
              />
              <Button 
                onClick={handleSmartAnalysis} 
                disabled={!url || isAnalyzing} 
                variant="outline"
                className="shrink-0"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? "分析中..." : "AI分析"}
              </Button>
            </div>
          </div>

          {/* 分析状态提示 */}
          {analysisError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{analysisError}</AlertDescription>
            </Alert>
          )}

          {/* 分析结果预览 */}
          {hasAnalyzed && analysisResult && (
            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <div className="flex items-start gap-3">
                {favicon && (
                  <img
                    src={favicon}
                    alt="网站图标"
                    className="w-10 h-10 rounded-lg shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder.svg?height=32&width=32'
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="mb-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium leading-tight">{title}</h4>
                      {analysisResult.isNewCategory && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 shrink-0 text-[10px] px-1.5 py-0.5">
                          新分类
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                    {description}
                  </p>
                  
                  {/* 分析信息 */}
                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <span>分类: <span className="font-medium">{analysisResult.categoryName}</span></span>
                      {analysisResult.isNewCategory && (
                        <span className="text-green-600 text-[10px] font-medium">✨ 自动创建</span>
                      )}
                    </div>
                    {analysisResult.extractedKeywords.length > 0 && (
                      <div>关键词: {analysisResult.extractedKeywords.join(', ')}</div>
                    )}
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              </div>
            </div>
          )}

          {/* 相似分类建议 */}
          {analysisResult?.similarCategories && analysisResult.similarCategories.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                发现相似分类: {analysisResult.similarCategories.join(', ')}。建议选择现有分类以保持一致性。
              </AlertDescription>
            </Alert>
          )}

          {/* 表单字段 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">标题 *</Label>
              <Input 
                id="title" 
                placeholder="网站标题" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>

            {/* 分类 */}
            <div className="space-y-2">
              <Label htmlFor="category">分类 *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        {cat.name}
                        <Badge variant="outline">{cat.count}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              placeholder="网站描述（AI已自动生成，可以修改）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label>标签</Label>
            <div className="flex gap-2">
              <Input
                placeholder="输入标签后按回车"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                添加
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100 hover:text-red-700"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!url || !title || !category}>
            <Globe className="h-4 w-4 mr-2" />
            添加网站
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}