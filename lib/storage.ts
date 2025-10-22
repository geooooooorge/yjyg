import { kv } from '@vercel/kv';

const EMAIL_LIST_KEY = 'email_list';
const SENT_STOCKS_KEY = 'sent_stocks';

export interface EmailSubscriber {
  email: string;
  addedAt: string;
}

/**
 * 获取邮件订阅列表
 */
export async function getEmailList(): Promise<string[]> {
  try {
    const list = await kv.get<string[]>(EMAIL_LIST_KEY);
    return list || [];
  } catch (error) {
    console.error('Failed to get email list:', error);
    return [];
  }
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
    await kv.set(EMAIL_LIST_KEY, list);
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
    await kv.set(EMAIL_LIST_KEY, newList);
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
    await kv.set(key, new Date().toISOString(), { ex: 60 * 60 * 24 * 90 }); // 90天过期
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
    const sent = await kv.get(key);
    return sent !== null;
  } catch (error) {
    console.error('Failed to check if stock is sent:', error);
    return false;
  }
}
