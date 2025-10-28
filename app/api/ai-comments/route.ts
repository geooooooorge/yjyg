import { NextResponse } from 'next/server';
import { getAllAiComments } from '@/lib/storage';

export const dynamic = 'force-dynamic';

// 获取所有 AI 点评
export async function GET() {
  try {
    const comments = await getAllAiComments();
    
    return NextResponse.json({ 
      success: true, 
      comments 
    });
  } catch (error) {
    console.error('Error getting AI comments:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get AI comments',
      comments: {}
    }, { status: 500 });
  }
}
