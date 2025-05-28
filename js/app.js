// 使用Cloudflare API管理公司数据
// cloudflareCompanyManager 在 cloudflare-api.js 中定义

// 表单元素
const companySelect = document.getElementById('companySelect');
const customCompanySection = document.getElementById('customCompanySection');
const customCompanyName = document.getElementById('customCompanyName');
const customCompanyAddress = document.getElementById('customCompanyAddress');
const contactName = document.getElementById('contactName');
const department = document.getElementById('department');
const tel = document.getElementById('tel');
const fax = document.getElementById('fax');
const mobile = document.getElementById('mobile');
const email = document.getElementById('email');
const imType1 = document.getElementById('imType1');
const imValue1 = document.getElementById('imValue1');
const imType2 = document.getElementById('imType2');
const imValue2 = document.getElementById('imValue2');
const previewArea = document.getElementById('previewArea');

// 按钮元素
const exportImage = document.getElementById('exportImage');
const copyImage = document.getElementById('copyImage');
const saveTemplate = document.getElementById('saveTemplate');

// 更新状态显示
function updateStatus() {
    // 显示/隐藏自定义公司输入框
    if (companySelect.value === 'default') {
        customCompanySection.classList.remove('hidden');
    } else {
        customCompanySection.classList.add('hidden');
    }

    updatePreview();
}

// 表单验证
function validateForm() {
    let isValid = true;

    // 验证公司
    if (!companySelect.value) {
        document.getElementById('company-error').classList.remove('hidden');
        isValid = false;
    } else {
        document.getElementById('company-error').classList.add('hidden');
    }

    // 如果选择了Default模板，验证自定义公司信息
    if (companySelect.value === 'default') {
        if (!customCompanyName.value.trim()) {
            document.getElementById('custom-company-name-error').classList.remove('hidden');
            isValid = false;
        } else {
            document.getElementById('custom-company-name-error').classList.add('hidden');
        }

        if (!customCompanyAddress.value.trim()) {
            document.getElementById('custom-company-address-error').classList.remove('hidden');
            isValid = false;
        } else {
            document.getElementById('custom-company-address-error').classList.add('hidden');
        }
    } else {
        // 隐藏自定义公司错误信息
        document.getElementById('custom-company-name-error').classList.add('hidden');
        document.getElementById('custom-company-address-error').classList.add('hidden');
    }

    // 验证姓名
    if (!contactName.value.trim()) {
        document.getElementById('name-error').classList.remove('hidden');
        isValid = false;
    } else {
        document.getElementById('name-error').classList.add('hidden');
    }

    // 验证部门
    if (!department.value.trim()) {
        document.getElementById('department-error').classList.remove('hidden');
        isValid = false;
    } else {
        document.getElementById('department-error').classList.add('hidden');
    }

    return isValid;
}

// 个人信息区域渲染函数 - 使用精确像素定位
function renderPersonalInfo(name, dept, company, scale = 1) {
    const baseX = 500 * scale; // 基础X位置
    const baseY = 10 * scale; // 基础Y位置

    return `
        <div style="position: absolute; left: ${baseX}px; top: ${baseY}px; color: white; z-index: 2; line-height: 1.2;">
            <div style="font-weight: bold; font-size: ${42 * scale}px; margin-bottom: ${8 * scale}px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${name}</div>
            <div style="font-size: ${34 * scale}px; margin-bottom: ${8 * scale}px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${dept}</div>
            <div style="font-weight: bold; font-size: ${38 * scale}px; margin-bottom: 0px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${company.name.split('(')[0].trim()}</div>
        </div>
    `;
}

// 联系信息区域渲染函数 - 使用两列对齐布局
function renderContactInfo(company, personalContacts, scale = 1) {
    const contactItems = [];
    const labelWidth = 80 * scale; // 标签列宽度
    const contentStartX = 90 * scale; // 内容列起始位置
    const maxContentWidth = Math.floor(45 / scale); // 内容列最大字符数

    // 创建两列对齐的项目函数
    function createAlignedItem(label, content) {
        const contentLines = wrapTextForHTML(content, maxContentWidth);
        let itemHTML = '';

        contentLines.forEach((line, index) => {
            if (index === 0) {
                // 第一行：显示标签和内容
                itemHTML += `
                    <div style="display: flex; margin-bottom: 0px; line-height: 1.4;">
                        <div style="width: ${labelWidth}px; text-align: left; padding-right: 10px; flex-shrink: 0;">
                            <strong>${label}:</strong>
                        </div>
                        <div style="flex: 1;">${line}</div>
                    </div>
                `;
            } else {
                // 续行：只显示内容，与第一行内容对齐
                itemHTML += `
                    <div style="display: flex; margin-bottom: 0px; line-height: 1.4;">
                        <div style="width: ${labelWidth}px; padding-right: 10px; flex-shrink: 0;"></div>
                        <div style="flex: 1;">${line}</div>
                    </div>
                `;
            }
        });

        return itemHTML;
    }

    // 添加公司地址（必显示）
    contactItems.push(createAlignedItem('Add', company.address));

    // 添加个人联系方式（只显示有值的）
    const telValue = personalContacts.find(c => c.label === 'Tel')?.value;
    if (telValue) {
        contactItems.push(createAlignedItem('Tel', telValue));
    }

    const faxValue = personalContacts.find(c => c.label === 'Fax')?.value;
    if (faxValue) {
        contactItems.push(createAlignedItem('Fax', faxValue));
    }

    const mobileValue = personalContacts.find(c => c.label === 'Mobile')?.value;
    if (mobileValue) {
        contactItems.push(createAlignedItem('Mobile', mobileValue));
    }

    const emailValue = personalContacts.find(c => c.label === 'E-mail')?.value;
    if (emailValue) {
        contactItems.push(createAlignedItem('E-mail', emailValue));
    }

    // 添加IM即时通讯（如果有值）
    const imContacts = personalContacts.filter(c => c.label === 'IM');
    imContacts.forEach(imContact => {
        contactItems.push(createAlignedItem(imContact.type, imContact.value));
    });

    // 添加固定的网站信息
    contactItems.push(createAlignedItem('Website', 'www.pgs-log.com'));
    contactItems.push(createAlignedItem('Group', 'www.francescoparisi.com'));

    const baseX = 500 * scale;
    const baseY = 180 * scale;

    return `
        <div style="position: absolute; left: ${baseX}px; top: ${baseY}px; color: #144E8C; font-size: ${28 * scale}px; z-index: 2;">
            ${contactItems.join('')}
        </div>
    `;
}

// HTML文本换行函数
function wrapTextForHTML(text, maxCharsPerLine) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) {
        lines.push(currentLine);
    }
    return lines;
}

// 办公地点信息区域渲染函数 - 使用精确像素定位
function renderOfficeInfo(scale = 1) {
    const baseX = 420 * scale;
    const baseY = 540 * scale;

    return `
        <div style="position: absolute; left: ${baseX}px; top: ${baseY}px; color: white; z-index: 2; white-space: nowrap;">
            <div style="font-size: ${20 * scale}px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">Office in China, India, Malaysia, Singapore, South Korea, Thailand, Vietnam, Japan, Indonesia</div>
        </div>
    `;
}

// 更新预览
function updatePreview() {
    const companies = cloudflareCompanyManager.getCompanies();
    let company = companies[companySelect.value];
    const name = contactName.value.trim();
    const dept = department.value.trim();

    // 如果是Default模板，使用自定义公司信息
    if (company && company.isDefault) {
        company = {
            ...company,
            name: customCompanyName.value.trim(),
            address: customCompanyAddress.value.trim()
        };
    }

    if (!company || !name || !dept || (company.isDefault && (!company.name || !company.address))) {
        previewArea.innerHTML = `
            <div class="text-center">
                <p class="text-lg mb-2">请完善表单信息</p>
                <p class="text-sm">选择公司并填写姓名、部门后即可预览签名</p>
            </div>
        `;
        previewArea.className = "signature-preview flex items-center justify-center min-h-64 text-gray-500 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg";
        return;
    }

    // 移除默认样式，准备显示签名
    previewArea.className = "signature-preview";

    // 获取个人联系方式（只显示用户填写的）
    const personalContacts = [];
    if (tel.value.trim()) personalContacts.push({ label: 'Tel', value: tel.value.trim() });
    if (fax.value.trim()) personalContacts.push({ label: 'Fax', value: fax.value.trim() });
    if (mobile.value.trim()) personalContacts.push({ label: 'Mobile', value: mobile.value.trim() });
    if (email.value.trim()) personalContacts.push({ label: 'E-mail', value: email.value.trim() });

    // 添加第一个IM
    if (imType1.value && imValue1.value.trim()) {
        personalContacts.push({
            label: 'IM',
            type: imType1.value,
            value: imValue1.value.trim()
        });
    }

    // 添加第二个IM
    if (imType2.value && imValue2.value.trim()) {
        personalContacts.push({
            label: 'IM',
            type: imType2.value,
            value: imValue2.value.trim()
        });
    }

    // 使用原图比例创建预览 - 确保与Canvas导出一致
    const originalWidth = 1600;
    const originalHeight = 580;
    const scale = 0.5; // 缩放比例，预览为原图的50%
    const containerWidth = originalWidth * scale; // 800px
    const containerHeight = originalHeight * scale; // 290px

    previewArea.innerHTML = `
        <div style="width: ${containerWidth}px; height: ${containerHeight}px; font-family: Arial, sans-serif; background-image: url('./images/back.png'); background-size: ${containerWidth}px ${containerHeight}px; background-position: 0 0; background-repeat: no-repeat; position: relative; overflow: hidden; border: 1px solid #ddd;">
            ${renderPersonalInfo(name, dept, company, scale)}
            ${renderContactInfo(company, personalContacts, scale)}
            ${renderOfficeInfo(scale)}
            <!-- 预览提示文字 -->
            <div style="position: absolute; bottom: 5px; left: 5px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; line-height: 1.2; z-index: 10;">
                <div style="margin-bottom: 2px;">预览尺寸非实际尺寸</div>
                <div>Preview size differs from actual output</div>
            </div>
            <div style="position: absolute; bottom: 5px; right: 5px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; line-height: 1.2; z-index: 10;">
                <div style="margin-bottom: 2px;">请下载或复制查看实际效果</div>
                <div>Download or copy to view actual results</div>
            </div>
        </div>
    `;
}

// 按钮功能
function enableButtons() {
    const isValid = validateForm();
    exportImage.disabled = !isValid;
    copyImage.disabled = !isValid;
    saveTemplate.disabled = !isValid;
}

// 文本换行函数 - 处理Canvas中的长文本
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

// 绘制多行文本
function drawMultilineText(ctx, text, x, y, maxWidth, lineHeight) {
    const lines = wrapText(ctx, text, maxWidth);
    let currentY = y;

    lines.forEach((line, index) => {
        ctx.fillText(line, x, currentY);
        currentY += lineHeight;
    });

    return currentY; // 返回下一行的Y位置
}

// 绘制两列对齐的联系信息项目
function drawAlignedContactItem(ctx, label, content, x, y, labelWidth, maxContentWidth, lineHeight) {
    const lines = wrapText(ctx, content, maxContentWidth);
    let currentY = y;

    lines.forEach((line, index) => {
        if (index === 0) {
            // 第一行：绘制标签和内容
            ctx.textAlign = 'left';
            ctx.fillText(label + ':', x, currentY);
            ctx.textAlign = 'left';
            ctx.fillText(line, x + labelWidth + 15, currentY);
        } else {
            // 续行：只绘制内容，与第一行内容对齐
            ctx.textAlign = 'left';
            ctx.fillText(line, x + labelWidth + 15, currentY);
        }
        currentY += lineHeight;
    });

    return currentY; // 返回下一行的Y位置
}

// 将签名转换为Canvas图片 - 使用原图尺寸确保精确定位
async function convertToImage() {
    const signatureElement = previewArea.querySelector('div[style*="background-image"]');
    if (!signatureElement) {
        alert('Please generate a signature first');
        return null;
    }

    try {
        // 创建canvas - 使用原图尺寸
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 使用背景图的原始尺寸
        canvas.width = 1600;
        canvas.height = 580;

        // 加载背景图片
        const bgImg = new Image();

        return new Promise((resolve, reject) => {
            bgImg.onload = function() {
                // 绘制背景图片（原尺寸）
                ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

                // 获取当前表单数据
                const companies = cloudflareCompanyManager.getCompanies();
                let company = companies[companySelect.value];
                if (company && company.isDefault) {
                    company = {
                        ...company,
                        name: customCompanyName.value.trim(),
                        address: customCompanyAddress.value.trim()
                    };
                }

                const name = contactName.value.trim();
                const dept = department.value.trim();

                // 根据您的截图精确定位 - 使用原图尺寸的像素位置
                // 个人信息区域（白色文字）
                ctx.fillStyle = 'white';
                ctx.font = 'bold 50px Arial'; // 原图尺寸需要更大字体
                ctx.fillText(name, 500, 50); // 调整Y位置

                ctx.font = '34px Arial';
                ctx.fillText(dept, 500, 100);

                ctx.font = 'bold 36px Arial';
                ctx.fillText(company.name.split('(')[0].trim(), 500, 155);

                // 联系信息区域（蓝色文字）- 使用两列对齐布局
                ctx.fillStyle = '#144E8C';
                ctx.font = '28px Arial';
                let yPos = 200;
                const lineHeight = 40; // 行高
                const labelWidth = 80; // 标签列宽度
                const maxContentWidth = 950; // 内容列最大宽度
                const startX = 500; // 起始X位置

                // 添加地址（支持自动换行）
                yPos = drawAlignedContactItem(ctx, 'Add', company.address, startX, yPos, labelWidth, maxContentWidth, lineHeight);

                // 添加联系方式
                if (tel.value.trim()) {
                    yPos = drawAlignedContactItem(ctx, 'Tel', tel.value.trim(), startX, yPos, labelWidth, maxContentWidth, lineHeight);
                }
                if (fax.value.trim()) {
                    yPos = drawAlignedContactItem(ctx, 'Fax', fax.value.trim(), startX, yPos, labelWidth, maxContentWidth, lineHeight);
                }
                if (mobile.value.trim()) {
                    yPos = drawAlignedContactItem(ctx, 'Mobile', mobile.value.trim(), startX, yPos, labelWidth, maxContentWidth, lineHeight);
                }
                if (email.value.trim()) {
                    yPos = drawAlignedContactItem(ctx, 'E-mail', email.value.trim(), startX, yPos, labelWidth, maxContentWidth, lineHeight);
                }

                // 添加IM信息
                if (imType1.value && imValue1.value.trim()) {
                    yPos = drawAlignedContactItem(ctx, imType1.value, imValue1.value.trim(), startX, yPos, labelWidth, maxContentWidth, lineHeight);
                }
                if (imType2.value && imValue2.value.trim()) {
                    yPos = drawAlignedContactItem(ctx, imType2.value, imValue2.value.trim(), startX, yPos, labelWidth, maxContentWidth, lineHeight);
                }

                // 添加网站信息
                yPos = drawAlignedContactItem(ctx, 'Website', 'www.pgs-log.com', startX, yPos, labelWidth, maxContentWidth, lineHeight);
                yPos = drawAlignedContactItem(ctx, 'Group', 'www.francescoparisi.com', startX, yPos, labelWidth, maxContentWidth, lineHeight);

                // 添加底部办公地点信息（白色文字）
                ctx.fillStyle = 'white';
                ctx.font = '25px Arial';
                ctx.fillText('Office in China, India, Malaysia, Singapore, South Korea, Thailand, Vietnam, Japan, Indonesia',
                           430, 565);

                resolve(canvas);
            };

            bgImg.onerror = function() {
                reject(new Error('Failed to load background image'));
            };

            // 使用相对路径
            bgImg.crossOrigin = 'anonymous';
            bgImg.src = './images/back.png';
        });
    } catch (error) {
        console.error('Error converting to image:', error);
        alert('Error generating image: ' + error.message);
        return null;
    }
}

// 初始化公司选择下拉框
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

// 导出图片
async function exportImageHandler() {
    if (!validateForm()) {
        alert('请完善表单信息');
        return;
    }

    try {
        const canvas = await convertToImage();
        if (canvas) {
            // 创建下载链接
            const link = document.createElement('a');
            link.download = `signature_${contactName.value.trim()}_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('导出失败：' + error.message);
    }
}

// 复制图片到剪贴板
async function copyImageHandler() {
    if (!validateForm()) {
        alert('请完善表单信息');
        return;
    }

    try {
        const canvas = await convertToImage();
        if (canvas) {
            canvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    alert('签名已复制到剪贴板！');
                } catch (error) {
                    console.error('Copy error:', error);
                    alert('复制失败，请使用导出功能');
                }
            }, 'image/png');
        }
    } catch (error) {
        console.error('Copy error:', error);
        alert('复制失败：' + error.message);
    }
}

// 保存模板
function saveTemplateHandler() {
    if (!validateForm()) {
        alert('请完善表单信息');
        return;
    }

    // 获取当前表单数据
    const templateData = {
        company: companySelect.value,
        customCompanyName: customCompanyName.value.trim(),
        customCompanyAddress: customCompanyAddress.value.trim(),
        contactName: contactName.value.trim(),
        department: department.value.trim(),
        tel: tel.value.trim(),
        fax: fax.value.trim(),
        mobile: mobile.value.trim(),
        email: email.value.trim(),
        imType1: imType1.value,
        imValue1: imValue1.value.trim(),
        imType2: imType2.value,
        imValue2: imValue2.value.trim()
    };

    // 保存到localStorage
    localStorage.setItem('signatureTemplate', JSON.stringify(templateData));
    alert('模板已保存！');
}

// 加载保存的模板
function loadSavedTemplate() {
    try {
        const savedTemplate = localStorage.getItem('signatureTemplate');
        if (savedTemplate) {
            const templateData = JSON.parse(savedTemplate);

            // 填充表单
            companySelect.value = templateData.company || '';
            customCompanyName.value = templateData.customCompanyName || '';
            customCompanyAddress.value = templateData.customCompanyAddress || '';
            contactName.value = templateData.contactName || '';
            department.value = templateData.department || '';
            tel.value = templateData.tel || '';
            fax.value = templateData.fax || '';
            mobile.value = templateData.mobile || '';
            email.value = templateData.email || '';
            imType1.value = templateData.imType1 || '';
            imValue1.value = templateData.imValue1 || '';
            imType2.value = templateData.imType2 || '';
            imValue2.value = templateData.imValue2 || '';

            updateStatus();
        }
    } catch (error) {
        console.error('Load template error:', error);
    }
}

// 公司管理相关函数
const companyModal = document.getElementById('companyModal');
const closeModal = document.getElementById('closeModal');
const manageCompanies = document.getElementById('manageCompanies');
const addCompany = document.getElementById('addCompany');
const companyList = document.getElementById('companyList');
const newCompanyDisplayName = document.getElementById('newCompanyDisplayName');
const newCompanyName = document.getElementById('newCompanyName');
const newCompanyAddress = document.getElementById('newCompanyAddress');

// 打开公司管理
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

// 渲染公司列表
function renderCompanyList() {
    companyList.innerHTML = '';
    const companies = cloudflareCompanyManager.getCompanies();

    Object.keys(companies).forEach(key => {
        const company = companies[key];
        const companyItem = document.createElement('div');
        companyItem.className = 'p-4 border border-gray-200 rounded-lg bg-gray-50';

        companyItem.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <h5 class="font-medium text-gray-900">${company.displayName}</h5>
                        ${company.isDefault ? '<span class="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">默认模板</span>' : '<span class="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">自定义</span>'}
                    </div>
                    <p class="text-sm text-gray-600 mb-1"><strong>公司:</strong> ${company.name || '(空)'}</p>
                    <p class="text-sm text-gray-600"><strong>地址:</strong> ${company.address || '(空)'}</p>
                </div>
                ${!company.isDefault ? `
                    <button onclick="deleteCompany('${key}')" class="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                        删除
                    </button>
                ` : ''}
            </div>
        `;

        companyList.appendChild(companyItem);
    });
}

// 添加新公司
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

// 删除公司
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

// 初始化应用
async function initializeApp() {
    try {
        // 加载公司数据
        await initializeCompanySelect();

        // 加载保存的模板
        loadSavedTemplate();

        // 初始状态更新
        updateStatus();
        enableButtons();

        console.log('应用初始化完成');
    } catch (error) {
        console.error('应用初始化失败:', error);
        alert('应用初始化失败，请刷新页面重试');
    }
}

// 事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 表单变化监听
    [companySelect, customCompanyName, customCompanyAddress, contactName, department, tel, fax, mobile, email, imType1, imValue1, imType2, imValue2].forEach(element => {
        element.addEventListener('input', function() {
            updateStatus();
            enableButtons();
        });
        element.addEventListener('change', function() {
            updateStatus();
            enableButtons();
        });
    });

    // 按钮事件
    exportImage.addEventListener('click', exportImageHandler);
    copyImage.addEventListener('click', copyImageHandler);
    saveTemplate.addEventListener('click', saveTemplateHandler);

    // 公司管理事件
    manageCompanies.addEventListener('click', openCompanyManagement);
    closeModal.addEventListener('click', () => companyModal.classList.add('hidden'));
    addCompany.addEventListener('click', addNewCompany);

    // 点击模态框背景关闭
    companyModal.addEventListener('click', function(e) {
        if (e.target === companyModal) {
            companyModal.classList.add('hidden');
        }
    });

    // 初始化应用
    initializeApp();
});
