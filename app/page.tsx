'use client';

/**
 * 业绩预增跟踪器 - 主页面
 * 
 * 设计原则应用:
 * 1. 信息架构: 核心功能优先,渐进披露
 * 2. 视觉层级: 60% 主色 / 30% 辅助色 / 10% 强调色
 * 3. 交互设计: 完整状态覆盖,即时反馈
 * 4. 性能优化: 骨架屏、乐观UI、懒加载
 * 5. 可访问性: ARIA标签、键盘导航、色彩对比
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Mail, 
  Plus, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  ExternalLink, 
  BarChart3,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { StockCardSkeleton } from '@/components/ui/Skeleton';

// ==================== 类型定义 ====================

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
    predictValue?: number;
    lastYearValue?: number;
    changeYoY?: number;
    changeQoQ?: number;
    changeReason?: string;
  }>;
}

interface AITestStatus {
  status: 'idle' | 'testing' | 'success' | 'error';
  message: string;
  responseTime?: string;
}

// ==================== 主组件 ====================

export default function Home() {
  // 状态管理
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [aiComments, setAiComments] = useState<Record<string, string>>({});
  const [aiTestStatus, setAiTestStatus] = useState<AITestStatus>({ 
    status: 'idle', 
    message: '' 
  });

  // ==================== 数据获取 ====================

  const updateOnlineStatus = useCallback(async () => {
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
  }, [userId]);

  const fetchOnlineCount = useCallback(async () => {
    try {
      const res = await fetch('/api/online');
      const data = await res.json();
      if (data.success) {
        setOnlineCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch online count:', error);
    }
  }, []);

  const fetchEmails = useCallback(async () => {
    try {
      const res = await fetch('/api/emails');
      const data = await res.json();
      if (data.success) {
        setEmails(data.emails);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    }
  }, []);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    try {
      const todayRes = await fetch('/api/earnings?type=today');
      const todayData = await todayRes.json();
      
      if (todayData.success && todayData.stocks && todayData.stocks.length > 0) {
        setStocks(todayData.stocks);
      } else {
        const recentRes = await fetch('/api/earnings?type=recent');
        const recentData = await recentRes.json();
        if (recentData.success) {
          setStocks(recentData.stocks);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
      showMessage('error', '加载数据失败,请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAiComments = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-comments');
      const data = await res.json();
      
      if (data.success && data.comments) {
        const commentsByCode: Record<string, string> = {};
        Object.entries(data.comments).forEach(([key, comment]) => {
          const stockCode = key.split('_')[0];
          commentsByCode[stockCode] = comment as string;
        });
        setAiComments(commentsByCode);
      }
    } catch (error) {
      console.error('Failed to fetch AI comments:', error);
    }
  }, []);

  const testAiApi = useCallback(async () => {
    setAiTestStatus({ status: 'testing', message: '测试 AI API 连接...' });
    
    try {
      const res = await fetch('/api/test-ai');
      const data = await res.json();
      
      if (data.success) {
        setAiTestStatus({ 
          status: 'success', 
          message: `AI API 连接正常 (${data.responseTime})`,
          responseTime: data.responseTime
        });
      } else {
        setAiTestStatus({ 
          status: 'error', 
          message: data.error || 'AI API 测试失败'
        });
      }
    } catch (error) {
      setAiTestStatus({ 
        status: 'error', 
        message: '无法连接到 AI API'
      });
    }
  }, []);

  // ==================== 用户操作 ====================

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addEmail = async () => {
    if (!newEmail.trim()) {
      setEmailError('请输入邮箱地址');
      return;
    }

    if (!validateEmail(newEmail)) {
      setEmailError('请输入有效的邮箱地址');
      return;
    }

    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      });

      const data = await res.json();
      
      if (data.success) {
        showMessage('success', '邮箱添加成功!');
        setNewEmail('');
        setEmailError('');
        fetchEmails();
      } else {
        setEmailError(data.error || '添加失败');
      }
    } catch (error) {
      setEmailError('添加失败,请重试');
    }
  };

  const removeEmail = async (email: string) => {
    try {
      await fetch('/api/emails', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setEmails(emails.filter((e) => e !== email));
      showMessage('success', '邮箱已删除');
    } catch (error) {
      showMessage('error', '删除失败,请重试');
    }
  };

  // ==================== 生命周期 ====================

  useEffect(() => {
    fetchEmails();
    fetchStocks();
    updateOnlineStatus();
    testAiApi();
    
    const heartbeatInterval = setInterval(updateOnlineStatus, 15000);
    const countInterval = setInterval(fetchOnlineCount, 10000);
    
    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(countInterval);
    };
  }, [fetchEmails, fetchStocks, updateOnlineStatus, testAiApi, fetchOnlineCount]);

  useEffect(() => {
    if (stocks.length > 0) {
      fetchAiComments();
    }
  }, [stocks, fetchAiComments]);

  // ==================== 渲染函数 ====================

  const formatQuarter = (dateStr: string) => {
    const parts = dateStr.split('-');
    const year = parts[0];
    const month = parseInt(parts[1]);
    
    let quarter = 1;
    if (month === 3) quarter = 1;
    else if (month === 6) quarter = 2;
    else if (month === 9) quarter = 3;
    else if (month === 12) quarter = 4;
    
    return `${year}年${quarter}季度业绩预增`;
  };

  const groupStocksByQuarter = () => {
    const grouped = stocks.reduce((acc, stock) => {
      const quarter = stock.reports[0].quarter;
      if (!acc[quarter]) {
        acc[quarter] = [];
      }
      acc[quarter].push(stock);
      return acc;
    }, {} as Record<string, Stock[]>);

    return Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(quarter => ({ quarter, stocks: grouped[quarter] }));
  };

  // ==================== 主渲染 ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-neutral-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        
        {/* 在线人数指示器 - 右上角固定 */}
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <Badge variant="success" size="md" className="shadow-lg">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="font-semibold">{onlineCount}</span>
            <span className="text-xs">在线</span>
          </Badge>
        </div>

        {/* 页头 - 信息架构: 核心功能优先 */}
        <header className="text-center mb-8 sm:mb-12 animate-slide-down">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-neutral-900 dark:text-white">
              业绩预增跟踪器
            </h1>
          </div>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 mb-6 max-w-2xl mx-auto">
            自动跟踪最新业绩预增股票,AI 智能分析,实时邮件通知
          </p>
          
          {/* 导航链接 */}
          <nav className="flex items-center justify-center gap-3 sm:gap-4" aria-label="外部链接">
            <Button
              href="https://hundsun.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="md"
              icon={ExternalLink}
            >
              Hundsun
            </Button>
            <Button
              href="https://etf-tracker.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="md"
              icon={BarChart3}
            >
              ETF Tracker
            </Button>
          </nav>
        </header>

        {/* 全局消息提示 - 反馈类动效 */}
        {message && (
          <div 
            className={`mb-6 p-4 rounded-lg animate-slide-down ${
              message.type === 'success' 
                ? 'bg-success-50 text-success-800 border border-success-200 dark:bg-success-900/20 dark:text-success-300 dark:border-success-800' 
                : 'bg-error-50 text-error-800 border border-error-200 dark:bg-error-900/20 dark:text-error-300 dark:border-error-800'
            }`}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* AI API 状态 - 系统状态反馈 */}
        <Card className="mb-6 animate-fade-in">
          <div className={`flex items-center justify-between p-3 sm:p-4 rounded-lg ${
            aiTestStatus.status === 'success' 
              ? 'bg-success-50 dark:bg-success-900/20' 
              : aiTestStatus.status === 'error'
              ? 'bg-error-50 dark:bg-error-900/20'
              : 'bg-primary-50 dark:bg-primary-900/20'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${
                aiTestStatus.status === 'success' ? 'text-success-600' :
                aiTestStatus.status === 'error' ? 'text-error-600' :
                'text-primary-600 animate-pulse'
              }`} aria-hidden="true" />
              <span className="text-sm font-medium">{aiTestStatus.message}</span>
            </div>
            {aiTestStatus.status !== 'testing' && (
              <Button
                onClick={testAiApi}
                variant="ghost"
                size="sm"
                aria-label="重新测试AI API"
              >
                重新测试
              </Button>
            )}
          </div>
        </Card>

        {/* 邮件订阅模块 - 渐进披露 */}
        <Card className="mb-6 animate-slide-up" padding="md">
          <CardHeader
            title="邮件订阅"
            subtitle="订阅后将自动接收业绩预增通知"
            icon={<Mail className="w-5 h-5 text-primary-600" />}
            action={
              emails.length > 0 && (
                <Badge variant="info" size="md">
                  {emails.length} 个订阅
                </Badge>
              )
            }
          />

          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setEmailError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                placeholder="输入邮箱地址"
                error={emailError}
                fullWidth
                aria-label="邮箱地址"
              />
              <Button
                onClick={addEmail}
                variant="primary"
                icon={Plus}
                aria-label="添加邮箱"
              >
                添加
              </Button>
            </div>

            {emails.length > 0 && (
              <div className="flex flex-wrap gap-2" role="list" aria-label="已订阅邮箱列表">
                {emails.map((email) => (
                  <div
                    key={email}
                    className="group flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-600"
                    role="listitem"
                  >
                    <span className="text-neutral-700 dark:text-neutral-200">{email}</span>
                    <button
                      onClick={() => removeEmail(email)}
                      className="text-error-600 hover:text-error-700 dark:text-error-400 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                      aria-label={`删除邮箱 ${email}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 股票列表 - 核心内容区域 */}
        <Card padding="lg" className="animate-slide-up">
          <CardHeader
            title="今日新增"
            subtitle={`数据来源：东方财富 | 每5分钟自动更新`}
            icon={<TrendingUp className="w-6 h-6 text-success-600" />}
            action={
              <Button
                onClick={fetchStocks}
                loading={loading}
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                aria-label="刷新数据"
              >
                刷新
              </Button>
            }
          />

          <CardContent>
            <div className="space-y-6 max-h-[600px] overflow-y-auto scrollbar-thin">
              {/* 加载状态 - 骨架屏 */}
              {loading ? (
                <div className="space-y-4" aria-live="polite" aria-busy="true">
                  <StockCardSkeleton />
                  <StockCardSkeleton />
                  <StockCardSkeleton />
                </div>
              ) : stocks.length === 0 ? (
                /* 空状态 */
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-4">
                    <TrendingUp className="w-8 h-8 text-neutral-400" aria-hidden="true" />
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                    暂无新增业绩预增公告
                  </p>
                </div>
              ) : (
                /* 股票列表 - 按季度分组 */
                groupStocksByQuarter().map(({ quarter, stocks: quarterStocks }) => (
                  <section key={quarter} className="space-y-3">
                    <h3 className="sticky top-0 z-10 text-sm font-semibold text-primary-600 dark:text-primary-400 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm py-2 px-3 rounded-lg border border-primary-200 dark:border-primary-800">
                      {formatQuarter(quarter)} ({quarterStocks.length}只)
                    </h3>
                    <div className="space-y-3">
                      {quarterStocks.map((stock) => {
                        const report = stock.reports[0];
                        const announcementUrl = `http://data.eastmoney.com/notices/detail/${stock.stockCode}/.html`;
                        
                        return (
                          <article
                            key={stock.stockCode}
                            className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-250"
                          >
                            {/* AI 评分区域 */}
                            {aiComments[stock.stockCode] && (
                              <div className="mb-3 p-3 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                                <div className="flex items-start gap-2">
                                  <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                  <div>
                                    <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wide">AI 分析</span>
                                    <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed mt-1">
                                      {aiComments[stock.stockCode]}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 股票基本信息 */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <h4 className="font-semibold text-lg text-neutral-900 dark:text-white truncate">
                                    {stock.stockName}
                                  </h4>
                                  <Badge variant="default" size="sm">
                                    {stock.stockCode}
                                  </Badge>
                                </div>
                                <a
                                  href={announcementUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline flex-shrink-0"
                                >
                                  查看详情
                                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                                </a>
                              </div>
                              
                              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                                <Badge variant="success" size="sm">
                                  {report.forecastType}
                                </Badge>
                                <span className="font-medium">
                                  {report.changeMin}% ~ {report.changeMax}%
                                </span>
                                <span className="text-neutral-400">|</span>
                                <span>公告：{report.reportDate}</span>
                              </div>
                              
                              {/* 详细业绩数据 */}
                              {(report.predictValue || report.lastYearValue || report.changeYoY !== undefined || report.changeQoQ !== undefined) && (
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  {report.predictValue && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-neutral-500 dark:text-neutral-400">预测值:</span>
                                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                        {(report.predictValue / 100000000).toFixed(2)}亿
                                      </span>
                                    </div>
                                  )}
                                  {report.lastYearValue && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-neutral-500 dark:text-neutral-400">去年同期:</span>
                                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                        {(report.lastYearValue / 100000000).toFixed(2)}亿
                                      </span>
                                    </div>
                                  )}
                                  {report.changeYoY !== undefined && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-neutral-500 dark:text-neutral-400">同比:</span>
                                      <span className={`font-medium ${report.changeYoY >= 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                                        {report.changeYoY > 0 ? '+' : ''}{report.changeYoY.toFixed(2)}%
                                      </span>
                                    </div>
                                  )}
                                  {report.changeQoQ !== undefined && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-neutral-500 dark:text-neutral-400">环比:</span>
                                      <span className={`font-medium ${report.changeQoQ >= 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                                        {report.changeQoQ > 0 ? '+' : ''}{report.changeQoQ.toFixed(2)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* 业绩变动原因 */}
                              {report.changeReason && (
                                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-sm">
                                  <span className="font-medium text-neutral-700 dark:text-neutral-300">原因: </span>
                                  <span className="text-neutral-600 dark:text-neutral-400">{report.changeReason}</span>
                                </div>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 页脚 */}
        <footer className="text-center mt-8 pb-4 space-y-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            © 2024 业绩预增跟踪器 · 数据来源：东方财富
          </p>
          <Button
            href="/admin"
            variant="secondary"
            size="md"
          >
            数据库管理
          </Button>
        </footer>
      </div>
    </div>
  );
}
