import { kv } from '@vercel/kv';

const EMAIL_LIST_KEY = 'email_list';
const SENT_STOCKS_KEY = 'sent_stocks';
const STOCKS_CACHE_KEY = 'stocks_cache';
const EMAIL_HISTORY_KEY = 'email_history';

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

// 检查是否在Vercel环境
const isVercel = process.env.VERCEL === '1' || (process.env.KV_REST_API_URL && process.env.KV_REST_API_URL !== 'your-kv-rest-api-url');

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
  
  // 如果列表为空，返回默认邮箱
  if (list.length === 0) {
    return ['15010606939@163.com'];
  }
  
  // 确保默认邮箱始终在列表中
  if (!list.includes('15010606939@163.com')) {
    return ['15010606939@163.com', ...list];
  }
  
  return list;
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
    if (email === '15010606939@163.com') {
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
