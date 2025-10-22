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
      columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,NOTICE_DATE,REPORT_DATE,PREDICT_TYPE,PREDICT_FINANCE_CODE,ADD_AMP_LOWER,ADD_AMP_UPPER,PREDICT_CONTENT,CHANGE_REASON_EXPLAIN',
      // 筛选条件：预增类型 + 净利润指标
      filter: '(PREDICT_TYPE in ("预增","略增","续盈","扭亏")) and (PREDICT_FINANCE_CODE="004")',
      source: 'WEB',
      client: 'WEB',
    };

    const response = await axios.get(url, { 
      params,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'http://data.eastmoney.com/',
        'Accept': 'application/json'
      }
    });

    if (response.data && response.data.result && response.data.result.data) {
      const reports: EarningsReport[] = response.data.result.data.map((item: any) => {
        // 确保预增幅度是数字
        const changeMin = parseFloat(item.ADD_AMP_LOWER) || 0;
        const changeMax = parseFloat(item.ADD_AMP_UPPER) || 0;
        
        return {
          stockCode: item.SECURITY_CODE,
          stockName: item.SECURITY_NAME_ABBR,
          reportDate: item.NOTICE_DATE ? item.NOTICE_DATE.split(' ')[0] : '',
          quarter: item.REPORT_DATE ? item.REPORT_DATE.split(' ')[0] : '',
          forecastType: item.PREDICT_TYPE,
          changeMin: changeMin,
          changeMax: changeMax,
          content: item.PREDICT_CONTENT || item.CHANGE_REASON_EXPLAIN || '',
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
      
      return uniqueReports;
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch earnings reports:', error);
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
 */
export function getLatestReports(reports: EarningsReport[]): Map<string, EarningsReport[]> {
  const stockMap = new Map<string, EarningsReport>();
  
  // 每个股票只保留最新的一条预增报告
  reports.forEach(report => {
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
 * 格式化邮件内容
 */
export function formatEmailContent(stocks: Map<string, EarningsReport[]>): string {
  let content = '<h2>最新业绩预增股票报告</h2>\n';
  content += `<p>共 ${stocks.size} 只股票发布业绩预增公告</p>\n`;
  content += '<hr>\n';

  stocks.forEach((reports, stockCode) => {
    const report = reports[0]; // 只有一条记录
    const changeRange = report.changeMin === report.changeMax 
      ? `${report.changeMin}%`
      : `${report.changeMin}% ~ ${report.changeMax}%`;

    content += `<h3>${report.stockName} (${stockCode})</h3>\n`;
    content += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">\n';
    content += '<tr style="background-color: #f0f0f0;">\n';
    content += '<th>报告期</th><th>预告类型</th><th>变动幅度</th><th>公告日期</th>\n';
    content += '</tr>\n';
    content += '<tr>\n';
    content += `<td>${report.quarter}</td>\n`;
    content += `<td>${report.forecastType}</td>\n`;
    content += `<td style="color: #16a34a; font-weight: bold;">${changeRange}</td>\n`;
    content += `<td>${report.reportDate}</td>\n`;
    content += '</tr>\n';
    content += '</table>\n';
    
    if (report.content) {
      content += `<p><strong>预告摘要：</strong>${report.content.substring(0, 200)}${report.content.length > 200 ? '...' : ''}</p>\n`;
    }
    
    content += '<hr>\n';
  });

  content += `<p style="color: #666; font-size: 12px;">数据来源：东方财富 | 生成时间：${new Date().toLocaleString('zh-CN')}</p>\n`;

  return content;
}
