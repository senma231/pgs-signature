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

// 动态行距计算函数
function calculateDynamicSpacing(totalItems, availableHeight = 365, baseLineHeight = 1.4) {
    // 联系信息区域可用高度：从Y=200到底部办公地点Y=565，减去边距
    // 可用高度约为 365px (565 - 200)

    if (totalItems <= 1) return baseLineHeight;

    // 设置间距范围：最小1.1，最大2.0（控制在2倍以内）
    const minSpacing = 1.1;
    const maxSpacing = 2.0;

    // 根据项目数量调整间距，确保所有项目都能显示
    let dynamicSpacing;
    if (totalItems <= 3) {
        // 项目少时，适度增加间距（最多到1.8倍）
        dynamicSpacing = Math.min(1.8, baseLineHeight + (4 - totalItems) * 0.15);
    } else if (totalItems <= 6) {
        // 中等项目数，使用标准间距
        dynamicSpacing = Math.max(1.3, baseLineHeight + (6 - totalItems) * 0.05);
    } else if (totalItems <= 8) {
        // 较多项目时，使用较小间距
        dynamicSpacing = Math.max(1.2, baseLineHeight - (totalItems - 6) * 0.05);
    } else {
        // 项目很多时（9+），使用最小间距确保都能显示
        dynamicSpacing = Math.max(minSpacing, 1.15 - (totalItems - 8) * 0.02);
    }

    return Math.max(minSpacing, Math.min(maxSpacing, dynamicSpacing));
}

// 联系信息区域渲染函数 - 使用动态行距的两列对齐布局
function renderContactInfo(company, personalContacts, scale = 1) {
    const contactItems = [];
    const labelWidth = 140 * scale; // 标签列宽度（增加到140以容纳E-mail等较长标签）
    const contentStartX = 160 * scale; // 内容列起始位置
    const maxContentWidth = Math.floor(90 / scale); // 内容列最大字符数（增加以匹配Canvas效果）

    // 收集所有要显示的联系信息项目
    const allContactItems = [];

    // 添加公司地址（必显示）
    allContactItems.push({ label: 'Add', content: company.address });

    // 添加个人联系方式（只显示有值的）
    const telValue = personalContacts.find(c => c.label === 'Tel')?.value;
    if (telValue) {
        allContactItems.push({ label: 'Tel', content: telValue });
    }

    const faxValue = personalContacts.find(c => c.label === 'Fax')?.value;
    if (faxValue) {
        allContactItems.push({ label: 'Fax', content: faxValue });
    }

    const mobileValue = personalContacts.find(c => c.label === 'Mobile')?.value;
    if (mobileValue) {
        allContactItems.push({ label: 'Mobile', content: mobileValue });
    }

    const emailValue = personalContacts.find(c => c.label === 'E-mail')?.value;
    if (emailValue) {
        allContactItems.push({ label: 'E-mail', content: emailValue });
    }

    // 添加IM即时通讯（如果有值）
    const imContacts = personalContacts.filter(c => c.label === 'IM');
    imContacts.forEach(imContact => {
        allContactItems.push({ label: imContact.type, content: imContact.value });
    });

    // 添加固定的网站信息
    allContactItems.push({ label: 'Website', content: 'www.pgs-log.com' });
    allContactItems.push({ label: 'Group', content: 'www.francescoparisi.com' });

    // 计算动态行距
    const dynamicLineHeight = calculateDynamicSpacing(allContactItems.length);

    // 创建两列对齐的项目函数（使用动态行距）
    function createAlignedItem(label, content, isLast = false) {
        const contentLines = wrapTextForHTML(content, maxContentWidth);
        let itemHTML = '';

        // 计算项目间距（最后一项不需要额外间距）- 与Canvas保持一致
        let itemMarginBottom = isLast ? 0 : Math.max(5, (dynamicLineHeight - 1.4) * 15);

        // 如果项目很多，进一步减少间距
        if (allContactItems.length >= 9) {
            itemMarginBottom = isLast ? 0 : Math.max(3, itemMarginBottom * 0.7);
        }

        contentLines.forEach((line, index) => {
            const lineMarginBottom = (index === contentLines.length - 1 && isLast) ? 0 : 0;

            if (index === 0) {
                // 第一行：显示标签和内容，都靠左对齐
                itemHTML += `
                    <div style="display: flex; margin-bottom: ${lineMarginBottom}px; line-height: ${dynamicLineHeight};">
                        <div style="width: ${labelWidth}px; text-align: left; padding-right: 25px; flex-shrink: 0;">
                            <strong>${label}:</strong>
                        </div>
                        <div style="flex: 1; text-align: left;">${line}</div>
                    </div>
                `;
            } else {
                // 续行：只显示内容，与第一行内容对齐，内容靠左对齐
                itemHTML += `
                    <div style="display: flex; margin-bottom: ${lineMarginBottom}px; line-height: ${dynamicLineHeight};">
                        <div style="width: ${labelWidth}px; padding-right: 25px; flex-shrink: 0;"></div>
                        <div style="flex: 1; text-align: left;">${line}</div>
                    </div>
                `;
            }
        });

        // 添加项目间距
        if (!isLast && itemMarginBottom > 0) {
            itemHTML += `<div style="height: ${itemMarginBottom}px;"></div>`;
        }

        return itemHTML;
    }

    // 生成所有联系信息项目
    allContactItems.forEach((item, index) => {
        const isLast = index === allContactItems.length - 1;
        contactItems.push(createAlignedItem(item.label, item.content, isLast));
    });

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

// 获取背景图片路径
function getBackgroundImage(isPreview = true) {
    if (window.BACKGROUND_CONFIG) {
        return isPreview ? window.BACKGROUND_CONFIG.preview : window.BACKGROUND_CONFIG.export;
    }
    // 默认使用back.png
    return 'public/back.png';
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
        // 显示提示信息
        previewArea.innerHTML = `
            <div class="text-center">
                <p class="text-lg mb-2">请完善表单信息</p>
                <p class="text-sm">选择公司并填写姓名、部门后即可预览签名</p>
            </div>
        `;
        previewArea.className = "signature-preview flex items-center justify-center text-gray-500 bg-gray-50";
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

    // 使用back.png作为背景图片
    const backgroundImage = getBackgroundImage(false);

    // 实际尺寸预览 (100%) - 使用back.png
    const originalWidth = 1600;
    const originalHeight = 580;
    const actualScale = 1.0;

    previewArea.innerHTML = `
        <div style="width: ${originalWidth}px; height: ${originalHeight}px; font-family: Arial, sans-serif; background-image: url('${backgroundImage}'); background-size: ${originalWidth}px ${originalHeight}px; background-position: 0 0; background-repeat: no-repeat; position: relative; overflow: hidden; border: 1px solid #ddd;">
            ${renderPersonalInfo(name, dept, company, actualScale)}
            ${renderContactInfo(company, personalContacts, actualScale)}
            ${renderOfficeInfo(actualScale)}
            <!-- 实际尺寸标识 -->
            <div style="position: absolute; bottom: 5px; left: 5px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; line-height: 1.2; z-index: 10;">
                <div style="margin-bottom: 2px;">实际输出尺寸</div>
                <div>Actual Output Size</div>
            </div>
        </div>
    `;
}

// 按钮功能
function enableButtons() {
    const isValid = validateForm();
    exportImage.disabled = !isValid;
    copyImage.disabled = !isValid;
}

// 文本换行函数 - 处理Canvas中的长文本，优化换行逻辑
function wrapText(ctx, text, maxWidth) {
    // 如果文本很短，直接返回
    if (ctx.measureText(text).width <= maxWidth) {
        return [text];
    }

    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + ' ' + word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth <= maxWidth) {
            currentLine = testLine;
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

// 绘制两列对齐的联系信息项目（支持动态行距）
function drawAlignedContactItem(ctx, label, content, x, y, labelWidth, maxContentWidth, lineHeight, itemSpacing = 0) {
    const lines = wrapText(ctx, content, maxContentWidth);
    let currentY = y;

    lines.forEach((line, index) => {
        if (index === 0) {
            // 第一行：绘制标签和内容
            ctx.textAlign = 'left';
            ctx.fillText(label + ':', x, currentY);
            ctx.textAlign = 'left';
            ctx.fillText(line, x + labelWidth + 25, currentY); // 增加间距从15到25
        } else {
            // 续行：只绘制内容，与第一行内容对齐
            ctx.textAlign = 'left';
            ctx.fillText(line, x + labelWidth + 25, currentY); // 增加间距从15到25
        }
        currentY += lineHeight;
    });

    // 添加项目间距
    currentY += itemSpacing;

    return currentY; // 返回下一行的Y位置
}

// Canvas动态行距渲染函数
function renderContactInfoWithDynamicSpacing(ctx, company, personalContacts, startX, startY, labelWidth, maxContentWidth, baseLineHeight) {
    // 收集所有要显示的联系信息项目
    const allContactItems = [];

    // 添加公司地址（必显示）
    allContactItems.push({ label: 'Add', content: company.address });

    // 添加个人联系方式（只显示有值的）
    if (tel.value.trim()) {
        allContactItems.push({ label: 'Tel', content: tel.value.trim() });
    }
    if (fax.value.trim()) {
        allContactItems.push({ label: 'Fax', content: fax.value.trim() });
    }
    if (mobile.value.trim()) {
        allContactItems.push({ label: 'Mobile', content: mobile.value.trim() });
    }
    if (email.value.trim()) {
        allContactItems.push({ label: 'E-mail', content: email.value.trim() });
    }

    // 添加IM信息
    if (imType1.value && imValue1.value.trim()) {
        allContactItems.push({ label: imType1.value, content: imValue1.value.trim() });
    }
    if (imType2.value && imValue2.value.trim()) {
        allContactItems.push({ label: imType2.value, content: imValue2.value.trim() });
    }

    // 添加固定的网站信息
    allContactItems.push({ label: 'Website', content: 'www.pgs-log.com' });
    allContactItems.push({ label: 'Group', content: 'www.francescoparisi.com' });

    // 计算动态行距和项目间距 - 修复：与HTML预览保持一致
    const dynamicLineHeightRatio = calculateDynamicSpacing(allContactItems.length, 365); // 传入可用高度
    // 修复：直接使用比例计算像素行距，而不是乘以baseLineHeight
    const dynamicLineHeight = 28 * dynamicLineHeightRatio; // 28px是字体大小，与HTML预览一致

    // 计算项目间距：根据动态行距调整，与HTML预览保持一致，但确保不会超出可用空间
    let dynamicItemSpacing = Math.max(5, (dynamicLineHeightRatio - 1.4) * 15); // 减少间距倍数

    // 如果项目很多，进一步减少间距
    if (allContactItems.length >= 9) {
        dynamicItemSpacing = Math.max(3, dynamicItemSpacing * 0.7);
    }

    let yPos = startY;

    // 渲染所有联系信息项目
    allContactItems.forEach((item, index) => {
        const isLast = index === allContactItems.length - 1;
        const itemSpacing = isLast ? 0 : dynamicItemSpacing;

        yPos = drawAlignedContactItem(
            ctx,
            item.label,
            item.content,
            startX,
            yPos,
            labelWidth,
            maxContentWidth,
            dynamicLineHeight,
            itemSpacing
        );
    });

    return yPos;
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

                // 联系信息区域（蓝色文字）- 使用动态行距的两列对齐布局
                ctx.fillStyle = '#144E8C';
                ctx.font = '28px Arial';
                const startY = 200;
                const baseLineHeight = 40; // 基础行高
                const labelWidth = 140; // 标签列宽度（与HTML预览保持一致）
                const maxContentWidth = 950; // 内容列最大宽度（大幅增加以匹配HTML预览的饱满效果）
                const startX = 500; // 起始X位置

                // 使用动态行距渲染联系信息
                const finalYPos = renderContactInfoWithDynamicSpacing(
                    ctx,
                    company,
                    [], // personalContacts参数（函数内部会直接读取表单元素）
                    startX,
                    startY,
                    labelWidth,
                    maxContentWidth,
                    baseLineHeight
                );

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

            // 使用导出背景图片
            bgImg.crossOrigin = 'anonymous';
            bgImg.src = getBackgroundImage(false); // false表示导出模式
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

// 复制图片到剪贴板（增强兼容性版本）
async function copyImageHandler() {
    if (!validateForm()) {
        alert('请完善表单信息');
        return;
    }

    try {
        const canvas = await convertToImage();
        if (!canvas) {
            alert('生成图片失败，请重试');
            return;
        }

        // 检查浏览器是否支持剪贴板API
        if (!navigator.clipboard || !navigator.clipboard.write) {
            alert('您的浏览器不支持复制图片功能，请使用导出功能');
            return;
        }

        // 检查是否在HTTPS环境或localhost
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            alert('复制图片功能需要HTTPS环境，请使用导出功能');
            return;
        }

        // 首先尝试PNG格式（兼容性更好）
        canvas.toBlob(async (pngBlob) => {
            if (!pngBlob) {
                alert('图片转换失败，请重试');
                return;
            }

            try {
                // 尝试PNG格式复制（兼容性最好）
                const clipboardItem = new ClipboardItem({
                    'image/png': pngBlob
                });

                await navigator.clipboard.write([clipboardItem]);
                alert('签名已复制到剪贴板（PNG格式）！');

            } catch (pngError) {
                console.error('PNG clipboard write error:', pngError);

                // PNG失败，尝试JPG格式
                canvas.toBlob(async (jpgBlob) => {
                    if (!jpgBlob) {
                        // PNG和JPG都失败，直接下载
                        downloadFallback(canvas);
                        return;
                    }

                    try {
                        const jpgClipboardItem = new ClipboardItem({
                            'image/jpeg': jpgBlob
                        });

                        await navigator.clipboard.write([jpgClipboardItem]);
                        alert('签名已复制到剪贴板（JPG格式）！');

                    } catch (jpgError) {
                        console.error('JPG clipboard write error:', jpgError);
                        // 所有格式都失败，使用下载备用方案
                        downloadFallback(canvas);
                    }
                }, 'image/jpeg', 0.9);
            }
        }, 'image/png');

    } catch (error) {
        console.error('Copy error:', error);
        alert('复制失败：' + error.message + '，请使用导出功能');
    }
}

// 下载备用方案
function downloadFallback(canvas) {
    try {
        const link = document.createElement('a');
        link.download = `signature_${contactName.value.trim()}_${new Date().toISOString().split('T')[0]}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        alert('复制到剪贴板失败，已自动下载图片文件');
    } catch (downloadError) {
        console.error('Download fallback error:', downloadError);
        alert('复制和下载都失败，请使用导出功能');
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
