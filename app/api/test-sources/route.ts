import { NextResponse } from 'next/server';
import axios from 'axios';

// 测试多个数据源
export async function GET() {
  const results: any = {};

  // 数据源1: 业绩预告
  try {
    const url1 = 'http://datacenter-web.eastmoney.com/api/data/v1/get';
    const params1 = {
      reportName: 'RPT_PUBLIC_OP_NEWPREDICT',
      columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,NOTICE_DATE,REPORT_DATE,PREDICT_TYPE,ADD_AMP_LOWER,ADD_AMP_UPPER,PREDICT_CONTENT',
      filter: '(PREDICT_TYPE="预增")',
      pageSize: 5,
      pageNumber: 1,
      sortColumns: 'NOTICE_DATE',
      sortTypes: '-1',
      source: 'WEB',
      client: 'WEB',
    };
    const response1 = await axios.get(url1, { params: params1, timeout: 10000 });
    results.source1_业绩预告 = {
      url: url1,
      count: response1.data?.result?.data?.length || 0,
      sample: response1.data?.result?.data?.[0] || null
    };
  } catch (error) {
    results.source1_业绩预告 = { error: String(error) };
  }

  // 数据源2: 业绩快报
  try {
    const url2 = 'http://datacenter-web.eastmoney.com/api/data/v1/get';
    const params2 = {
      reportName: 'RPT_PUBLIC_OP_EXPRESS',
      columns: 'ALL',
      pageSize: 5,
      pageNumber: 1,
      sortColumns: 'NOTICE_DATE',
      sortTypes: '-1',
      source: 'WEB',
      client: 'WEB',
    };
    const response2 = await axios.get(url2, { params: params2, timeout: 10000 });
    results.source2_业绩快报 = {
      url: url2,
      count: response2.data?.result?.data?.length || 0,
      sample: response2.data?.result?.data?.[0] || null
    };
  } catch (error) {
    results.source2_业绩快报 = { error: String(error) };
  }

  // 数据源3: 沪深京A股业绩预告
  try {
    const url3 = 'http://datacenter-web.eastmoney.com/api/data/v1/get';
    const params3 = {
      reportName: 'RPT_LICO_FN_CPD',
      columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,NOTICE_DATE,REPORT_DATE_NAME,PREDICT_TYPE,PREDICT_RATIO_LOWER,PREDICT_RATIO_UPPER,PREDICT_CONTENT',
      filter: '(PREDICT_TYPE in ("预增","略增","续盈","扭亏"))',
      pageSize: 5,
      pageNumber: 1,
      sortColumns: 'NOTICE_DATE',
      sortTypes: '-1',
      source: 'WEB',
      client: 'WEB',
    };
    const response3 = await axios.get(url3, { params: params3, timeout: 10000 });
    results.source3_业绩预告CPD = {
      url: url3,
      count: response3.data?.result?.data?.length || 0,
      sample: response3.data?.result?.data?.[0] || null
    };
  } catch (error) {
    results.source3_业绩预告CPD = { error: String(error) };
  }

  // 数据源4: 东方财富行情中心业绩预告
  try {
    const url4 = 'http://datainterface.eastmoney.com/EM_DataCenter/JS.aspx';
    const params4 = {
      type: 'FN',
      sty: 'YJYG',
      st: 3,
      sr: -1,
      p: 1,
      ps: 5,
      js: 'var data_tab_1={pages:(pc),data:[(x)]}',
      filter: '(ggyg=\'预增\')',
    };
    const response4 = await axios.get(url4, { params: params4, timeout: 10000 });
    results.source4_行情中心 = {
      url: url4,
      rawResponse: response4.data
    };
  } catch (error) {
    results.source4_行情中心 = { error: String(error) };
  }

  return NextResponse.json(results, { status: 200 });
}
