'use client';

import { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, RefreshCw, TrendingUp, Bell, Users } from 'lucide-react';

interface Stock {
  stockCode: string;
  stockName: string;
  reports: Array<{
    quarter: string;
    forecastType: string;
    changeMin: number;
    changeMax: number;
    reportDate: string;
    priceChange?: number;
    currentPrice?: number;
  }>;
}

export default function Home() {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [aiComments, setAiComments] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchEmails();
    fetchStocks();
    updateOnlineStatus();
    
    // 定期发送心跳
    const heartbeatInterval = setInterval(updateOnlineStatus, 15000); // 每15秒
    
    // 定期更新在线人数
    const countInterval = setInterval(fetchOnlineCount, 10000); // 每10秒
    
    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(countInterval);
    };
  }, [userId]);

  const updateOnlineStatus = async () => {
    try {
      const res = await fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setOnlineCount(data.count);
      }
    } catch (error) {
      console.error('Failed to update online status:', error);
    }
  };

  const fetchOnlineCount = async () => {
    try {
      const res = await fetch('/api/online');
      const data = await res.json();
      if (data.success) {
        setOnlineCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch online count:', error);
    }
  };

  const fetchEmails = async () => {
    try {
      const res = await fetch('/api/emails');
      const data = await res.json();
      if (data.success) {
        setEmails(data.emails);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    }
  };

  const fetchStocks = async () => {
    setLoading(true);
    try {
      // 先尝试获取今日新增
      const todayRes = await fetch('/api/earnings?type=today');
      const todayData = await todayRes.json();
      
      if (todayData.success && todayData.stocks && todayData.stocks.length > 0) {
        // 如果有今日新增，显示今日新增
        setStocks(todayData.stocks);
      } else {
        // 如果今日没有新增，显示近7天数据（不显示全部历史）
        const recentRes = await fetch('/api/earnings?type=recent');
        const recentData = await recentRes.json();
        if (recentData.success) {
          setStocks(recentData.stocks);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEmail = async () => {
    if (!newEmail) return;

    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage('邮箱添加成功！');
        setNewEmail('');
        fetchEmails();
      } else {
        setMessage(data.error || '添加失败');
      }
    } catch (error) {
      setMessage('添加失败，请重试');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const removeEmail = async (email: string) => {
    try {
      await fetch('/api/emails', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setEmails(emails.filter((e) => e !== email));
      setMessage('邮箱已删除');
    } catch (error) {
      setMessage('删除失败，请重试');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const getAiComment = async (stock: Stock) => {
    const report = stock.reports[0];
    const key = stock.stockCode;
    
    // 如果已经有评论，不重复获取
    if (aiComments[key]) return;
    
    setLoadingComments(prev => ({ ...prev, [key]: true }));
    
    try {
      const res = await fetch('/api/ai-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockName: stock.stockName,
          stockCode: stock.stockCode,
          forecastType: report.forecastType,
          changeMin: report.changeMin,
          changeMax: report.changeMax,
          quarter: report.quarter,
        }),
      });
      
      const data = await res.json();
      if (data.success && data.comment) {
        setAiComments(prev => ({ ...prev, [key]: data.comment }));
      }
    } catch (error) {
      console.error('Failed to get AI comment:', error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        {/* 在线人数显示 */}
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
            <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {onlineCount}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">在线</span>
          </div>
        </div>

        <div className="text-center mb-6 sm:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-600" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              业绩预增跟踪器
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4">
            自动跟踪最新业绩预增股票，并发送邮件通知
          </p>
        </div>

        {message && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-lg text-center text-sm sm:text-base">
            {message}
          </div>
        )}

        {/* 简化的邮箱订阅模块 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
              邮件订阅
            </h2>
            {emails.length > 0 && (
              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs">
                {emails.length}
              </span>
            )}
          </div>

          <div className="flex gap-2 mb-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addEmail()}
              placeholder="输入邮箱"
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={addEmail}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {emails.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {emails.map((email) => (
                <div
                  key={email}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs group"
                >
                  <span className="text-gray-700 dark:text-gray-200">{email}</span>
                  <button
                    onClick={() => removeEmail(email)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
                  今日新增
                </h2>
              </div>
              <button
                onClick={fetchStocks}
                disabled={loading}
                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors active:bg-indigo-100"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">
                  加载中...
                </p>
              ) : stocks.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">
                  暂无新增业绩预增公告
                </p>
              ) : (
                (() => {
                  // 按季度分组
                  const groupedByQuarter = stocks.reduce((acc, stock) => {
                    const quarter = stock.reports[0].quarter;
                    if (!acc[quarter]) {
                      acc[quarter] = [];
                    }
                    acc[quarter].push(stock);
                    return acc;
                  }, {} as Record<string, typeof stocks>);

                  // 按季度排序（从新到旧）
                  const sortedQuarters = Object.keys(groupedByQuarter).sort((a, b) => 
                    new Date(b).getTime() - new Date(a).getTime()
                  );

                  // 格式化季度显示
                  const formatQuarter = (dateStr: string) => {
                    // dateStr 格式: 2025-09-30 或 2025-12-31
                    const parts = dateStr.split('-');
                    const year = parts[0];
                    const month = parseInt(parts[1]);
                    
                    // 根据月份判断季度
                    let quarter = 1;
                    if (month === 3) quarter = 1;      // 一季度：3月31日
                    else if (month === 6) quarter = 2;  // 二季度：6月30日
                    else if (month === 9) quarter = 3;  // 三季度：9月30日
                    else if (month === 12) quarter = 4; // 四季度：12月31日
                    
                    return `${year}年${quarter}季度业绩预增（近7天）`;
                  };

                  return sortedQuarters.map((quarter) => (
                    <div key={quarter} className="space-y-2">
                      <h3 className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 sticky top-0 bg-white dark:bg-gray-800 py-2 border-b border-gray-200 dark:border-gray-700">
                        {formatQuarter(quarter)} ({groupedByQuarter[quarter].length}只)
                      </h3>
                      <div className="space-y-2">
                        {groupedByQuarter[quarter].map((stock) => {
                          const report = stock.reports[0];
                          // 构建东方财富公告链接
                          const announcementUrl = `http://data.eastmoney.com/notices/detail/${stock.stockCode}/.html`;
                          
                          return (
                            <div
                              key={stock.stockCode}
                              className="p-2.5 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                  <span className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white truncate">
                                    {stock.stockName}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                    {stock.stockCode}
                                  </span>
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 flex-shrink-0">
                                  {report.forecastType} {report.changeMin}%~{report.changeMax}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                                <span className="truncate">公告：{report.reportDate}</span>
                                <a
                                  href={announcementUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0 ml-2 active:text-indigo-800"
                                >
                                  查看 →
                                </a>
                              </div>
                              
                              {/* AI 点评 */}
                              <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                                {aiComments[stock.stockCode] ? (
                                  <div className="flex items-start gap-1.5">
                                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex-shrink-0">AI:</span>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                                      {aiComments[stock.stockCode]}
                                    </p>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => getAiComment(stock)}
                                    disabled={loadingComments[stock.stockCode]}
                                    className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {loadingComments[stock.stockCode] ? '生成中...' : '🤖 获取 AI 点评'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm pb-4">
          <p className="mb-3 sm:mb-4">数据来源：东方财富 | 每5分钟自动更新</p>
          <a
            href="/admin"
            className="inline-block px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 active:bg-slate-800 transition-colors text-sm font-medium"
          >
            数据库管理
          </a>
        </div>
      </div>
    </div>
  );
}
