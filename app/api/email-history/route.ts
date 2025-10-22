import { NextResponse } from 'next/server';
import { getEmailHistory, clearEmailHistory } from '@/lib/storage';

// GET - 获取邮件发送历史
export async function GET() {
  try {
    const history = await getEmailHistory();
    return NextResponse.json({ success: true, history });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email history' },
      { status: 500 }
    );
  }
}

// DELETE - 清空历史记录
export async function DELETE() {
  try {
    await clearEmailHistory();
    return NextResponse.json({ success: true, message: 'History cleared' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to clear history' },
      { status: 500 }
    );
  }
}
