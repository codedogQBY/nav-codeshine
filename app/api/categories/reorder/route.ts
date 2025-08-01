import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryIds } = body

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { success: false, error: 'categoryIds must be an array' },
        { status: 400 }
      )
    }

    console.log('重新排序分类:', categoryIds)

    // 使用事务批量更新排序
    const updatePromises = categoryIds.map((id: string, index: number) =>
      prisma.category.update({
        where: { id },
        data: { sortOrder: index }
      })
    )

    await prisma.$transaction(updatePromises)

    console.log('分类排序更新成功')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('更新分类排序失败:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reorder categories' },
      { status: 500 }
    )
  }
}