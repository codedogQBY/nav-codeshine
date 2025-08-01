import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const website = await prisma.website.findUnique({
      where: { id },
      include: {
        category: true
      }
    })

    if (!website) {
      return NextResponse.json(
        { success: false, error: 'Website not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: website })
  } catch (error) {
    console.error('Error fetching website:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch website' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { url, title, description, categoryId, tags, favicon, visitCount, lastVisited } = body

    const website = await prisma.website.update({
      where: { id },
      data: {
        ...(url && { url }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(categoryId && { categoryId }),
        ...(tags !== undefined && { tags }),
        ...(favicon !== undefined && { favicon }),
        ...(visitCount !== undefined && { visitCount }),
        ...(lastVisited !== undefined && { lastVisited: lastVisited ? new Date(lastVisited) : null }),
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({ success: true, data: website })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Website not found' },
        { status: 404 }
      )
    }
    
    console.error('Error updating website:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update website' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.website.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Website not found' },
        { status: 404 }
      )
    }
    
    console.error('Error deleting website:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete website' },
      { status: 500 }
    )
  }
}