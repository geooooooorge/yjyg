import { NextResponse } from 'next/server';
import axios from 'axios';

// 调试接口：查看原始数据
export async function GET() {
  try {
    const url = 'http://datacenter-web.eastmoney.com/api/data/v1/get';
    const params = {
      sortColumns: 'NOTICE_DATE,SECURITY_CODE',
      sortTypes: '-1,-1',
      pageSize: 10, // 只取10条用于调试
      pageNumber: 1,
      reportName: 'RPT_PUBLIC_OP_NEWPREDICT',
      columns: 'ALL',
      quoteColumns: '',
      source: 'WEB',
      client: 'WEB',
    };

    const response = await axios.get(url, { 
      params,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'http://data.eastmoney.com/'
      }
    });

    return NextResponse.json({ 
      success: true,
      rawData: response.data,
      sampleItem: response.data?.result?.data?.[0] || null
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
