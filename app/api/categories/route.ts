import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { websites: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' }, // 首先按排序字段排序
        { createdAt: 'asc' }  // 然后按创建时间排序
      ]
    })
    
    const categoriesWithCount = categories.map(category => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      count: category._count.websites
    }))

    return NextResponse.json({ success: true, data: categoriesWithCount })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, icon } = body

    if (!name || !icon) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 获取当前最大的sortOrder值，新分类排在最后
    const maxSortOrder = await prisma.category.aggregate({
      _max: {
        sortOrder: true
      }
    })
    const nextSortOrder = (maxSortOrder._max.sortOrder || 0) + 1

    const category = await prisma.category.create({
      data: {
        name,
        icon,
        sortOrder: nextSortOrder
      },
      include: {
        _count: {
          select: { websites: true }
        }
      }
    })

    const categoryWithCount = {
      id: category.id,
      name: category.name,
      icon: category.icon,
      count: category._count.websites
    }

    return NextResponse.json({ success: true, data: categoryWithCount })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 409 }
      )
    }
    
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}