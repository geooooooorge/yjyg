import { NextRequest, NextResponse } from 'next/server';
import { getValue, setValue } from '@/lib/storage';

const ONLINE_USERS_KEY = 'online_users';
const HEARTBEAT_TIMEOUT = 30000; // 30秒超时

interface OnlineUser {
  id: string;
  lastSeen: number;
}

// GET - 获取在线人数
export async function GET() {
  try {
    const users = await getValue<OnlineUser[]>(ONLINE_USERS_KEY) || [];
    const now = Date.now();
    
    // 过滤掉超时的用户
    const activeUsers = users.filter(user => now - user.lastSeen < HEARTBEAT_TIMEOUT);
    
    // 更新活跃用户列表
    if (activeUsers.length !== users.length) {
      await setValue(ONLINE_USERS_KEY, activeUsers);
    }
    
    return NextResponse.json({ 
      success: true, 
      count: activeUsers.length 
    });
  } catch (error) {
    console.error('Error getting online users:', error);
    return NextResponse.json({ success: true, count: 0 });
  }
}

// POST - 心跳更新
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }
    
    const users = await getValue<OnlineUser[]>(ONLINE_USERS_KEY) || [];
    const now = Date.now();
    
    // 过滤掉超时的用户
    const activeUsers = users.filter(user => now - user.lastSeen < HEARTBEAT_TIMEOUT);
    
    // 更新或添加当前用户
    const existingIndex = activeUsers.findIndex(user => user.id === userId);
    if (existingIndex >= 0) {
      activeUsers[existingIndex].lastSeen = now;
    } else {
      activeUsers.push({ id: userId, lastSeen: now });
    }
    
    // 保存更新后的列表
    await setValue(ONLINE_USERS_KEY, activeUsers, 60); // 60秒过期
    
    return NextResponse.json({ 
      success: true, 
      count: activeUsers.length 
    });
  } catch (error) {
    console.error('Error updating online users:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}
