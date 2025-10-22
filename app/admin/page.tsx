'use client';

import { useState, useEffect } from 'react';
import { Database, Mail, TrendingUp, Trash2, RefreshCw, Download } from 'lucide-react';

interface Stock {
  stockCode: string;
  stockName: string;
  reports: Array<{
    quarter: string;
    forecastType: string;
    changeMin: number;
    changeMax: number;
    reportDate: string;
  }>;
}

export default function AdminPage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'emails' | 'stocks' | 'history'>('emails');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [emailsRes, stocksRes, historyRes] = await Promise.all([
        fetch('/api/emails'),
        fetch('/api/earnings'),
        fetch('/api/email-history')
      ]);

      const emailsData = await emailsRes.json();
      const stocksData = await stocksRes.json();
      const historyData = await historyRes.json();

      if (emailsData.success) {
        setEmails(emailsData.emails);
      }
      if (stocksData.success) {
        setStocks(stocksData.stocks);
      }
      if (historyData.success) {
        setHistory(historyData.history);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  const clearAllEmails = async () => {
    if (!confirm('确定要清空所有邮箱吗？此操作不可恢复！')) return;

    try {
      const deletePromises = emails.map(email =>
        fetch('/api/emails', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
      );

      await Promise.all(deletePromises);
      setMessage('已清空所有邮箱');
      fetchData();
    } catch (error) {
      setMessage('清空失败');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const clearHistory = async () => {
    if (!confirm('确定要清空所有邮件发送历史吗？此操作不可恢复！')) return;

    try {
      const res = await fetch('/api/email-history', { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setMessage('历史记录已清空');
        fetchData();
      } else {
        setMessage('清空失败');
      }
    } catch (error) {
      setMessage('清空失败');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const exportData = () => {
    const data = {
      emails,
      stocks: stocks.map(s => ({
        stockCode: s.stockCode,
        stockName: s.stockName,
        reports: s.reports
      })),
      history,
      exportTime: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setMessage('数据已导出');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-10 h-10 text-slate-600 dark:text-slate-400" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  数据库管理
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  查看和管理系统数据
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </button>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出数据
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-lg text-center">
            {message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">订阅邮箱</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                  {emails.length}
                </p>
              </div>
              <Mail className="w-12 h-12 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">预增股票</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                  {stocks.length}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">发送历史</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                  {history.length}
                </p>
              </div>
              <Database className="w-12 h-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('emails')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'emails'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" />
                邮箱列表 ({emails.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stocks')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'stocks'
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-b-2 border-green-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                股票数据 ({stocks.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'history'
                  ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Database className="w-5 h-5" />
                发送历史 ({history.length})
              </div>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'emails' ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    订阅邮箱列表
                  </h3>
                  {emails.length > 0 && (
                    <button
                      onClick={clearAllEmails}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      清空全部
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {emails.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      暂无订阅邮箱
                    </p>
                  ) : (
                    emails.map((email, index) => (
                      <div
                        key={email}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-400 dark:text-gray-500 w-8">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-gray-700 dark:text-gray-200">
                          {email}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : activeTab === 'stocks' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  预增股票数据
                </h3>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stocks.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      暂无股票数据
                    </p>
                  ) : (
                    stocks.map((stock) => (
                      <div
                        key={stock.stockCode}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {stock.stockName}
                            </span>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              {stock.stockCode}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {stock.reports.map((report, idx) => (
                            <div
                              key={idx}
                              className="text-sm text-gray-600 dark:text-gray-300 flex justify-between"
                            >
                              <span>{report.quarter}</span>
                              <span className="text-green-600 dark:text-green-400">
                                {report.forecastType} {report.changeMin}%~{report.changeMax}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    邮件发送历史
                  </h3>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      清空历史
                    </button>
                  )}
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      暂无发送历史
                    </p>
                  ) : (
                    history.map((record: any) => (
                      <div
                        key={record.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(record.sentAt).toLocaleString('zh-CN')}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-indigo-600 dark:text-indigo-400">
                              {record.recipients.length} 个收件人
                            </span>
                            <span className="text-green-600 dark:text-green-400">
                              {record.stockCount} 只股票
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {record.stocks.slice(0, 3).map((stock: any, idx: number) => (
                            <div key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex justify-between">
                              <span>{stock.stockName} ({stock.stockCode})</span>
                              <span className="text-green-600 dark:text-green-400">
                                {stock.forecastType} {stock.changeRange}
                              </span>
                            </div>
                          ))}
                          {record.stocks.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
                              还有 {record.stocks.length - 3} 只股票...
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
