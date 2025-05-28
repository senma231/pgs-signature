/**
 * 本地存储管理器 - 纯前端版本
 * 使用localStorage存储公司数据
 */

class LocalStorageManager {
    constructor() {
        this.storageKey = 'electronic_signature_companies';
        this.passwordKey = 'electronic_signature_password';
        this.correctPassword = 'Sz@pgsit';
        this.initializeDefaultData();
    }

    /**
     * 初始化默认数据
     */
    initializeDefaultData() {
        const existingData = this.getCompanies();
        if (Object.keys(existingData).length === 0) {
            const defaultData = {
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
            this.saveCompanies(defaultData);
        }
    }

    /**
     * 获取所有公司数据
     */
    getCompanies() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('获取公司数据失败:', error);
            return {};
        }
    }

    /**
     * 保存公司数据
     */
    saveCompanies(companies) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(companies));
            return true;
        } catch (error) {
            console.error('保存公司数据失败:', error);
            return false;
        }
    }

    /**
     * 添加新公司
     */
    addCompany(companyData) {
        try {
            // 验证必填字段
            if (!companyData.displayName || !companyData.name || !companyData.address) {
                throw new Error('显示名称、公司名称和地址都是必填项');
            }

            const companies = this.getCompanies();
            
            // 生成唯一ID
            const companyId = 'custom-' + Date.now();
            
            // 添加新公司
            companies[companyId] = {
                displayName: companyData.displayName.trim(),
                name: companyData.name.trim(),
                address: companyData.address.trim(),
                tel: companyData.tel?.trim() || '',
                mobile: companyData.mobile?.trim() || '',
                email: companyData.email?.trim() || '',
                fax: companyData.fax?.trim() || '',
                showFax: companyData.showFax || false,
                isDefault: false
            };

            // 保存数据
            if (this.saveCompanies(companies)) {
                return { success: true, id: companyId, message: '公司添加成功' };
            } else {
                throw new Error('保存失败');
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 删除公司
     */
    deleteCompany(companyId) {
        try {
            // 防止删除默认公司
            if (companyId === 'default') {
                throw new Error('不能删除默认模板');
            }

            const companies = this.getCompanies();
            
            if (!companies[companyId]) {
                throw new Error('公司不存在');
            }

            // 删除公司
            delete companies[companyId];

            // 保存数据
            if (this.saveCompanies(companies)) {
                return { success: true, message: '公司删除成功' };
            } else {
                throw new Error('保存失败');
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 验证管理密码
     */
    verifyPassword(password) {
        return password === this.correctPassword;
    }

    /**
     * 导出数据 (用于备份)
     */
    exportData() {
        const companies = this.getCompanies();
        const dataStr = JSON.stringify(companies, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `companies_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        return { success: true, message: '数据导出成功' };
    }

    /**
     * 导入数据 (用于恢复)
     */
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // 验证数据格式
                    if (typeof data !== 'object' || data === null) {
                        throw new Error('无效的数据格式');
                    }

                    // 保存导入的数据
                    if (this.saveCompanies(data)) {
                        resolve({ success: true, message: '数据导入成功' });
                    } else {
                        throw new Error('保存失败');
                    }
                } catch (error) {
                    reject({ success: false, error: error.message });
                }
            };
            reader.onerror = () => {
                reject({ success: false, error: '文件读取失败' });
            };
            reader.readAsText(file);
        });
    }

    /**
     * 清空所有数据
     */
    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            this.initializeDefaultData();
            return { success: true, message: '数据清空成功' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 获取存储使用情况
     */
    getStorageInfo() {
        try {
            const data = localStorage.getItem(this.storageKey);
            const dataSize = data ? new Blob([data]).size : 0;
            const companies = this.getCompanies();
            const companyCount = Object.keys(companies).length;

            return {
                success: true,
                info: {
                    companyCount: companyCount,
                    dataSize: dataSize,
                    dataSizeFormatted: this.formatBytes(dataSize),
                    lastModified: new Date().toLocaleString()
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 格式化字节大小
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 创建全局存储管理器实例
const storageManager = new LocalStorageManager();

// 导出到全局作用域
window.storageManager = storageManager;
