"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Plus, Edit, Trash2, Folder, Save, X, GripVertical, Search, Check, MoreHorizontal } from "lucide-react"
import * as LucideIcons from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconPicker } from "@/components/icon-picker"
import { useToast } from "@/hooks/use-toast"
import type { Category, Website } from "@/types"

// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"

interface CategoryManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  onAddCategory: (category: Omit<Category, "id" | "count">) => void
  onUpdateCategory: (id: string, updates: Partial<Category>) => void
  onDeleteCategory: (id: string) => void
  onReorderCategories: (activeId: string, overId: string) => void
  websites: Website[]
}

// Enhanced SortableItem component with better visual feedback
interface SortableCategoryItemProps {
  category: Category
  editingId: string | null
  editingName: string
  editingIcon: string
  setEditingName: (name: string) => void
  setEditingIcon: (icon: string) => void
  handleStartEdit: (category: Category) => void
  handleSaveEdit: () => void
  handleCancelEdit: () => void
  setDeleteConfirmId: (id: string | null) => void
  getIconComponent: (iconName: string) => React.ComponentType<any>
  isSelected: boolean
  onSelectionChange: (id: string, selected: boolean) => void
  isDragOverlay?: boolean
}

function SortableCategoryItem({
  category,
  editingId,
  editingName,
  editingIcon,
  setEditingName,
  setEditingIcon,
  handleStartEdit,
  handleSaveEdit,
  handleCancelEdit,
  setDeleteConfirmId,
  getIconComponent,
  isSelected,
  onSelectionChange,
  isDragOverlay = false,
}: SortableCategoryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id: category.id,
    disabled: editingId === category.id, // Disable dragging when editing
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition, // Disable transition during drag for smoother experience
    zIndex: isDragging ? 1000 : 0,
  }

  const IconComponent = getIconComponent(category.icon)
  const EditingIconComponent = getIconComponent(editingIcon)

  // Enhanced visual feedback for drag states
  const itemClasses = cn(
    "flex items-center gap-3 p-4 border rounded-xl transition-all duration-200",
    "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700",
    {
      // Dragging state
      "shadow-2xl ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-105": isDragging && !isDragOverlay,
      // Drag overlay state
      "shadow-2xl ring-2 ring-blue-500 bg-white dark:bg-slate-900 rotate-3": isDragOverlay,
      // Drag over state
      "border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/10": isOver && !isDragging,
      // Selected state
      "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20": isSelected && !isDragging,
      // Hover state
      "hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600": !isDragging && !isSelected,
      // Editing state
      "ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20": editingId === category.id,
    },
  )

  return (
    <div ref={setNodeRef} style={style} className={itemClasses}>
      {editingId === category.id ? (
        <>
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <EditingIconComponent className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex-1 flex gap-3">
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-900"
              placeholder="分类名称"
            />
            <IconPicker
              value={editingIcon}
              onChange={setEditingIcon}
              trigger={
                <Button variant="outline" className="w-12 h-10 p-0 bg-transparent">
                  <EditingIconComponent className="h-4 w-4" />
                </Button>
              }
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelectionChange(category.id, !!checked)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-10 w-10 p-0 cursor-grab active:cursor-grabbing touch-manipulation",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                isDragging && "cursor-grabbing",
              )}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-slate-400" />
              <span className="sr-only">拖动排序</span>
            </Button>
          </div>

          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-sm">
            <IconComponent className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 dark:text-white text-lg">{category.name}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>{category.count} 个网站</span>
              {category.count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  活跃
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600"
            >
              {category.count}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 bg-transparent"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStartEdit(category)}>
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectionChange(category.id, !isSelected)}>
                  <Check className="h-4 w-4 mr-2" />
                  {isSelected ? "取消选择" : "选择"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteConfirmId(category.id)}
                  className="text-red-600 focus:text-red-600"
                  disabled={category.count > 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </div>
  )
}

export function CategoryManager({
  open,
  onOpenChange,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  websites,
}: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [editingIcon, setEditingIcon] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryIcon, setNewCategoryIcon] = useState("MoreHorizontal")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const { toast } = useToast()

  // Enhanced sensors for better touch and mouse support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay for touch to distinguish from scroll
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories

    const query = searchQuery.toLowerCase()
    return categories.filter(
      (category) => category.name.toLowerCase().includes(query) || category.id.toLowerCase().includes(query),
    )
  }, [categories, searchQuery])

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "请输入分类名称",
        variant: "destructive",
      })
      return
    }

    onAddCategory({
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
    })

    setNewCategoryName("")
    setNewCategoryIcon("MoreHorizontal")

    toast({
      title: "分类添加成功",
      description: `分类 "${newCategoryName}" 已添加。`,
    })
  }

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id)
    setEditingName(category.name)
    setEditingIcon(category.icon)
  }

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      toast({
        title: "请输入分类名称",
        variant: "destructive",
      })
      return
    }

    onUpdateCategory(editingId!, {
      name: editingName.trim(),
      icon: editingIcon,
    })

    setEditingId(null)
    setEditingName("")
    setEditingIcon("")

    toast({
      title: "分类更新成功",
      description: `分类已更新为 "${editingName}"。`,
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName("")
    setEditingIcon("")
  }

  const handleDeleteCategory = (categoryId: string) => {
    const websitesInCategory = websites.filter((w) => w.category === categoryId)
    if (websitesInCategory.length > 0) {
      toast({
        title: "无法删除分类",
        description: `该分类下还有 ${websitesInCategory.length} 个网站，请先移动或删除这些网站。`,
        variant: "destructive",
      })
      return
    }

    onDeleteCategory(categoryId)
    setDeleteConfirmId(null)
    setSelectedCategories((prev) => {
      const newSet = new Set(prev)
      newSet.delete(categoryId)
      return newSet
    })

    toast({
      title: "分类删除成功",
      description: "分类已删除。",
    })
  }

  // Batch operations
  const handleSelectAll = () => {
    if (selectedCategories.size === filteredCategories.length) {
      setSelectedCategories(new Set())
    } else {
      setSelectedCategories(new Set(filteredCategories.map((c) => c.id)))
    }
  }

  const handleBatchDelete = () => {
    const categoriesToDelete = Array.from(selectedCategories)
    const categoriesWithWebsites = categoriesToDelete.filter((id) => {
      const category = categories.find((c) => c.id === id)
      return category && category.count > 0
    })

    if (categoriesWithWebsites.length > 0) {
      toast({
        title: "无法批量删除",
        description: `选中的分类中有 ${categoriesWithWebsites.length} 个包含网站，请先移动或删除这些网站。`,
        variant: "destructive",
      })
      return
    }

    categoriesToDelete.forEach((id) => onDeleteCategory(id))
    setSelectedCategories(new Set())

    toast({
      title: "批量删除成功",
      description: `已删除 ${categoriesToDelete.length} 个分类。`,
    })
  }

  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }

  // 获取图标组件
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.MoreHorizontal
    return IconComponent
  }

  // Enhanced drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      onReorderCategories(active.id as string, over?.id as string)

      toast({
        title: "排序已更新",
        description: "分类顺序已保存。",
      })
    }

    setActiveId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const activeCategory = activeId ? categories.find((c) => c.id === activeId) : null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Folder className="h-5 w-5" />
              分类管理
              {selectedCategories.size > 0 && (
                <Badge variant="secondary" className="ml-2">
                  已选择 {selectedCategories.size} 个
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              添加、编辑、排序或删除网站分类。支持拖拽排序、批量操作和搜索功能。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 搜索和批量操作栏 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索分类..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="whitespace-nowrap bg-transparent"
                >
                  {selectedCategories.size === filteredCategories.length ? "取消全选" : "全选"}
                </Button>

                {selectedCategories.size > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBatchDelete}
                    className="text-red-600 hover:text-red-700 whitespace-nowrap bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    批量删除
                  </Button>
                )}
              </div>
            </div>

            {/* 添加新分类 */}
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">添加新分类</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="分类名称"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="bg-white dark:bg-slate-900"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddCategory()
                      }
                    }}
                  />
                </div>
                <IconPicker
                  value={newCategoryIcon}
                  onChange={setNewCategoryIcon}
                  trigger={
                    <Button variant="outline" className="w-12 h-10 p-0 bg-transparent">
                      {(() => {
                        const IconComponent = getIconComponent(newCategoryIcon)
                        return <IconComponent className="h-4 w-4" />
                      })()}
                    </Button>
                  }
                />
                <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  添加分类
                </Button>
              </div>
            </div>

            {/* 分类列表 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                  现有分类 ({filteredCategories.length})
                </h3>
                {searchQuery && (
                  <Badge variant="outline" className="text-xs">
                    搜索结果
                  </Badge>
                )}
              </div>

              {filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    {searchQuery ? "未找到匹配的分类" : "还没有分类"}
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <SortableContext items={filteredCategories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredCategories.map((category) => (
                        <SortableCategoryItem
                          key={category.id}
                          category={category}
                          editingId={editingId}
                          editingName={editingName}
                          editingIcon={editingIcon}
                          setEditingName={setEditingName}
                          setEditingIcon={setEditingIcon}
                          handleStartEdit={handleStartEdit}
                          handleSaveEdit={handleSaveEdit}
                          handleCancelEdit={handleCancelEdit}
                          setDeleteConfirmId={setDeleteConfirmId}
                          getIconComponent={getIconComponent}
                          isSelected={selectedCategories.has(category.id)}
                          onSelectionChange={handleSelectionChange}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  <DragOverlay>
                    {activeCategory && (
                      <div className="flex items-center gap-3 p-4 border rounded-xl shadow-2xl ring-2 ring-blue-500 bg-white dark:bg-slate-900 rotate-3 scale-105">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-sm">
                          {(() => {
                            const IconComponent = getIconComponent(activeCategory.icon)
                            return <IconComponent className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white text-lg">
                            {activeCategory.name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {activeCategory.count} 个网站
                          </div>
                        </div>
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex-1 text-xs text-slate-500 dark:text-slate-400">
              💡 提示：拖动 <GripVertical className="inline-block h-3 w-3" /> 图标可以排序，长按可在移动设备上拖动
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">确认删除分类</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              确定要删除分类 "{categories.find((c) => c.id === deleteConfirmId)?.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteCategory(deleteConfirmId!)}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
