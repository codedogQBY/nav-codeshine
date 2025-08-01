"use client"

import { useState, useEffect } from "react"
import { Edit } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Website } from "@/types"

interface EditWebsiteDialogProps {
  website: Website
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (id: string, updates: Partial<Website>) => void
}

export function EditWebsiteDialog({ website, open, onOpenChange, onUpdate }: EditWebsiteDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setTitle(website.title)
      setDescription(website.description)
      setTags(website.tags)
    }
  }, [open, website])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "标题不能为空",
        variant: "destructive",
      })
      return
    }

    onUpdate(website.id, {
      title: title.trim(),
      description: description.trim(),
      tags,
    })

    onOpenChange(false)

    toast({
      title: "更新成功",
      description: `网站 "${title}" 已更新。`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            编辑网站
          </DialogTitle>
          <DialogDescription>修改网站信息</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">标题 *</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">描述</Label>
            <Textarea
              id="edit-description"
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
                placeholder="添加标签"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button onClick={handleAddTag} variant="outline" size="sm">
                添加
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
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
          <Button onClick={handleSubmit}>保存更改</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
