/**
 * Cloudflare Workers API客户端
 * 与Cloudflare Workers后端通信，实现数据持久化
 */

// API配置
const API_CONFIG = {
    // 根据部署环境自动检测API地址
    baseURL: (() => {
        console.log('🔍 开始检测API配置...');

        const hostname = window.location.hostname;
        console.log('🌐 当前域名:', hostname);

        // 检查是否有环境变量配置（通过meta标签或全局变量）
        const metaApiUrl = document.querySelector('meta[name="api-url"]')?.content;
        const globalApiUrl = window.CLOUDFLARE_API_URL;

        console.log('📋 配置检查结果:');
        console.log('  - Meta标签API地址:', metaApiUrl);
        console.log('  - 全局变量API地址:', globalApiUrl);

        const envApiUrl = metaApiUrl || globalApiUrl;

        if (envApiUrl) {
            console.log('✅ 使用配置的API地址:', envApiUrl);
            return envApiUrl;
        }

        // 本地开发环境
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            console.log('🔧 检测到本地开发环境');
            return 'http://localhost:8787/api'; // Wrangler dev server
        }

        // GitHub Pages环境
        if (hostname.includes('github.io')) {
            console.log('🔧 检测到GitHub Pages环境');
            console.warn('⚠️ 请配置正确的Workers API地址');
            return 'https://your-worker-name.your-subdomain.workers.dev/api';
        }

        // Cloudflare Pages环境
        if (hostname.includes('pages.dev')) {
            console.log('🔧 检测到Cloudflare Pages环境');
            console.warn('⚠️ 请配置正确的Workers API地址');
            return 'https://your-worker-name.your-subdomain.workers.dev/api';
        }

        // 自定义域名环境 - 这里需要配置
        console.log('⚠️ 检测到自定义域名环境，但未找到API配置！');
        console.log('❌ 请在HTML中添加meta标签配置API地址');
        console.log('💡 示例: <meta name="api-url" content="https://your-worker.workers.dev/api">');
        console.warn('🔄 将尝试使用相对路径，但可能会失败');
        return '/api';
    })(),

    timeout: 15000, // 15秒超时
    retries: 2      // 减少重试次数避免过多请求
};

class CloudflareApiClient {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.timeout = API_CONFIG.timeout;
        this.retries = API_CONFIG.retries;
    }

    /**
     * 发送HTTP请求
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: this.timeout,
            ...options
        };

        let lastError;

        // 重试机制
        for (let i = 0; i < this.retries; i++) {
            try {
                console.log(`🔗 API请求 [尝试 ${i + 1}/${this.retries}]:`, url);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    console.warn(`⏰ 请求超时，正在中止请求...`);
                    controller.abort();
                }, this.timeout);

                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal,
                    mode: 'cors', // 明确指定CORS模式
                    credentials: 'omit' // 不发送凭据
                });

                clearTimeout(timeoutId);

                console.log(`📡 响应状态:`, response.status, response.statusText);

                // 检查响应内容类型
                const contentType = response.headers.get('content-type');
                console.log(`📝 内容类型:`, contentType);

                if (!response.ok) {
                    const text = await response.text();
                    console.error(`❌ HTTP错误 ${response.status}:`, text.substring(0, 200));
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error(`❌ 响应不是JSON格式:`, text.substring(0, 200));
                    throw new Error(`API返回了非JSON响应: ${text.substring(0, 50)}...`);
                }

                const data = await response.json();
                console.log(`✅ API响应成功:`, data);
                return data;

            } catch (error) {
                lastError = error;

                // 特殊处理不同类型的错误
                if (error.name === 'AbortError') {
                    console.warn(`⏰ 请求超时 [尝试 ${i + 1}/${this.retries}]`);
                } else if (error.message.includes('CORS')) {
                    console.warn(`🚫 CORS错误 [尝试 ${i + 1}/${this.retries}]:`, error.message);
                } else if (error.message.includes('ERR_CONNECTION_TIMED_OUT')) {
                    console.warn(`🌐 网络连接超时 [尝试 ${i + 1}/${this.retries}]`);
                } else {
                    console.warn(`⚠️ API请求失败 [尝试 ${i + 1}/${this.retries}]:`, error.message);
                }

                // 如果不是最后一次尝试，等待后重试
                if (i < this.retries - 1) {
                    const delay = Math.min(2000 * (i + 1), 5000); // 最大5秒延迟
                    console.log(`⏳ 等待 ${delay}ms 后重试...`);
                    await this.delay(delay);
                }
            }
        }

        console.error(`❌ API请求最终失败:`, lastError);
        throw lastError;
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 健康检查
     */
    async healthCheck() {
        return await this.request('/health');
    }

    /**
     * 获取所有公司
     */
    async getCompanies() {
        const response = await this.request('/companies');
        return response.data;
    }

    /**
     * 添加新公司
     */
    async addCompany(companyData) {
        return await this.request('/companies', {
            method: 'POST',
            body: JSON.stringify(companyData)
        });
    }

    /**
     * 删除公司
     */
    async deleteCompany(companyId) {
        return await this.request(`/companies/${companyId}`, {
            method: 'DELETE'
        });
    }

    /**
     * 验证管理密码
     */
    async verifyPassword(password) {
        return await this.request('/verify-password', {
            method: 'POST',
            body: JSON.stringify({ password })
        });
    }

    /**
     * 导出数据
     */
    async exportData(password) {
        const token = 'export-' + password;
        return await this.request(`/export?token=${encodeURIComponent(token)}`);
    }
}

/**
 * Cloudflare公司管理器
 * 结合本地缓存和远程存储
 */
class CloudflareCompanyManager {
    constructor() {
        this.apiClient = new CloudflareApiClient();
        this.companies = {};
        this.isLoaded = false;
        this.isOnline = navigator.onLine;
        this.cacheKey = 'cloudflare_companies_cache';

        // 监听网络状态
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncWithServer();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    /**
     * 从服务器加载公司数据
     */
    async loadCompanies() {
        try {
            console.log('正在从Cloudflare Workers加载公司数据...');

            if (this.isOnline) {
                // 在线模式：从服务器获取
                try {
                    this.companies = await this.apiClient.getCompanies();

                    // 缓存到本地
                    this.saveToCache(this.companies);

                    console.log('公司数据加载成功:', Object.keys(this.companies).length, '家公司');
                    this.isLoaded = true;
                    return this.companies;

                } catch (apiError) {
                    console.warn('API请求失败，尝试降级处理:', apiError.message);

                    // 检查是否是CORS或网络问题
                    if (apiError.message.includes('CORS') ||
                        apiError.message.includes('ERR_CONNECTION_TIMED_OUT') ||
                        apiError.message.includes('AbortError')) {

                        console.log('检测到网络或CORS问题，使用本地缓存数据');
                        this.companies = this.loadFromCache();
                        this.isLoaded = true;

                        this.showNetworkError('网络连接问题，使用本地缓存数据。请检查网络连接或稍后重试。');
                        return this.companies;
                    }

                    throw apiError; // 重新抛出其他类型的错误
                }
            } else {
                // 离线模式：从缓存获取
                this.companies = this.loadFromCache();
                console.log('离线模式：使用缓存数据');
                this.isLoaded = true;
                return this.companies;
            }

        } catch (error) {
            console.error('加载公司数据失败:', error);

            // 最终降级到缓存数据
            this.companies = this.loadFromCache();
            this.isLoaded = true;

            // 显示错误提示
            this.showNetworkError('数据加载失败，使用本地缓存数据');

            return this.companies;
        }
    }

    /**
     * 添加新公司到服务器
     */
    async addCompany(companyData) {
        try {
            if (!this.isOnline) {
                throw new Error('网络连接不可用，无法添加公司');
            }

            const response = await this.apiClient.addCompany(companyData);

            // 重新加载数据
            await this.loadCompanies();

            return response;
        } catch (error) {
            console.error('添加公司失败:', error);
            throw error;
        }
    }

    /**
     * 从服务器删除公司
     */
    async deleteCompany(companyId) {
        try {
            if (!this.isOnline) {
                throw new Error('网络连接不可用，无法删除公司');
            }

            const response = await this.apiClient.deleteCompany(companyId);

            // 重新加载数据
            await this.loadCompanies();

            return response;
        } catch (error) {
            console.error('删除公司失败:', error);
            throw error;
        }
    }

    /**
     * 验证管理密码
     */
    async verifyPassword(password) {
        try {
            if (!this.isOnline) {
                // 离线模式：本地验证
                return { success: password === 'Sz@pgsit' };
            }

            return await this.apiClient.verifyPassword(password);
        } catch (error) {
            console.error('密码验证失败:', error);
            // 降级到本地验证
            return { success: password === 'Sz@pgsit' };
        }
    }

    /**
     * 获取所有公司数据
     */
    getCompanies() {
        return this.companies;
    }

    /**
     * 检查是否已加载数据
     */
    isDataLoaded() {
        return this.isLoaded;
    }

    /**
     * 检查网络状态
     */
    isNetworkOnline() {
        return this.isOnline;
    }

    /**
     * 与服务器同步
     */
    async syncWithServer() {
        if (this.isOnline && this.isLoaded) {
            try {
                await this.loadCompanies();
                console.log('数据同步成功');
            } catch (error) {
                console.error('数据同步失败:', error);
            }
        }
    }

    /**
     * 保存到本地缓存
     */
    saveToCache(data) {
        try {
            const cacheData = {
                companies: data,
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.error('保存缓存失败:', error);
        }
    }

    /**
     * 从本地缓存加载
     */
    loadFromCache() {
        try {
            const cacheData = localStorage.getItem(this.cacheKey);
            if (cacheData) {
                const parsed = JSON.parse(cacheData);
                return parsed.companies || this.getDefaultCompanies();
            }
        } catch (error) {
            console.error('加载缓存失败:', error);
        }

        return this.getDefaultCompanies();
    }

    /**
     * 获取默认公司数据
     */
    getDefaultCompanies() {
        return {
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
    }

    /**
     * 显示网络错误提示
     */
    showNetworkError(message) {
        // 创建提示元素
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * 导出数据
     */
    async exportData(password) {
        try {
            if (!this.isOnline) {
                // 离线模式：导出缓存数据
                const companies = this.getCompanies();
                const dataStr = JSON.stringify(companies, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });

                const link = document.createElement('a');
                link.href = URL.createObjectURL(dataBlob);
                link.download = `companies_cache_${new Date().toISOString().split('T')[0]}.json`;
                link.click();

                return { success: true, message: '缓存数据导出成功' };
            }

            return await this.apiClient.exportData(password);
        } catch (error) {
            console.error('导出数据失败:', error);
            throw error;
        }
    }
}

// 创建全局Cloudflare公司管理器实例
const cloudflareCompanyManager = new CloudflareCompanyManager();

// 导出到全局作用域
window.cloudflareCompanyManager = cloudflareCompanyManager;
window.CloudflareApiClient = CloudflareApiClient;
