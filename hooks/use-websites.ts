"use client"

import { useState, useEffect, useCallback } from "react"
import type { Website, Category } from "@/types"

export function useWebsites() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取所有网站
  const fetchWebsites = useCallback(async () => {
    try {
      const response = await fetch('/api/websites')
      const result = await response.json()
      
      if (result.success) {
        // 转换数据格式以匹配前端期望的格式
        const transformedWebsites = result.data.map((website: any) => ({
          id: website.id,
          url: website.url,
          title: website.title,
          description: website.description,
          category: website.categoryId,
          tags: Array.isArray(website.tags) ? website.tags : [],
          favicon: website.favicon,
          visitCount: website.visitCount,
          createdAt: website.createdAt,
          lastVisited: website.lastVisited,
        }))
        setWebsites(transformedWebsites)
      } else {
        setError(result.error || 'Failed to fetch websites')
      }
    } catch (err) {
      setError('Network error while fetching websites')
      console.error('Error fetching websites:', err)
    }
  }, [])

  // 获取所有分类
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      
      if (result.success) {
        setCategories(result.data)
      } else {
        setError(result.error || 'Failed to fetch categories')
      }
    } catch (err) {
      setError('Network error while fetching categories')
      console.error('Error fetching categories:', err)
    }
  }, [])

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      setLoading(true)
      await Promise.all([fetchWebsites(), fetchCategories()])
      setLoading(false)
    }
    
    initData()
  }, [fetchWebsites, fetchCategories])

  const addWebsite = async (website: Omit<Website, "id">) => {
    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: website.url,
          title: website.title,
          description: website.description,
          categoryId: website.category,
          tags: website.tags,
          favicon: website.favicon,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        const transformedWebsite = {
          id: result.data.id,
          url: result.data.url,
          title: result.data.title,
          description: result.data.description,
          category: result.data.categoryId,
          tags: Array.isArray(result.data.tags) ? result.data.tags : [],
          favicon: result.data.favicon,
          visitCount: result.data.visitCount,
          createdAt: result.data.createdAt,
          lastVisited: result.data.lastVisited,
        }
        setWebsites(prev => [...prev, transformedWebsite])
        // 重新获取分类以更新计数
        fetchCategories()
      } else {
        throw new Error(result.error || 'Failed to add website')
      }
    } catch (err) {
      console.error('Error adding website:', err)
      throw err
    }
  }

  const updateWebsite = async (id: string, updates: Partial<Website>) => {
    try {
      const response = await fetch(`/api/websites/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: updates.url,
          title: updates.title,
          description: updates.description,
          categoryId: updates.category,
          tags: updates.tags,
          favicon: updates.favicon,
          visitCount: updates.visitCount,
          lastVisited: updates.lastVisited,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        const transformedWebsite = {
          id: result.data.id,
          url: result.data.url,
          title: result.data.title,
          description: result.data.description,
          category: result.data.categoryId,
          tags: Array.isArray(result.data.tags) ? result.data.tags : [],
          favicon: result.data.favicon,
          visitCount: result.data.visitCount,
          createdAt: result.data.createdAt,
          lastVisited: result.data.lastVisited,
        }
        setWebsites(prev => prev.map(website => 
          website.id === id ? transformedWebsite : website
        ))
        // 如果更新了分类，重新获取分类计数
        if (updates.category) {
          fetchCategories()
        }
      } else {
        throw new Error(result.error || 'Failed to update website')
      }
    } catch (err) {
      console.error('Error updating website:', err)
      throw err
    }
  }

  const deleteWebsite = async (id: string) => {
    try {
      const response = await fetch(`/api/websites/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (result.success) {
        setWebsites(prev => prev.filter(website => website.id !== id))
        // 重新获取分类以更新计数
        fetchCategories()
      } else {
        throw new Error(result.error || 'Failed to delete website')
      }
    } catch (err) {
      console.error('Error deleting website:', err)
      throw err
    }
  }

  const addCategory = async (category: Omit<Category, "id" | "count">) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      })

      const result = await response.json()
      
      if (result.success) {
        setCategories(prev => [...prev, result.data])
      } else {
        throw new Error(result.error || 'Failed to add category')
      }
    } catch (err) {
      console.error('Error adding category:', err)
      throw err
    }
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const result = await response.json()
      
      if (result.success) {
        setCategories(prev => prev.map(category => 
          category.id === id ? result.data : category
        ))
      } else {
        throw new Error(result.error || 'Failed to update category')
      }
    } catch (err) {
      console.error('Error updating category:', err)
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (result.success) {
        setCategories(prev => prev.filter(category => category.id !== id))
      } else {
        throw new Error(result.error || 'Failed to delete category')
      }
    } catch (err) {
      console.error('Error deleting category:', err)
      throw err
    }
  }

  // 分类重排序 - 现在会保存到数据库
  const reorderCategories = async (activeId: string, overId: string) => {
    // 先更新前端状态以提供即时反馈
    let newCategories: Category[]
    setCategories((prevCategories) => {
      const oldIndex = prevCategories.findIndex((cat) => cat.id === activeId)
      const newIndex = prevCategories.findIndex((cat) => cat.id === overId)
      
      if (oldIndex === -1 || newIndex === -1) return prevCategories
      
      newCategories = [...prevCategories]
      const [removed] = newCategories.splice(oldIndex, 1)
      newCategories.splice(newIndex, 0, removed)
      
      return newCategories
    })

    // 保存到数据库
    try {
      const categoryIds = newCategories.map(cat => cat.id)
      const response = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryIds }),
      })

      const result = await response.json()
      if (!result.success) {
        console.error('保存分类排序失败:', result.error)
        // 如果保存失败，重新获取数据以恢复正确状态
        fetchCategories()
      }
    } catch (error) {
      console.error('保存分类排序失败:', error)
      // 如果保存失败，重新获取数据以恢复正确状态
      fetchCategories()
    }
  }

  return {
    websites,
    categories,
    loading,
    error,
    addWebsite,
    updateWebsite,
    deleteWebsite,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    refetch: () => {
      fetchWebsites()
      fetchCategories()
    }
  }
}
