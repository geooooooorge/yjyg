import { NextRequest, NextResponse } from 'next/server';
import { getEmailList, addEmail, removeEmail } from '@/lib/storage';

// GET - 获取邮件列表
export async function GET() {
  try {
    const emails = await getEmailList();
    return NextResponse.json({ success: true, emails });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email list' },
      { status: 500 }
    );
  }
}

// POST - 添加邮件
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const added = await addEmail(email);
    
    if (!added) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, message: 'Email added successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add email' },
      { status: 500 }
    );
  }
}

// DELETE - 删除邮件
export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const removed = await removeEmail(email);
    
    if (!removed) {
      return NextResponse.json(
        { success: false, error: 'Email not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Email removed successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to remove email' },
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
