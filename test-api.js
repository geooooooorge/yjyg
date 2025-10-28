const axios = require('axios');

async function testAPI() {
  try {
    const url = 'http://datacenter-web.eastmoney.com/api/data/v1/get';
    const params = {
      sortColumns: 'NOTICE_DATE,SECURITY_CODE',
      sortTypes: '-1,-1',
      pageSize: 500,
      pageNumber: 1,
      reportName: 'RPT_PUBLIC_OP_NEWPREDICT',
      columns: 'SECURITY_CODE,SECURITY_NAME_ABBR,NOTICE_DATE,REPORT_DATE,PREDICT_TYPE,PREDICT_FINANCE_CODE,ADD_AMP_LOWER,ADD_AMP_UPPER,PREDICT_CONTENT,CHANGE_REASON_EXPLAIN,PREDICT_AMT_UPPER,PREDICT_AMT_LOWER',
      filter: '(PREDICT_TYPE in ("预增","略增","续盈","扭亏")) and (PREDICT_FINANCE_CODE="004")',
      source: 'WEB',
      client: 'WEB',
    };

    console.log('Testing API call...');
    console.log('URL:', url);
    console.log('Params:', JSON.stringify(params, null, 2));

    const response = await axios.get(url, { 
      params,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'http://data.eastmoney.com/',
        'Accept': 'application/json'
      }
    });

    console.log('\nResponse status:', response.status);
    console.log('Has data:', !!response.data);
    console.log('Has result:', !!response.data?.result);
    console.log('Has result.data:', !!response.data?.result?.data);
    console.log('Data length:', response.data?.result?.data?.length || 0);

    if (response.data?.result?.data && response.data.result.data.length > 0) {
      console.log('\nFirst item sample:');
      console.log(JSON.stringify(response.data.result.data[0], null, 2));
    } else {
      console.log('\nNo data returned!');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();
