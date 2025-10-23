import { NextResponse } from 'next/server';

const SETTINGS_KEY = 'app_settings';

// 检查 Vercel KV 是否可用
const hasKV = process.env.KV_REST_API_URL && 
              process.env.KV_REST_API_TOKEN && 
              process.env.KV_REST_API_URL !== 'your-kv-rest-api-url';

// 内存存储（用于本地开发或 KV 不可用时）
let memorySettings: any = {
  notificationFrequency: 30, // 默认30分钟
};

// 动态导入 KV（仅在可用时）
let kv: any = null;
if (hasKV) {
  try {
    kv = require('@vercel/kv').kv;
  } catch (error) {
    console.warn('Vercel KV not available, using memory storage');
  }
}

interface AppSettings {
  notificationFrequency: number; // 通知频率（分钟）
}

// GET - 获取设置
export async function GET() {
  try {
    console.log('Getting settings, hasKV:', hasKV);
    let settings: AppSettings;
    
    if (hasKV && kv) {
      settings = await kv.get<AppSettings>(SETTINGS_KEY) || { notificationFrequency: 30 };
      console.log('Settings from KV:', settings);
    } else {
      settings = memorySettings;
      console.log('Settings from memory:', settings);
    }

    console.log('Current settings:', settings);
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error: any) {
    console.error('Failed to get settings:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    return NextResponse.json(
      { 
        success: false, 
        error: '获取设置失败',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

// POST - 更新设置
export async function POST(request: Request) {
  try {
    const { notificationFrequency } = await request.json();
    console.log('Updating settings, received frequency:', notificationFrequency);

    // 验证频率（5-1440分钟，即5分钟到24小时）
    if (!notificationFrequency || notificationFrequency < 5 || notificationFrequency > 1440) {
      console.log('Invalid frequency:', notificationFrequency);
      return NextResponse.json(
        { success: false, error: '通知频率必须在5-1440分钟之间' },
        { status: 400 }
      );
    }

    const settings: AppSettings = {
      notificationFrequency
    };

    console.log('Saving settings, hasKV:', hasKV);
    if (hasKV && kv) {
      await kv.set(SETTINGS_KEY, settings);
      console.log('Settings saved to KV');
    } else {
      memorySettings = settings;
      console.log('Settings saved to memory:', memorySettings);
    }

    return NextResponse.json({
      success: true,
      message: '设置已更新',
      settings
    });
  } catch (error: any) {
    console.error('Failed to update settings:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    return NextResponse.json(
      { 
        success: false, 
        error: '更新设置失败',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
