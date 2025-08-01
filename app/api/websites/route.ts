import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const websites = await prisma.website.findMany({
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({ success: true, data: websites })
  } catch (error) {
    console.error('Error fetching websites:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch websites' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, title, description, categoryId, tags, favicon } = body

    if (!url || !title || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const website = await prisma.website.create({
      data: {
        url,
        title,
        description: description || '',
        categoryId,
        tags: tags || [],
        favicon: favicon || '',
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({ success: true, data: website })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Website with this URL already exists' },
        { status: 409 }
      )
    }
    
    console.error('Error creating website:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create website' },
      { status: 500 }
    )
  }
}