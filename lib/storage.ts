import { kv } from '@vercel/kv';

const EMAIL_LIST_KEY = 'email_list';
const SENT_STOCKS_KEY = 'sent_stocks';
const STOCKS_CACHE_KEY = 'stocks_cache';

export interface EmailSubscriber {
  email: string;
  addedAt: string;
}

// 内存存储（用于本地开发）
let memoryStore: { [key: string]: any } = {};

// 检查是否在Vercel环境
const isVercel = process.env.VERCEL === '1' || process.env.KV_REST_API_URL;

/**
 * 通用的get方法
 */
async function getValue<T>(key: string): Promise<T | null> {
  try {
    if (isVercel) {
      return await kv.get<T>(key);
    } else {
      return memoryStore[key] || null;
    }
  } catch (error) {
    console.error(`Failed to get ${key}:`, error);
    return null;
  }
}

/**
 * 通用的set方法
 */
async function setValue(key: string, value: any, expirySeconds?: number): Promise<void> {
  try {
    if (isVercel) {
      if (expirySeconds) {
        await kv.set(key, value, { ex: expirySeconds });
      } else {
        await kv.set(key, value);
      }
    } else {
      memoryStore[key] = value;
    }
  } catch (error) {
    console.error(`Failed to set ${key}:`, error);
  }
}

/**
 * 获取邮件订阅列表
 */
export async function getEmailList(): Promise<string[]> {
  const list = await getValue<string[]>(EMAIL_LIST_KEY);
  return list || [];
}

/**
 * 添加邮件到订阅列表
 */
export async function addEmail(email: string): Promise<boolean> {
  try {
    const list = await getEmailList();
    if (list.includes(email)) {
      return false; // 已存在
    }
    list.push(email);
    await setValue(EMAIL_LIST_KEY, list);
    return true;
  } catch (error) {
    console.error('Failed to add email:', error);
    return false;
  }
}

/**
 * 从订阅列表删除邮件
 */
export async function removeEmail(email: string): Promise<boolean> {
  try {
    const list = await getEmailList();
    const newList = list.filter(e => e !== email);
    if (newList.length === list.length) {
      return false; // 不存在
    }
    await setValue(EMAIL_LIST_KEY, newList);
    return true;
  } catch (error) {
    console.error('Failed to remove email:', error);
    return false;
  }
}

/**
 * 记录已发送的股票（避免重复发送）
 */
export async function markStockAsSent(stockCode: string, quarter: string): Promise<void> {
  try {
    const key = `${SENT_STOCKS_KEY}:${stockCode}:${quarter}`;
    await setValue(key, new Date().toISOString(), 60 * 60 * 24 * 90); // 90天过期
  } catch (error) {
    console.error('Failed to mark stock as sent:', error);
  }
}

/**
 * 检查股票是否已发送
 */
export async function isStockSent(stockCode: string, quarter: string): Promise<boolean> {
  try {
    const key = `${SENT_STOCKS_KEY}:${stockCode}:${quarter}`;
    const sent = await getValue(key);
    return sent !== null;
  } catch (error) {
    console.error('Failed to check if stock is sent:', error);
    return false;
  }
}

/**
 * 缓存股票数据（5分钟缓存）
 */
export async function cacheStocks(stocks: any[]): Promise<void> {
  await setValue(STOCKS_CACHE_KEY, {
    data: stocks,
    timestamp: Date.now()
  });
}

/**
 * 获取缓存的股票数据
 */
export async function getCachedStocks(): Promise<any[] | null> {
  const cached = await getValue<{ data: any[], timestamp: number }>(STOCKS_CACHE_KEY);
  if (!cached) return null;
  
  // 5分钟缓存
  const CACHE_DURATION = 5 * 60 * 1000;
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    return null;
  }
  
  return cached.data;
}
