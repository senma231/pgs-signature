/**
 * 电子签名系统 - Cloudflare Workers API
 * 适配 COMPANIES_KV 命名空间
 */

// CORS配置
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

// 管理密码
const ADMIN_PASSWORD = 'Sz@pgsit';

// KV存储键名
const COMPANIES_KEY = 'companies_data';

// 默认公司数据
const DEFAULT_COMPANIES = {
  'default': {
      displayName: 'Default',
      name: '',
      address: '',
      tel: '',
      mobile: '',
      email: '',
      fax: '',
      showFax: false,
      isDefault: true
  }
};

/**
* 添加CORS头到响应
*/
function addCorsHeaders(response) {
  const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
          ...response.headers,
          ...CORS_HEADERS
      }
  });
  return newResponse;
}

/**
* 处理OPTIONS预检请求
*/
function handleOptions() {
  return new Response(null, {
      status: 200,
      headers: CORS_HEADERS
  });
}

/**
* 创建JSON响应
*/
function jsonResponse(data, status = 200) {
  const response = new Response(JSON.stringify(data), {
      status,
      headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS
      }
  });
  return response;
}

/**
* 创建错误响应
*/
function errorResponse(message, status = 400) {
  return jsonResponse({
      error: message,
      timestamp: new Date().toISOString()
  }, status);
}

/**
* 从KV存储获取公司数据
*/
async function getCompaniesFromKV() {
  try {
      const data = await COMPANIES_KV.get(COMPANIES_KEY);
      if (data) {
          return JSON.parse(data);
      }
      return DEFAULT_COMPANIES;
  } catch (error) {
      console.error('获取公司数据失败:', error);
      return DEFAULT_COMPANIES;
  }
}

/**
* 保存公司数据到KV存储
*/
async function saveCompaniesToKV(companies) {
  try {
      await COMPANIES_KV.put(COMPANIES_KEY, JSON.stringify(companies));
      return true;
  } catch (error) {
      console.error('保存公司数据失败:', error);
      return false;
  }
}

/**
* 健康检查
*/
async function handleHealth() {
  try {
      // 测试KV连接
      const testData = await COMPANIES_KV.get('health_check');
      await COMPANIES_KV.put('health_check', new Date().toISOString());
      
      return jsonResponse({
          success: true,
          message: "Cloudflare Workers API正常运行",
          timestamp: new Date().toISOString(),
          worker: "electronic-signature-api",
          kv_status: "connected",
          kv_namespace: "COMPANIES_KV"
      });
  } catch (error) {
      return jsonResponse({
          success: false,
          message: "健康检查失败",
          error: error.message,
          timestamp: new Date().toISOString(),
          worker: "electronic-signature-api",
          kv_status: "error",
          kv_namespace: "COMPANIES_KV"
      }, 500);
  }
}

/**
* 获取所有公司
*/
async function handleGetCompanies() {
  try {
      const companies = await getCompaniesFromKV();
      return jsonResponse({
          success: true,
          data: companies,
          count: Object.keys(companies).length,
          timestamp: new Date().toISOString()
      });
  } catch (error) {
      return errorResponse(`获取公司数据失败: ${error.message}`, 500);
  }
}

/**
* 添加新公司
*/
async function handleAddCompany(request) {
  try {
      const body = await request.json();
      const { displayName, name, address, tel, mobile, email, fax, showFax, customWebsite, website, groupWebsite } = body;

      // 验证必填字段
      if (!displayName || !name || !address) {
          return errorResponse('显示名称、公司名称和地址为必填项');
      }

      // 如果启用自定义Website，验证Website字段
      if (customWebsite && !website) {
          return errorResponse('启用自定义Website时，Website地址为必填项');
      }

      // 获取现有公司数据
      const companies = await getCompaniesFromKV();

      // 生成唯一ID
      const companyId = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 添加新公司
      companies[companyId] = {
          displayName: displayName.trim(),
          name: name.trim(),
          address: address.trim(),
          tel: tel?.trim() || '',
          mobile: mobile?.trim() || '',
          email: email?.trim() || '',
          fax: fax?.trim() || '',
          showFax: Boolean(showFax),
          customWebsite: Boolean(customWebsite),
          website: customWebsite ? (website?.trim() || '') : '',
          groupWebsite: customWebsite ? (groupWebsite?.trim() || 'www.francescoparisi.com') : '',
          isDefault: false,
          createdAt: new Date().toISOString()
      };
      
      // 保存到KV
      const saved = await saveCompaniesToKV(companies);
      if (!saved) {
          return errorResponse('保存公司数据失败', 500);
      }
      
      return jsonResponse({
          success: true,
          message: '公司添加成功',
          companyId,
          data: companies[companyId],
          timestamp: new Date().toISOString()
      });
      
  } catch (error) {
      return errorResponse(`添加公司失败: ${error.message}`, 500);
  }
}

/**
* 更新公司信息
*/
async function handleUpdateCompany(companyId, request) {
  try {
      if (!companyId) {
          return errorResponse('公司ID不能为空');
      }

      const body = await request.json();
      const { displayName, name, address, tel, mobile, email, fax, showFax, customWebsite, website, groupWebsite } = body;

      // 验证必填字段
      if (!displayName || !name || !address) {
          return errorResponse('显示名称、公司名称和地址为必填项');
      }

      // 获取现有公司数据
      const companies = await getCompaniesFromKV();

      // 检查公司是否存在
      if (!companies[companyId]) {
          return errorResponse('公司不存在', 404);
      }

      // 不允许更新默认公司的基本信息
      if (companies[companyId].isDefault) {
          return errorResponse('不能修改默认公司');
      }

      // 更新公司信息
      companies[companyId] = {
          ...companies[companyId], // 保留原有字段
          displayName: displayName.trim(),
          name: name.trim(),
          address: address.trim(),
          tel: tel?.trim() || '',
          mobile: mobile?.trim() || '',
          email: email?.trim() || '',
          fax: fax?.trim() || '',
          showFax: Boolean(showFax),
          customWebsite: Boolean(customWebsite),
          website: customWebsite ? (website?.trim() || '') : '',
          groupWebsite: customWebsite ? (groupWebsite?.trim() || 'www.francescoparisi.com') : '',
          updatedAt: new Date().toISOString()
      };

      // 保存到KV
      const saved = await saveCompaniesToKV(companies);
      if (!saved) {
          return errorResponse('更新公司数据失败', 500);
      }

      return jsonResponse({
          success: true,
          message: '公司更新成功',
          companyId,
          data: companies[companyId],
          timestamp: new Date().toISOString()
      });

  } catch (error) {
      return errorResponse(`更新公司失败: ${error.message}`, 500);
  }
}

/**
* 删除公司
*/
async function handleDeleteCompany(companyId) {
  try {
      if (!companyId) {
          return errorResponse('公司ID不能为空');
      }

      // 获取现有公司数据
      const companies = await getCompaniesFromKV();

      // 检查公司是否存在
      if (!companies[companyId]) {
          return errorResponse('公司不存在', 404);
      }

      // 不允许删除默认公司
      if (companies[companyId].isDefault) {
          return errorResponse('不能删除默认公司');
      }

      // 删除公司
      delete companies[companyId];

      // 保存到KV
      const saved = await saveCompaniesToKV(companies);
      if (!saved) {
          return errorResponse('删除公司数据失败', 500);
      }

      return jsonResponse({
          success: true,
          message: '公司删除成功',
          companyId,
          timestamp: new Date().toISOString()
      });

  } catch (error) {
      return errorResponse(`删除公司失败: ${error.message}`, 500);
  }
}

/**
* 验证管理密码
*/
async function handleVerifyPassword(request) {
  try {
      const body = await request.json();
      const { password } = body;
      
      if (!password) {
          return errorResponse('密码不能为空');
      }
      
      const isValid = password === ADMIN_PASSWORD;
      
      return jsonResponse({
          success: isValid,
          message: isValid ? '密码验证成功' : '密码错误',
          timestamp: new Date().toISOString()
      });
      
  } catch (error) {
      return errorResponse(`密码验证失败: ${error.message}`, 500);
  }
}

/**
* 导出数据
*/
async function handleExportData(request) {
  try {
      const url = new URL(request.url);
      const token = url.searchParams.get('token');
      
      if (!token || !token.startsWith('export-')) {
          return errorResponse('无效的导出令牌');
      }
      
      const password = token.replace('export-', '');
      if (password !== ADMIN_PASSWORD) {
          return errorResponse('导出权限验证失败');
      }
      
      // 获取所有数据
      const companies = await getCompaniesFromKV();
      
      const exportData = {
          companies,
          exportTime: new Date().toISOString(),
          version: '1.0',
          source: 'cloudflare-workers',
          kv_namespace: 'COMPANIES_KV'
      };
      
      return jsonResponse({
          success: true,
          message: '数据导出成功',
          data: exportData,
          timestamp: new Date().toISOString()
      });
      
  } catch (error) {
      return errorResponse(`数据导出失败: ${error.message}`, 500);
  }
}

/**
* 主要的请求处理器
*/
async function handleRequest(request) {
  const url = new URL(request.url);
  const method = request.method;
  const pathname = url.pathname;
  
  console.log(`${method} ${pathname}`);
  
  // 处理OPTIONS预检请求
  if (method === 'OPTIONS') {
      return handleOptions();
  }
  
  // API路由处理
  if (pathname.startsWith('/api/')) {
      try {
          // 健康检查
          if (pathname === '/api/health') {
              return await handleHealth();
          }
          
          // 公司管理
          if (pathname === '/api/companies') {
              if (method === 'GET') {
                  return await handleGetCompanies();
              } else if (method === 'POST') {
                  return await handleAddCompany(request);
              }
          }
          
          // 更新公司
          if (pathname.startsWith('/api/companies/') && method === 'PUT') {
              const companyId = pathname.split('/').pop();
              return await handleUpdateCompany(companyId, request);
          }

          // 删除公司
          if (pathname.startsWith('/api/companies/') && method === 'DELETE') {
              const companyId = pathname.split('/').pop();
              return await handleDeleteCompany(companyId);
          }
          
          // 密码验证
          if (pathname === '/api/verify-password' && method === 'POST') {
              return await handleVerifyPassword(request);
          }
          
          // 数据导出
          if (pathname === '/api/export' && method === 'GET') {
              return await handleExportData(request);
          }
          
          // 404 - API端点不存在
          return errorResponse(`API端点不存在: ${pathname}`, 404);
          
      } catch (error) {
          console.error('API处理错误:', error);
          return errorResponse(`服务器内部错误: ${error.message}`, 500);
      }
  }
  
  // 非API请求
  return new Response('Electronic Signature API - Cloudflare Workers (COMPANIES_KV)', {
      status: 200,
      headers: {
          'Content-Type': 'text/plain',
          ...CORS_HEADERS
      }
  });
}

// 事件监听器
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
