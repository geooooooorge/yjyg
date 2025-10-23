import { Redis } from '@upstash/redis';

const EMAIL_LIST_KEY = 'email_list';
const SENT_STOCKS_KEY = 'sent_stocks';
const STOCKS_CACHE_KEY = 'stocks_cache';
const EMAIL_HISTORY_KEY = 'email_history';
const DAILY_NEW_STOCKS_KEY = 'daily_new_stocks';

export interface EmailSubscriber {
  email: string;
  addedAt: string;
}

export interface EmailHistory {
  id: string;
  sentAt: string;
  recipients: string[];
  stockCount: number;
  stocks: Array<{
    stockCode: string;
    stockName: string;
    quarter: string;
    forecastType: string;
    changeRange: string;
  }>;
}

// 内存存储（用于本地开发）
let memoryStore: { [key: string]: any } = {};

// 检查 Upstash Redis 是否可用
const hasRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// 初始化 Redis 客户端
let redis: Redis | null = null;
if (hasRedis) {
  try {
    redis = Redis.fromEnv();
    console.log('✅ Upstash Redis initialized');
  } catch (error) {
    console.warn('⚠️ Upstash Redis initialization failed, using memory storage:', error);
  }
}

/**
 * 通用的get方法
 */
export async function getValue<T>(key: string): Promise<T | null> {
  try {
    if (hasRedis && redis) {
      const value = await redis.get<T>(key);
      return value;
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
export async function setValue(key: string, value: any, expirySeconds?: number): Promise<void> {
  try {
    if (hasRedis && redis) {
      if (expirySeconds) {
        await redis.set(key, value, { ex: expirySeconds });
      } else {
        await redis.set(key, value);
      }
    } else {
      memoryStore[key] = value;
    }
  } catch (error) {
    console.error(`Failed to set ${key}:`, error);
  }
}

/**
 * 获取原始邮件列表（不包含默认邮箱）
 */
async function getRawEmailList(): Promise<string[]> {
  const list = await getValue<string[]>(EMAIL_LIST_KEY);
  console.log('getRawEmailList:', list);
  return list || [];
}

/**
 * 获取邮件订阅列表（包含默认邮箱）
 */
export async function getEmailList(): Promise<string[]> {
  const list = await getRawEmailList();
  
  // 使用 Set 去重，确保默认邮箱在最前面
  const uniqueEmails = new Set<string>();
  uniqueEmails.add('15010606939@163.com'); // 默认邮箱1
  uniqueEmails.add('caijing666@hotmail.com'); // 默认邮箱2
  
  // 添加其他邮箱
  list.forEach(email => {
    if (email && email.trim()) {
      uniqueEmails.add(email.trim());
    }
  });
  
  const result = Array.from(uniqueEmails);
  console.log('getEmailList result:', result);
  return result;
}

/**
 * 添加邮件到订阅列表
 */
export async function addEmail(email: string): Promise<boolean> {
  try {
    console.log('addEmail called with:', email);
    const list = await getRawEmailList();
    console.log('Current raw email list:', list);
    if (list.includes(email)) {
      console.log('Email already exists');
      return false; // 已存在
    }
    list.push(email);
    console.log('Updated email list:', list);
    await setValue(EMAIL_LIST_KEY, list);
    console.log('Email added successfully');
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
    console.log('removeEmail called with:', email);
    
    // 不允许删除默认邮箱
    if (email === '15010606939@163.com' || email === 'caijing666@hotmail.com') {
      console.log('Cannot remove default email');
      return false;
    }
    
    const list = await getRawEmailList();
    console.log('Current raw email list:', list);
    const newList = list.filter(e => e !== email);
    if (newList.length === list.length) {
      console.log('Email not found');
      return false; // 不存在
    }
    console.log('Updated email list:', newList);
    await setValue(EMAIL_LIST_KEY, newList);
    console.log('Email removed successfully');
    return true;
  } catch (error) {
    console.error('Failed to remove email:', error);
    return false;
  }
}

/**
 * 清空所有邮箱（保留默认邮箱）
 */
export async function clearAllEmails(): Promise<boolean> {
  try {
    console.log('clearAllEmails called');
    await setValue(EMAIL_LIST_KEY, []);
    console.log('All emails cleared (except default)');
    return true;
  } catch (error) {
    console.error('Failed to clear emails:', error);
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

/**
 * 添加邮件发送历史
 */
export async function addEmailHistory(history: Omit<EmailHistory, 'id'>): Promise<void> {
  try {
    const historyList = await getEmailHistory();
    const newHistory: EmailHistory = {
      ...history,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    // 只保留最近100条记录
    historyList.unshift(newHistory);
    if (historyList.length > 100) {
      historyList.splice(100);
    }
    
    await setValue(EMAIL_HISTORY_KEY, historyList);
  } catch (error) {
    console.error('Failed to add email history:', error);
  }
}

/**
 * 获取邮件发送历史
 */
export async function getEmailHistory(): Promise<EmailHistory[]> {
  const history = await getValue<EmailHistory[]>(EMAIL_HISTORY_KEY);
  return history || [];
}

/**
 * 清空邮件历史
 */
export async function clearEmailHistory(): Promise<void> {
  await setValue(EMAIL_HISTORY_KEY, []);
}

/**
 * 获取今天的日期字符串（YYYY-MM-DD格式）
 */
function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 缓存每日新增股票数据
 */
export async function cacheDailyNewStocks(stocks: any[]): Promise<void> {
  const today = getTodayDateString();
  await setValue(`${DAILY_NEW_STOCKS_KEY}:${today}`, {
    data: stocks,
    timestamp: Date.now(),
    date: today
  });
}

/**
 * 获取今日新增的股票数据
 */
export async function getTodayNewStocks(): Promise<any[] | null> {
  const today = getTodayDateString();
  const cached = await getValue<{ data: any[], timestamp: number, date: string }>(`${DAILY_NEW_STOCKS_KEY}:${today}`);
  if (!cached) return null;
  
  // 检查日期是否匹配
  if (cached.date !== today) {
    return null;
  }
  
  return cached.data;
}

/**
 * 添加新股票到今日新增列表
 */
export async function addTodayNewStock(stock: any): Promise<void> {
  const today = getTodayDateString();
  const key = `${DAILY_NEW_STOCKS_KEY}:${today}`;
  const cached = await getValue<{ data: any[], timestamp: number, date: string }>(key);
  
  if (cached) {
    // 检查是否已存在
    const exists = cached.data.some(s => s.stockCode === stock.stockCode);
    if (!exists) {
      cached.data.push(stock);
      await setValue(key, cached);
    }
  } else {
    // 创建新的今日列表
    await setValue(key, {
      data: [stock],
      timestamp: Date.now(),
      date: today
    });
  }
}

/**
 * 批量添加新股票到今日新增列表
 */
export async function addTodayNewStocks(stocks: any[]): Promise<void> {
  const today = getTodayDateString();
  const key = `${DAILY_NEW_STOCKS_KEY}:${today}`;
  const cached = await getValue<{ data: any[], timestamp: number, date: string }>(key);
  
  if (cached) {
    // 合并新股票，去重
    const existingCodes = new Set(cached.data.map(s => s.stockCode));
    const newStocks = stocks.filter(s => !existingCodes.has(s.stockCode));
    if (newStocks.length > 0) {
      cached.data.push(...newStocks);
      await setValue(key, cached);
    }
  } else {
    // 创建新的今日列表
    await setValue(key, {
      data: stocks,
      timestamp: Date.now(),
      date: today
    });
  }
}
