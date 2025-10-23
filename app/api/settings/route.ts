import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const SETTINGS_KEY = 'app_settings';

// 检查 Upstash Redis 是否可用
const hasRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// 内存存储（用于本地开发或 Redis 不可用时）
let memorySettings: any = {
  notificationFrequency: 30, // 默认30分钟
};

// 初始化 Redis 客户端
let redis: Redis | null = null;
if (hasRedis) {
  try {
    redis = Redis.fromEnv();
    console.log('✅ Settings API: Upstash Redis initialized');
  } catch (error) {
    console.warn('⚠️ Settings API: Redis initialization failed, using memory storage:', error);
  }
}

interface AppSettings {
  notificationFrequency: number; // 通知频率（分钟）
}

// GET - 获取设置
export async function GET() {
  try {
    console.log('Getting settings, hasRedis:', hasRedis);
    let settings: AppSettings;
    
    if (hasRedis && redis) {
      try {
        const data = await redis.get<AppSettings>(SETTINGS_KEY);
        settings = data || { notificationFrequency: 30 };
        console.log('Settings from Redis:', settings);
      } catch (redisError) {
        console.warn('Redis get failed, using memory:', redisError);
        settings = memorySettings;
      }
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

    console.log('Saving settings, hasRedis:', hasRedis);
    if (hasRedis && redis) {
      await redis.set(SETTINGS_KEY, settings);
      console.log('Settings saved to Redis');
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
