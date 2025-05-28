/**
 * 电子签名生成器 - 纯前端版本
 * 使用localStorage存储数据，无需后端服务
 */

// DOM元素
const companySelect = document.getElementById('companySelect');
const nameInput = document.getElementById('name');
const departmentInput = document.getElementById('department');
const telInput = document.getElementById('tel');
const mobileInput = document.getElementById('mobile');
const emailInput = document.getElementById('email');
const faxInput = document.getElementById('fax');
const im1TypeSelect = document.getElementById('im1Type');
const im1ValueInput = document.getElementById('im1Value');
const im2TypeSelect = document.getElementById('im2Type');
const im2ValueInput = document.getElementById('im2Value');

const generateBtn = document.getElementById('generateBtn');
const exportBtn = document.getElementById('exportBtn');
const copyBtn = document.getElementById('copyBtn');
const signatureCanvas = document.getElementById('signatureCanvas');

// 公司管理相关元素
const manageCompaniesBtn = document.getElementById('manageCompanies');
const companyModal = document.getElementById('companyModal');
const closeModalBtn = document.getElementById('closeModal');
const addCompanyBtn = document.getElementById('addCompany');
const companyList = document.getElementById('companyList');
const newCompanyDisplayName = document.getElementById('newCompanyDisplayName');
const newCompanyName = document.getElementById('newCompanyName');
const newCompanyAddress = document.getElementById('newCompanyAddress');

// Canvas上下文
const ctx = signatureCanvas.getContext('2d');

// 签名配置
const SIGNATURE_CONFIG = {
    width: 1600,
    height: 580,
    backgroundColor: '#ffffff',
    blueColor: '#144E8C',
    whiteColor: '#ffffff',
    textColor: '#ffffff',
    darkTextColor: '#333333'
};

/**
 * 初始化应用
 */
function initializeApp() {
    // 设置Canvas尺寸
    signatureCanvas.width = SIGNATURE_CONFIG.width;
    signatureCanvas.height = SIGNATURE_CONFIG.height;

    // 初始化公司下拉框
    initializeCompanySelect();

    // 绑定事件
    bindEvents();

    // 初始预览
    updatePreview();

    console.log('纯前端版本初始化完成');
}

/**
 * 初始化公司选择下拉框
 */
async function initializeCompanySelect() {
    companySelect.innerHTML = '<option value="">请选择公司</option>';

    // 确保数据已加载
    if (!cloudflareCompanyManager.isDataLoaded()) {
        await cloudflareCompanyManager.loadCompanies();
    }

    const companies = cloudflareCompanyManager.getCompanies();

    Object.keys(companies).forEach(key => {
        const company = companies[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = company.displayName;
        companySelect.appendChild(option);
    });
}

/**
 * 绑定事件监听器
 */
function bindEvents() {
    // 表单变化时更新预览
    const formInputs = [companySelect, nameInput, departmentInput, telInput, mobileInput, emailInput, faxInput, im1TypeSelect, im1ValueInput, im2TypeSelect, im2ValueInput];
    formInputs.forEach(input => {
        input.addEventListener('change', updatePreview);
        input.addEventListener('input', updatePreview);
    });

    // 按钮事件
    generateBtn.addEventListener('click', updatePreview);
    exportBtn.addEventListener('click', exportSignature);
    copyBtn.addEventListener('click', copySignature);

    // 公司管理事件
    manageCompaniesBtn.addEventListener('click', openCompanyManagement);
    closeModalBtn.addEventListener('click', closeCompanyManagement);
    addCompanyBtn.addEventListener('click', addNewCompany);

    // 点击模态框外部关闭
    companyModal.addEventListener('click', (e) => {
        if (e.target === companyModal) {
            closeCompanyManagement();
        }
    });

    // 公司选择变化时填充信息
    companySelect.addEventListener('change', fillCompanyInfo);
}

/**
 * 填充公司信息
 */
function fillCompanyInfo() {
    const companies = cloudflareCompanyManager.getCompanies();
    const selectedCompany = companies[companySelect.value];

    if (selectedCompany && !selectedCompany.isDefault) {
        // 如果选择的不是默认模板，可以预填一些信息
        // 这里可以根据需要添加预填逻辑
    }

    updatePreview();
}

/**
 * 更新签名预览
 */
function updatePreview() {
    const companies = cloudflareCompanyManager.getCompanies();
    let company = companies[companySelect.value];

    // 如果没有选择公司或选择的是默认模板，使用表单中的信息
    if (!company || company.isDefault) {
        company = {
            name: '',
            address: '',
            tel: '',
            mobile: '',
            email: '',
            fax: '',
            showFax: false
        };
    }

    // 获取表单数据
    const formData = {
        name: nameInput.value.trim(),
        department: departmentInput.value.trim(),
        companyName: company.name,
        companyAddress: company.address,
        tel: telInput.value.trim() || company.tel,
        mobile: mobileInput.value.trim() || company.mobile,
        email: emailInput.value.trim() || company.email,
        fax: faxInput.value.trim() || company.fax,
        im1Type: im1TypeSelect.value,
        im1Value: im1ValueInput.value.trim(),
        im2Type: im2TypeSelect.value,
        im2Value: im2ValueInput.value.trim()
    };

    // 绘制签名
    drawSignature(formData);
}

/**
 * 绘制签名
 */
function drawSignature(data) {
    // 清空画布
    ctx.fillStyle = SIGNATURE_CONFIG.backgroundColor;
    ctx.fillRect(0, 0, SIGNATURE_CONFIG.width, SIGNATURE_CONFIG.height);

    // 加载背景图片
    const bgImage = new Image();
    bgImage.onload = function() {
        // 绘制背景
        ctx.drawImage(bgImage, 0, 0, SIGNATURE_CONFIG.width, SIGNATURE_CONFIG.height);

        // 绘制文本内容
        drawSignatureText(data);
    };
    bgImage.onerror = function() {
        // 如果背景图片加载失败，直接绘制文本
        drawSignatureText(data);
    };
    bgImage.src = './images/back.png';
}

/**
 * 绘制签名文本
 */
function drawSignatureText(data) {
    // 设置字体和颜色
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // 上部蓝色区域 - 个人信息
    const topY = 80;
    const leftX = 480; // 30% 位置

    // 姓名 (大字体，粗体)
    if (data.name) {
        ctx.fillStyle = SIGNATURE_CONFIG.textColor;
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.fillText(data.name, leftX, topY);
    }

    // 部门 (中等字体)
    if (data.department) {
        ctx.fillStyle = SIGNATURE_CONFIG.textColor;
        ctx.font = 'bold 32px Arial, sans-serif';
        ctx.fillText(data.department, leftX, topY + 60);
    }

    // 公司名称 (中等字体，粗体)
    if (data.companyName) {
        ctx.fillStyle = SIGNATURE_CONFIG.textColor;
        ctx.font = 'bold 32px Arial, sans-serif';
        ctx.fillText(data.companyName, leftX, topY + 100);
    }

    // 中部白色区域 - 联系信息
    const middleY = 280;
    let currentY = middleY;
    const lineHeight = 35;

    ctx.fillStyle = SIGNATURE_CONFIG.darkTextColor;
    ctx.font = '24px Arial, sans-serif';

    // 动态显示联系信息
    const contactInfo = [];

    if (data.tel) contactInfo.push(`Tel: ${data.tel}`);
    if (data.mobile) contactInfo.push(`Mobile: ${data.mobile}`);
    if (data.fax) contactInfo.push(`Fax: ${data.fax}`);
    if (data.email) contactInfo.push(`Email: ${data.email}`);
    if (data.im1Type && data.im1Value) contactInfo.push(`${data.im1Type}: ${data.im1Value}`);
    if (data.im2Type && data.im2Value) contactInfo.push(`${data.im2Type}: ${data.im2Value}`);

    // 绘制联系信息
    contactInfo.forEach(info => {
        ctx.fillText(info, leftX, currentY);
        currentY += lineHeight;
    });

    // 公司地址
    if (data.companyAddress) {
        currentY += 10; // 额外间距
        ctx.fillText(data.companyAddress, leftX, currentY);
    }

    // 底部蓝色区域 - 固定文本
    const bottomY = 520;
    ctx.fillStyle = SIGNATURE_CONFIG.textColor;
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText('Office In China', leftX, bottomY);
}

/**
 * 导出签名图片
 */
function exportSignature() {
    try {
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `signature_${new Date().toISOString().split('T')[0]}.png`;
        link.href = signatureCanvas.toDataURL('image/png');
        link.click();

        alert('签名图片导出成功！');
    } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败，请重试');
    }
}

/**
 * 复制签名图片
 */
async function copySignature() {
    try {
        // 将canvas转换为blob
        signatureCanvas.toBlob(async (blob) => {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                alert('签名图片已复制到剪贴板！');
            } catch (error) {
                console.error('复制失败:', error);
                alert('复制失败，请使用导出功能');
            }
        }, 'image/png');
    } catch (error) {
        console.error('复制失败:', error);
        alert('复制失败，请使用导出功能');
    }
}

/**
 * 打开公司管理
 */
async function openCompanyManagement() {
    const password = prompt('请输入管理密码:');

    try {
        const result = await cloudflareCompanyManager.verifyPassword(password);
        if (result.success) {
            renderCompanyList();
            companyModal.classList.remove('hidden');
        } else {
            alert('密码错误！');
        }
    } catch (error) {
        alert('验证失败：' + error.message);
    }
}

/**
 * 关闭公司管理
 */
function closeCompanyManagement() {
    companyModal.classList.add('hidden');
    // 清空表单
    newCompanyDisplayName.value = '';
    newCompanyName.value = '';
    newCompanyAddress.value = '';
}

/**
 * 渲染公司列表
 */
function renderCompanyList() {
    companyList.innerHTML = '';
    const companies = cloudflareCompanyManager.getCompanies();

    Object.keys(companies).forEach(key => {
        const company = companies[key];
        const companyItem = document.createElement('div');
        companyItem.className = 'p-4 border border-gray-200 rounded-lg';

        const isDefault = key === 'default';

        companyItem.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h5 class="font-medium text-gray-900">${company.displayName}</h5>
                    <p class="text-sm text-gray-700 mt-1"><strong>公司名称:</strong> ${company.name || '(空)'}</p>
                    <p class="text-sm text-gray-600 mt-1"><strong>地址:</strong> ${company.address || '(空)'}</p>
                </div>
                ${isDefault ? `
                    <span class="ml-4 px-3 py-1 bg-gray-300 text-gray-600 text-sm rounded">
                        默认模板
                    </span>
                ` : `
                    <button onclick="deleteCompany('${key}')" class="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                        删除
                    </button>
                `}
            </div>
        `;
        companyList.appendChild(companyItem);
    });
}

/**
 * 添加新公司
 */
async function addNewCompany() {
    const displayName = newCompanyDisplayName.value.trim();
    const name = newCompanyName.value.trim();
    const address = newCompanyAddress.value.trim();

    if (!displayName || !name || !address) {
        alert('请填写完整的公司信息（显示名称、公司名称、公司地址都是必填项）');
        return;
    }

    try {
        const result = await cloudflareCompanyManager.addCompany({
            displayName: displayName,
            name: name,
            address: address
        });

        if (result.success) {
            // 清空表单
            newCompanyDisplayName.value = '';
            newCompanyName.value = '';
            newCompanyAddress.value = '';

            // 更新界面
            await initializeCompanySelect();
            renderCompanyList();
            alert('公司添加成功！');
        } else {
            alert('添加失败：' + result.error);
        }
    } catch (error) {
        alert('添加失败：' + error.message);
    }
}

/**
 * 删除公司
 */
window.deleteCompany = async function(companyKey) {
    if (confirm('确定要删除这家公司吗？')) {
        try {
            const result = await cloudflareCompanyManager.deleteCompany(companyKey);

            if (result.success) {
                await initializeCompanySelect();
                renderCompanyList();
                updatePreview();
                alert('公司删除成功！');
            } else {
                alert('删除失败：' + result.error);
            }
        } catch (error) {
            alert('删除失败：' + error.message);
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeApp);
