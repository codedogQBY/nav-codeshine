import { NextRequest, NextResponse } from 'next/server'
import { zhipuAI } from '@/lib/zhipu-ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, title, description, keywords } = body

    if (!url || !title) {
      return NextResponse.json(
        { success: false, error: 'URL and title are required' },
        { status: 400 }
      )
    }

    const analysis = await zhipuAI.analyzeWebsite(url, title, description || '', keywords)

    return NextResponse.json({ 
      success: true, 
      data: analysis 
    })
  } catch (error) {
    console.error('Error analyzing website:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze website' },
      { status: 500 }
    )
  }
}