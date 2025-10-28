import axios from 'axios';

export interface EarningsReport {
  stockCode: string;
  stockName: string;
  reportDate: string;
  quarter: string;
  forecastType: string;
  changeMin: number;
  changeMax: number;
  content: string;
  priceChange?: number; // 自报告日期至今的涨跌幅
  currentPrice?: number; // 当前价格
  // 新增详细业绩数据
  predictValue?: number; // 预测数值（元）
  lastYearValue?: number; // 上年同期值（元）
  changeYoY?: number; // 业绩变动同比（%）
  changeQoQ?: number; // 业绩变动环比（%）
  changeReason?: string; // 业绩变动原因
}

/**
 * 获取东方财富业绩预增数据
 * API: http://data.eastmoney.com/DataCenter_V3/stock2016/TradeDetail/pagesize=200,page=1,sortRule=-1,sortType=,startDate=,endDate=,gpfw=0,js=var data_tab_1.html
 */
export async function fetchEarningsReports(): Promise<EarningsReport[]> {
  try {
    // 使用东方财富业绩预告接口 - 直接筛选预增类型，只取净利润指标
    const url = 'http://datacenter-web.eastmoney.com/api/data/v1/get';
    const params = {
      sortColumns: 'NOTICE_DATE,SECURITY_CODE',
      sortTypes: '-1,-1',
      pageSize: 500,
      pageNumber: 1,
      reportName: 'RPT_PUBLIC_OP_NEWPREDICT',
      columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,NOTICE_DATE,REPORT_DATE,PREDICT_TYPE,PREDICT_FINANCE_CODE,ADD_AMP_LOWER,ADD_AMP_UPPER,PREDICT_CONTENT,CHANGE_REASON_EXPLAIN,PREDICT_AMT_UPPER,PREDICT_AMT_LOWER',
      // 筛选条件：预增类型 + 净利润指标
      filter: '(PREDICT_TYPE in ("预增","略增","续盈","扭亏")) and (PREDICT_FINANCE_CODE="004")',
      source: 'WEB',
      client: 'WEB',
    };

    console.log('Fetching from:', url);
    console.log('With params:', JSON.stringify(params, null, 2));
    
    const response = await axios.get(url, { 
      params,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'http://data.eastmoney.com/',
        'Accept': 'application/json'
      }
    });

    console.log('API Response status:', response.status);
    console.log('API Response data structure:', {
      hasData: !!response.data,
      hasResult: !!response.data?.result,
      hasResultData: !!response.data?.result?.data,
      dataLength: response.data?.result?.data?.length || 0
    });

    if (response.data && response.data.result && response.data.result.data) {
      const reports: EarningsReport[] = response.data.result.data.map((item: any) => {
        // 确保预增幅度是数字
        const changeMin = parseFloat(item.ADD_AMP_LOWER) || 0;
        const changeMax = parseFloat(item.ADD_AMP_UPPER) || 0;
        
        // 计算预测数值（取上下限的平均值）
        const predictUpper = parseFloat(item.PREDICT_AMT_UPPER) || 0;
        const predictLower = parseFloat(item.PREDICT_AMT_LOWER) || 0;
        const predictValue = predictUpper && predictLower ? (predictUpper + predictLower) / 2 : (predictUpper || predictLower);
        
        return {
          stockCode: item.SECURITY_CODE,
          stockName: item.SECURITY_NAME_ABBR,
          reportDate: item.NOTICE_DATE ? item.NOTICE_DATE.split(' ')[0] : '',
          quarter: item.REPORT_DATE ? item.REPORT_DATE.split(' ')[0] : '',
          forecastType: item.PREDICT_TYPE,
          changeMin: changeMin,
          changeMax: changeMax,
          content: item.PREDICT_CONTENT || item.CHANGE_REASON_EXPLAIN || '',
          // 新增字段
          predictValue: predictValue || undefined,
          changeReason: item.CHANGE_REASON_EXPLAIN || undefined,
        };
      });

      // 去重：同一股票同一季度只保留最新的一条
      const uniqueMap = new Map<string, EarningsReport>();
      reports.forEach(report => {
        const key = `${report.stockCode}-${report.quarter}`;
        const existing = uniqueMap.get(key);
        if (!existing || new Date(report.reportDate) > new Date(existing.reportDate)) {
          uniqueMap.set(key, report);
        }
      });

      const uniqueReports = Array.from(uniqueMap.values());
      console.log(`Fetched ${uniqueReports.length} unique earnings reports`);
      
      // 过滤过去三个季度（9个月）的数据
      const now = new Date();
      const nineMonthsAgo = new Date(now);
      nineMonthsAgo.setMonth(now.getMonth() - 9);
      
      const filteredReports = uniqueReports.filter(report => {
        const reportDate = new Date(report.reportDate);
        return reportDate >= nineMonthsAgo;
      });
      
      console.log(`Filtered to ${filteredReports.length} reports from past 3 quarters (since ${nineMonthsAgo.toISOString().split('T')[0]})`);
      
      return filteredReports;
    }

    console.error('API response structure invalid - no data found');
    return [];
  } catch (error: any) {
    console.error('Failed to fetch earnings reports:', error.message);
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    return [];
  }
}

/**
 * 获取股票实时行情和历史涨跌幅
 */
async function fetchStockPriceChange(stockCode: string, reportDate: string): Promise<{ priceChange: number; currentPrice: number } | null> {
  try {
    // 确定市场代码
    let marketCode = '1'; // 上海
    if (stockCode.startsWith('0') || stockCode.startsWith('3')) {
      marketCode = '0'; // 深圳
    } else if (stockCode.startsWith('4') || stockCode.startsWith('8') || stockCode.startsWith('9')) {
      marketCode = '0'; // 北交所
    }

    // 获取股票实时行情
    const quoteUrl = `https://push2.eastmoney.com/api/qt/stock/get`;
    const quoteParams = {
      secid: `${marketCode}.${stockCode}`,
      fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f107,f152,f162,f168,f169,f170,f171',
      ut: 'fa5fd1943c7b386f172d6893dbfba10b',
    };

    const quoteResponse = await axios.get(quoteUrl, { 
      params: quoteParams,
      timeout: 5000 
    });

    if (!quoteResponse.data?.data) {
      return null;
    }

    const data = quoteResponse.data.data;
    const currentPrice = data.f43 / 100; // 当前价格（分转元）
    
    // 获取报告日期的收盘价
    const reportDateObj = new Date(reportDate);
    const klineUrl = `https://push2his.eastmoney.com/api/qt/stock/kline/get`;
    const klineParams = {
      secid: `${marketCode}.${stockCode}`,
      fields1: 'f1,f2,f3,f4,f5,f6',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
      klt: '101', // 日K
      fqt: '1', // 前复权
      beg: reportDate.replace(/-/g, ''),
      end: '20991231',
      lmt: 1,
      ut: 'fa5fd1943c7b386f172d6893dbfba10b',
    };

    const klineResponse = await axios.get(klineUrl, {
      params: klineParams,
      timeout: 5000
    });

    if (!klineResponse.data?.data?.klines || klineResponse.data.data.klines.length === 0) {
      // 如果没有K线数据，返回当前价格，涨跌幅为0
      return { priceChange: 0, currentPrice };
    }

    const klineData = klineResponse.data.data.klines[0].split(',');
    const reportDatePrice = parseFloat(klineData[2]); // 收盘价

    if (reportDatePrice > 0) {
      const priceChange = ((currentPrice - reportDatePrice) / reportDatePrice) * 100;
      return { priceChange: parseFloat(priceChange.toFixed(2)), currentPrice };
    }

    return { priceChange: 0, currentPrice };
  } catch (error) {
    console.error(`Failed to fetch price change for ${stockCode}:`, error);
    return null;
  }
}

/**
 * 获取最新的业绩预增股票列表（每个股票只取最新一条）
 * 只返回最近7天内发布的公告
 */
export function getLatestReports(reports: EarningsReport[]): Map<string, EarningsReport[]> {
  const stockMap = new Map<string, EarningsReport>();
  
  // 计算7天前的日期
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  console.log(`Filtering reports published after: ${sevenDaysAgo.toISOString().split('T')[0]}`);
  
  // 只处理最近7天内的公告
  const recentReports = reports.filter(report => {
    const reportDate = new Date(report.reportDate);
    return reportDate >= sevenDaysAgo;
  });
  
  console.log(`Found ${recentReports.length} reports in the last 7 days (out of ${reports.length} total)`);
  
  // 每个股票只保留最新的一条预增报告
  recentReports.forEach(report => {
    const existing = stockMap.get(report.stockCode);
    if (!existing || new Date(report.reportDate) > new Date(existing.reportDate)) {
      stockMap.set(report.stockCode, report);
    }
  });

  // 转换为 Map<string, EarningsReport[]> 格式以保持接口兼容
  const result = new Map<string, EarningsReport[]>();
  stockMap.forEach((report, code) => {
    result.set(code, [report]);
  });

  return result;
}

/**
 * 获取单个股票的涨跌幅（供API单独调用）
 */
export async function getStockPriceChange(stockCode: string, reportDate: string): Promise<{ priceChange: number; currentPrice: number } | null> {
  return fetchStockPriceChange(stockCode, reportDate);
}

/**
 * 格式化即时通知邮件内容
 */
export function formatEmailContent(stocks: Map<string, EarningsReport[]>): string {
  // 格式化季度显示
  const formatQuarter = (dateStr: string) => {
    const parts = dateStr.split('-');
    const year = parts[0];
    const month = parseInt(parts[1]);
    
    let quarter = 1;
    if (month === 3) quarter = 1;
    else if (month === 6) quarter = 2;
    else if (month === 9) quarter = 3;
    else if (month === 12) quarter = 4;
    
    return `${year}年Q${quarter}`;
  };

  let stocksHtml = '';
  stocks.forEach((reports, stockCode) => {
    const report = reports[0];
    const announcementUrl = `http://data.eastmoney.com/notices/detail/${stockCode}/.html`;
    
    stocksHtml += `
      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 12px; border-radius: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div>
            <strong style="color: #1f2937; font-size: 18px;">${report.stockName}</strong>
            <span style="color: #6b7280; font-size: 14px; margin-left: 10px;">${stockCode}</span>
          </div>
          <span style="color: #10b981; font-weight: bold; font-size: 16px;">
            ${report.forecastType} ${report.changeMin}%~${report.changeMax}%
          </span>
        </div>
        <div style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">
          <span>📅 报告期：${formatQuarter(report.quarter)}</span>
          <span style="margin-left: 20px;">📢 公告日期：${report.reportDate}</span>
        </div>
        <div style="margin-top: 10px;">
          <a href="${announcementUrl}" style="color: #4f46e5; text-decoration: none; font-size: 13px;">📄 查看完整公告 →</a>
        </div>
      </div>
    `;
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 24px;">⚡ 业绩预增即时提醒</h2>
        <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">发现新增公告，立即推送</p>
      </div>
      
      <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <p style="color: #92400e; margin: 0; font-size: 15px;">
          🔔 <strong>共发现 ${stocks.size} 只股票发布业绩预增公告（近7天）</strong>
        </p>
      </div>
      
      ${stocksHtml}
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center;">
        <p style="margin: 5px 0;">📊 数据来源：东方财富</p>
        <p style="margin: 5px 0;">⏰ 推送时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
        <p style="margin: 5px 0; color: #d1d5db;">此邮件由业绩预增跟踪系统自动发送</p>
      </div>
    </div>
  `;
}
