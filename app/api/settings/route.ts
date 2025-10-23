import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const SETTINGS_KEY = 'app_settings';
const isVercel = process.env.VERCEL === '1' || (process.env.KV_REST_API_URL && process.env.KV_REST_API_URL !== 'your-kv-rest-api-url');

// 内存存储（用于本地开发）
let memorySettings: any = {
  notificationFrequency: 30, // 默认30分钟
};

interface AppSettings {
  notificationFrequency: number; // 通知频率（分钟）
}

// GET - 获取设置
export async function GET() {
  try {
    let settings: AppSettings;
    
    if (isVercel) {
      settings = await kv.get<AppSettings>(SETTINGS_KEY) || { notificationFrequency: 30 };
    } else {
      settings = memorySettings;
    }

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json(
      { success: false, error: '获取设置失败' },
      { status: 500 }
    );
  }
}

// POST - 更新设置
export async function POST(request: Request) {
  try {
    const { notificationFrequency } = await request.json();

    // 验证频率（5-1440分钟，即5分钟到24小时）
    if (!notificationFrequency || notificationFrequency < 5 || notificationFrequency > 1440) {
      return NextResponse.json(
        { success: false, error: '通知频率必须在5-1440分钟之间' },
        { status: 400 }
      );
    }

    const settings: AppSettings = {
      notificationFrequency
    };

    if (isVercel) {
      await kv.set(SETTINGS_KEY, settings);
    } else {
      memorySettings = settings;
    }

    return NextResponse.json({
      success: true,
      message: '设置已更新',
      settings
    });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { success: false, error: '更新设置失败' },
      { status: 500 }
    );
  }
}
