// 使用Cloudflare API管理公司数据
// cloudflareCompanyManager 在 cloudflare-api.js 中定义

// 表单元素
const companySelect = document.getElementById('companySelect');
const customCompanySection = document.getElementById('customCompanySection');
const customCompanyName = document.getElementById('customCompanyName');
const customCompanyAddress = document.getElementById('customCompanyAddress');
const contactName = document.getElementById('contactName');
const contactNameLabel = document.getElementById('contactNameLabel');
const publicMailboxMode = document.getElementById('publicMailboxMode');
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
const previewViewport = document.getElementById('previewViewport');

// 按钮元素
const exportImage = document.getElementById('exportImage');
const copyImage = document.getElementById('copyImage');

const SIGNATURE_WIDTH = 1800;
const SIGNATURE_HEIGHT = 580;
const CONTACT_START_X = 500;
const CONTACT_LABEL_WIDTH = 140;
const CONTACT_LABEL_GAP = 25;
const CONTACT_RIGHT_PADDING = 50;
const CONTACT_CONTENT_MAX_WIDTH = SIGNATURE_WIDTH - CONTACT_START_X - CONTACT_LABEL_WIDTH - CONTACT_LABEL_GAP - CONTACT_RIGHT_PADDING;
const OFFICE_TEXT = 'Office in China, India, Malaysia, Singapore, South Korea, Thailand, Vietnam, Japan, Indonesia, Philippines';
const OFFICE_START_X = 430;
const OFFICE_Y = 565;
const OFFICE_RIGHT_PADDING = 35;
const OFFICE_MAX_WIDTH = SIGNATURE_WIDTH - OFFICE_START_X - OFFICE_RIGHT_PADDING;

// 更新状态显示
function updateStatus() {
    updateContactNameMode();

    // 显示/隐藏自定义公司输入框
    if (companySelect.value === 'default') {
        customCompanySection.classList.remove('hidden');
    } else {
        customCompanySection.classList.add('hidden');
    }

    updatePreview();
}

function isPublicMailboxMode() {
    return Boolean(publicMailboxMode && publicMailboxMode.checked);
}

function updateContactNameMode() {
    if (!contactName || !contactNameLabel) {
        return;
    }

    if (isPublicMailboxMode()) {
        contactName.disabled = true;
        contactName.classList.add('bg-gray-100', 'text-gray-500');
        contactNameLabel.classList.remove('required-field');
        document.getElementById('name-error').classList.add('hidden');
    } else {
        contactName.disabled = false;
        contactName.classList.remove('bg-gray-100', 'text-gray-500');
        contactNameLabel.classList.add('required-field');
    }
}

function getPreviewScale() {
    if (!previewViewport) {
        return 1;
    }

    const viewportWidth = Math.max(previewViewport.clientWidth - 16, 0);
    if (!viewportWidth) {
        return 1;
    }

    return Math.min(1, viewportWidth / SIGNATURE_WIDTH);
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
    if (!isPublicMailboxMode() && !contactName.value.trim()) {
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
    const hasName = Boolean(name);
    const baseY = (hasName ? 10 : 45) * scale; // 基础Y位置
    const nameLine = hasName
        ? `<div style="font-weight: bold; font-size: ${42 * scale}px; margin-bottom: ${8 * scale}px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${name}</div>`
        : '';

    return `
        <div style="position: absolute; left: ${baseX}px; top: ${baseY}px; color: white; z-index: 2; line-height: 1.2;">
            ${nameLine}
            <div style="font-size: ${34 * scale}px; margin-bottom: ${8 * scale}px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${dept}</div>
            <div style="font-weight: bold; font-size: ${38 * scale}px; margin-bottom: 0px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${company.name}</div>
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
    const labelWidth = CONTACT_LABEL_WIDTH * scale; // 标签列宽度（增加到140以容纳E-mail等较长标签）
    const labelGap = CONTACT_LABEL_GAP * scale;
    const maxContentPixelWidth = CONTACT_CONTENT_MAX_WIDTH * scale;

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

    // 添加网站信息（支持自定义）
    const websiteUrl = (company.customWebsite && company.website) ? company.website : 'www.pgs-log.com';
    const groupUrl = (company.customWebsite && company.groupWebsite) ? company.groupWebsite : 'www.francescoparisi.com';

    allContactItems.push({ label: 'Website', content: websiteUrl });
    allContactItems.push({ label: 'Group', content: groupUrl });

    // 计算动态行距
    const dynamicLineHeight = calculateDynamicSpacing(allContactItems.length);

    // 创建两列对齐的项目函数（使用动态行距）
    function createAlignedItem(label, content, isLast = false) {
        const contentLines = wrapTextForHTML(content, maxContentPixelWidth, `${28 * scale}px Arial`);
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
                        <div style="width: ${labelWidth}px; text-align: left; padding-right: ${labelGap}px; flex-shrink: 0;">
                            <strong>${label}:</strong>
                        </div>
                        <div style="width: ${maxContentPixelWidth}px; flex: 0 0 ${maxContentPixelWidth}px; text-align: left; overflow-wrap: anywhere; word-break: break-word;">${escapeHTML(line)}</div>
                    </div>
                `;
            } else {
                // 续行：只显示内容，与第一行内容对齐，内容靠左对齐
                itemHTML += `
                    <div style="display: flex; margin-bottom: ${lineMarginBottom}px; line-height: ${dynamicLineHeight};">
                        <div style="width: ${labelWidth}px; padding-right: ${labelGap}px; flex-shrink: 0;"></div>
                        <div style="width: ${maxContentPixelWidth}px; flex: 0 0 ${maxContentPixelWidth}px; text-align: left; overflow-wrap: anywhere; word-break: break-word;">${escapeHTML(line)}</div>
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

    const baseX = CONTACT_START_X * scale;
    const baseY = 180 * scale;

    return `
        <div style="position: absolute; left: ${baseX}px; top: ${baseY}px; width: ${(CONTACT_LABEL_WIDTH + CONTACT_LABEL_GAP + CONTACT_CONTENT_MAX_WIDTH) * scale}px; color: #144E8C; font-size: ${28 * scale}px; z-index: 2;">
            ${contactItems.join('')}
        </div>
    `;
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getTextMeasureContext(font = '28px Arial') {
    if (!getTextMeasureContext.canvas) {
        getTextMeasureContext.canvas = document.createElement('canvas');
    }

    const ctx = getTextMeasureContext.canvas.getContext('2d');
    ctx.font = font;
    return ctx;
}

// HTML预览也使用像素测量，避免和导出/复制的Canvas换行不一致。
function wrapTextForHTML(text, maxWidth, font = '28px Arial') {
    return wrapText(getTextMeasureContext(font), text, maxWidth);
}

// 办公地点信息区域渲染函数 - 使用精确像素定位
function renderOfficeInfo(scale = 1) {
    const baseX = OFFICE_START_X * scale;
    const baseY = 540 * scale;
    const maxWidth = OFFICE_MAX_WIDTH * scale;

    return `
        <div style="position: absolute; left: ${baseX}px; top: ${baseY}px; width: ${maxWidth}px; color: white; z-index: 2; white-space: nowrap;">
            <div style="font-size: ${19 * scale}px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${OFFICE_TEXT}</div>
        </div>
    `;
}

// 获取背景图片路径
function getBackgroundImage(isPreview = true) {
    if (window.BACKGROUND_CONFIG) {
        return isPreview ? window.BACKGROUND_CONFIG.preview : window.BACKGROUND_CONFIG.export;
    }
    // 默认使用back.png - 修复路径
    return 'images/back.png';
}

// 更新预览
function updatePreview() {
    const companies = cloudflareCompanyManager.getCompanies();
    let company = companies[companySelect.value];
    const name = isPublicMailboxMode() ? '' : contactName.value.trim();
    const dept = department.value.trim();

    // 如果是Default模板，使用自定义公司信息
    if (company && company.isDefault) {
        company = {
            ...company,
            name: customCompanyName.value.trim(),
            address: customCompanyAddress.value.trim()
        };
    }

    if (!company || (!isPublicMailboxMode() && !name) || !dept || (company.isDefault && (!company.name || !company.address))) {
        // 显示提示信息
        previewArea.style.width = '100%';
        previewArea.style.height = '';
        previewArea.style.minHeight = '200px';
        previewArea.innerHTML = `
            <div class="text-center">
                <p class="text-lg mb-2">请完善表单信息 / Please complete the form</p>
                <p class="text-sm">选择公司并填写必填信息后即可预览签名 / Select company and fill in required information to preview signature</p>
            </div>
        `;
        previewArea.className = "signature-preview flex items-center justify-center text-gray-500 bg-gray-50";
        return;
    }

    // 移除默认样式，准备显示签名
    previewArea.className = "signature-preview";
    previewArea.style.minHeight = '0';

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

    // 预览按容器等比缩放，内部布局仍保持实际输出尺寸
    const previewScale = getPreviewScale();
    const previewWidth = SIGNATURE_WIDTH * previewScale;
    const previewHeight = SIGNATURE_HEIGHT * previewScale;
    const actualScale = 1.0;

    previewArea.style.width = `${previewWidth}px`;
    previewArea.style.height = `${previewHeight}px`;

    previewArea.innerHTML = `
        <div style="width: ${SIGNATURE_WIDTH}px; height: ${SIGNATURE_HEIGHT}px; font-family: Arial, sans-serif; background-image: url('${backgroundImage}'); background-size: ${SIGNATURE_WIDTH}px ${SIGNATURE_HEIGHT}px; background-position: 0 0; background-repeat: no-repeat; position: relative; overflow: hidden; border: 1px solid #ddd; transform: scale(${previewScale}); transform-origin: top left;">
            ${renderPersonalInfo(name, dept, company, actualScale)}
            ${renderContactInfo(company, personalContacts, actualScale)}
            ${renderOfficeInfo(actualScale)}
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

    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';

    function splitLongWord(word) {
        const chunks = [];
        let chunk = '';

        for (const char of word) {
            const testChunk = chunk + char;
            if (ctx.measureText(testChunk).width <= maxWidth) {
                chunk = testChunk;
            } else {
                if (chunk) {
                    chunks.push(chunk);
                }
                chunk = char;
            }
        }

        if (chunk) {
            chunks.push(chunk);
        }

        return chunks;
    }

    words.forEach(word => {
        if (!word) {
            return;
        }

        if (ctx.measureText(word).width > maxWidth) {
            if (currentLine) {
                lines.push(currentLine);
                currentLine = '';
            }
            lines.push(...splitLongWord(word));
            return;
        }

        const testLine = currentLine ? currentLine + ' ' + word : word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth <= maxWidth) {
            currentLine = testLine;
        } else {
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

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
            ctx.fillText(line, x + labelWidth + CONTACT_LABEL_GAP, currentY); // 增加间距从15到25
        } else {
            // 续行：只绘制内容，与第一行内容对齐
            ctx.textAlign = 'left';
            ctx.fillText(line, x + labelWidth + CONTACT_LABEL_GAP, currentY); // 增加间距从15到25
        }
        currentY += lineHeight;
    });

    // 添加项目间距
    currentY += itemSpacing;

    return currentY; // 返回下一行的Y位置
}

function drawFittedText(ctx, text, x, y, maxWidth, maxFontSize, minFontSize, fontFamily = 'Arial') {
    let fontSize = maxFontSize;
    ctx.font = `${fontSize}px ${fontFamily}`;

    while (fontSize > minFontSize && ctx.measureText(text).width > maxWidth) {
        fontSize -= 1;
        ctx.font = `${fontSize}px ${fontFamily}`;
    }

    ctx.fillText(text, x, y);
    return fontSize;
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

    // 添加网站信息（支持自定义）
    const websiteUrl = (company.customWebsite && company.website) ? company.website : 'www.pgs-log.com';
    const groupUrl = (company.customWebsite && company.groupWebsite) ? company.groupWebsite : 'www.francescoparisi.com';

    allContactItems.push({ label: 'Website', content: websiteUrl });
    allContactItems.push({ label: 'Group', content: groupUrl });

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
        alert('请先生成签名 / Please generate a signature first');
        return null;
    }

    try {
        // 创建canvas - 使用原图尺寸
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 使用背景图的原始尺寸
        canvas.width = SIGNATURE_WIDTH;
        canvas.height = SIGNATURE_HEIGHT;

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

                const name = isPublicMailboxMode() ? '' : contactName.value.trim();
                const dept = department.value.trim();

                // 根据您的截图精确定位 - 使用原图尺寸的像素位置
                // 个人信息区域（白色文字）
                ctx.fillStyle = 'white';
                let deptY = 100;
                let companyY = 155;

                if (name) {
                    ctx.font = 'bold 50px Arial'; // 原图尺寸需要更大字体
                    ctx.fillText(name, 500, 50); // 调整Y位置
                } else {
                    deptY = 70;
                    companyY = 125;
                }

                ctx.font = '34px Arial';
                ctx.fillText(dept, 500, deptY);

                ctx.font = 'bold 36px Arial';
                ctx.fillText(company.name, 500, companyY);

                // 联系信息区域（蓝色文字）- 使用动态行距的两列对齐布局
                ctx.fillStyle = '#144E8C';
                ctx.font = '28px Arial';
                const startY = 200;
                const baseLineHeight = 40; // 基础行高
                const labelWidth = CONTACT_LABEL_WIDTH; // 标签列宽度（与HTML预览保持一致）
                const maxContentWidth = CONTACT_CONTENT_MAX_WIDTH; // 内容列最大宽度，保留右侧安全边距
                const startX = CONTACT_START_X; // 起始X位置

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
                drawFittedText(ctx, OFFICE_TEXT, OFFICE_START_X, OFFICE_Y, OFFICE_MAX_WIDTH, 25, 18);

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
        alert('生成图片错误 / Error generating image: ' + error.message);
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

function getSignatureFileBaseName() {
    const contactNameBase = isPublicMailboxMode() ? '' : contactName.value.trim();
    const emailBase = email.value.trim().split('@')[0];
    const baseName = contactNameBase || emailBase || 'public_mailbox';
    return baseName.replace(/[\\/:*?"<>|]+/g, '_') || 'public_mailbox';
}

// 导出图片
async function exportImageHandler() {
    if (!validateForm()) {
        alert('请完善表单信息 / Please complete the form information');
        return;
    }

    try {
        const canvas = await convertToImage();
        if (canvas) {
            // 创建下载链接
            const link = document.createElement('a');
            link.download = `signature_${getSignatureFileBaseName()}_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('导出失败 / Export failed: ' + error.message);
    }
}

// 复制图片到剪贴板（增强兼容性版本）
async function copyImageHandler() {
    if (!validateForm()) {
        alert('请完善表单信息 / Please complete the form information');
        return;
    }

    try {
        const canvas = await convertToImage();
        if (!canvas) {
            alert('生成图片失败，请重试 / Failed to generate image, please try again');
            return;
        }

        // 检查浏览器是否支持剪贴板API
        if (!navigator.clipboard || !navigator.clipboard.write) {
            alert('您的浏览器不支持复制图片功能，请使用导出功能 / Your browser does not support copying images, please use export function');
            return;
        }

        // 检查是否在HTTPS环境或localhost
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            alert('复制图片功能需要HTTPS环境，请使用导出功能 / Copy image function requires HTTPS environment, please use export function');
            return;
        }

        // 首先尝试PNG格式（兼容性更好）
        canvas.toBlob(async (pngBlob) => {
            if (!pngBlob) {
                alert('图片转换失败，请重试 / Image conversion failed, please try again');
                return;
            }

            try {
                // 尝试PNG格式复制（兼容性最好）
                const clipboardItem = new ClipboardItem({
                    'image/png': pngBlob
                });

                await navigator.clipboard.write([clipboardItem]);
                alert('签名已复制到剪贴板（PNG格式）！/ Signature copied to clipboard (PNG format)!');

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
                        alert('签名已复制到剪贴板（JPG格式）！/ Signature copied to clipboard (JPG format)!');

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
        alert('复制失败 / Copy failed: ' + error.message + '，请使用导出功能 / Please use export function');
    }
}

// 下载备用方案
function downloadFallback(canvas) {
    try {
        const link = document.createElement('a');
        link.download = `signature_${getSignatureFileBaseName()}_${new Date().toISOString().split('T')[0]}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        alert('复制到剪贴板失败，已自动下载图片文件 / Failed to copy to clipboard, image file downloaded automatically');
    } catch (downloadError) {
        console.error('Download fallback error:', downloadError);
        alert('复制和下载都失败，请使用导出功能 / Both copy and download failed, please use export function');
    }
}



// 公司管理相关函数
const companyModal = document.getElementById('companyModal');
const closeModal = document.getElementById('closeModal');
const manageCompanies = document.getElementById('manageCompanies');
const addCompany = document.getElementById('addCompany');
const addCompanyText = document.getElementById('addCompanyText');
const cancelEdit = document.getElementById('cancelEdit');
const companyList = document.getElementById('companyList');
const newCompanyDisplayName = document.getElementById('newCompanyDisplayName');
const newCompanyName = document.getElementById('newCompanyName');
const newCompanyAddress = document.getElementById('newCompanyAddress');
const customWebsiteEnabled = document.getElementById('customWebsiteEnabled');
const customWebsiteSection = document.getElementById('customWebsiteSection');
const newCompanyWebsite = document.getElementById('newCompanyWebsite');
const newCompanyGroupWebsite = document.getElementById('newCompanyGroupWebsite');

// 编辑状态管理
let isEditMode = false;
let editingCompanyId = null;

// 自定义Website勾选框事件监听
if (customWebsiteEnabled) {
    customWebsiteEnabled.addEventListener('change', function() {
        if (this.checked) {
            customWebsiteSection.classList.remove('hidden');
        } else {
            customWebsiteSection.classList.add('hidden');
            // 清空输入框
            newCompanyWebsite.value = '';
            newCompanyGroupWebsite.value = '';
        }
    });
}

// 取消编辑按钮事件监听
if (cancelEdit) {
    cancelEdit.addEventListener('click', exitEditMode);
}

// 打开公司管理
async function openCompanyManagement() {
    const password = prompt('请输入管理密码:');

    try {
        const result = await cloudflareCompanyManager.verifyPassword(password);
        if (result.success) {
            renderCompanyList();
            companyModal.classList.remove('hidden');
        } else {
            alert('密码错误！/ Incorrect password!');
        }
    } catch (error) {
        alert('验证失败 / Verification failed: ' + error.message);
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
                    <p class="text-sm text-gray-600 mb-1"><strong>地址:</strong> ${company.address || '(空)'}</p>
                    ${company.customWebsite ? `
                        <p class="text-sm text-blue-600 mb-1"><strong>Website:</strong> ${company.website}</p>
                        <p class="text-sm text-blue-600"><strong>Group:</strong> ${company.groupWebsite}</p>
                    ` : '<p class="text-sm text-gray-500">使用默认Website / Using default website</p>'}
                </div>
                ${!company.isDefault ? `
                    <div class="ml-4 flex gap-2">
                        <button onclick="editCompany('${key}')" class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                            编辑 / Edit
                        </button>
                        <button onclick="deleteCompany('${key}')" class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                            删除 / Delete
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        companyList.appendChild(companyItem);
    });
}

// 清空表单
function clearForm() {
    newCompanyDisplayName.value = '';
    newCompanyName.value = '';
    newCompanyAddress.value = '';
    newCompanyWebsite.value = '';
    newCompanyGroupWebsite.value = '';
    customWebsiteEnabled.checked = false;
    customWebsiteSection.classList.add('hidden');
}

// 进入编辑模式
function enterEditMode(companyId, companyData) {
    isEditMode = true;
    editingCompanyId = companyId;

    // 填充表单数据
    newCompanyDisplayName.value = companyData.displayName || '';
    newCompanyName.value = companyData.name || '';
    newCompanyAddress.value = companyData.address || '';

    // 处理自定义Website
    if (companyData.customWebsite) {
        customWebsiteEnabled.checked = true;
        customWebsiteSection.classList.remove('hidden');
        newCompanyWebsite.value = companyData.website || '';
        newCompanyGroupWebsite.value = companyData.groupWebsite || '';
    } else {
        customWebsiteEnabled.checked = false;
        customWebsiteSection.classList.add('hidden');
        newCompanyWebsite.value = '';
        newCompanyGroupWebsite.value = '';
    }

    // 更新UI
    addCompanyText.textContent = '更新公司 / Update Company';
    cancelEdit.classList.remove('hidden');
}

// 退出编辑模式
function exitEditMode() {
    isEditMode = false;
    editingCompanyId = null;

    // 清空表单
    clearForm();

    // 更新UI
    addCompanyText.textContent = '添加公司 / Add Company';
    cancelEdit.classList.add('hidden');
}

// 编辑公司
function editCompany(companyId) {
    const companies = cloudflareCompanyManager.getCompanies();
    const company = companies[companyId];

    if (company) {
        enterEditMode(companyId, company);
    }
}

// 添加新公司或更新公司
async function addNewCompany() {
    const displayName = newCompanyDisplayName.value.trim();
    const name = newCompanyName.value.trim();
    const address = newCompanyAddress.value.trim();
    const hasCustomWebsite = customWebsiteEnabled.checked;
    const website = newCompanyWebsite.value.trim();
    const groupWebsite = newCompanyGroupWebsite.value.trim();

    if (!displayName || !name || !address) {
        alert('请填写完整的公司信息（显示名称、公司名称、公司地址都是必填项）/ Please fill in complete company information (display name, company name, and address are all required)');
        return;
    }

    // 如果勾选了自定义Website，则Website字段为必填
    if (hasCustomWebsite && !website) {
        alert('请输入Website地址 / Please enter website URL');
        return;
    }

    try {
        const companyData = {
            displayName: displayName,
            name: name,
            address: address
        };

        // 如果勾选了自定义Website，添加website字段
        if (hasCustomWebsite) {
            companyData.customWebsite = true;
            companyData.website = website;
            companyData.groupWebsite = groupWebsite || 'www.francescoparisi.com'; // 默认值
        }

        let result;
        const wasEditMode = isEditMode; // 保存当前状态，因为exitEditMode会重置它

        if (isEditMode) {
            // 编辑模式：更新公司
            result = await cloudflareCompanyManager.updateCompany(editingCompanyId, companyData);
        } else {
            // 新增模式：添加公司
            result = await cloudflareCompanyManager.addCompany(companyData);
        }

        if (result.success) {
            // 清空表单并退出编辑模式
            clearForm();
            exitEditMode();

            // 更新界面
            await initializeCompanySelect();
            renderCompanyList();

            const successMessage = wasEditMode ?
                '公司更新成功！/ Company updated successfully!' :
                '公司添加成功！/ Company added successfully!';
            alert(successMessage);
        } else {
            const errorMessage = wasEditMode ?
                '更新失败 / Update failed: ' + result.error :
                '添加失败 / Add failed: ' + result.error;
            alert(errorMessage);
        }
    } catch (error) {
        alert('添加失败 / Add failed: ' + error.message);
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
                alert('公司删除成功！/ Company deleted successfully!');
            } else {
                alert('删除失败 / Delete failed: ' + result.error);
            }
        } catch (error) {
            alert('删除失败 / Delete failed: ' + error.message);
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
        alert('应用初始化失败，请刷新页面重试 / Application initialization failed, please refresh the page and try again');
    }
}

// 页面访问密码验证
function unlockAccessGate() {
    sessionStorage.setItem('pgs_signature_access_granted', 'true');
    document.body.classList.remove('access-locked');

    const accessGate = document.getElementById('accessGate');
    if (accessGate) {
        accessGate.classList.add('hidden');
    }
}

function showAccessError(message) {
    const errorElement = document.getElementById('accessPasswordError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function clearAccessError() {
    const errorElement = document.getElementById('accessPasswordError');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }
}

async function initializeAccessGate() {
    const accessGate = document.getElementById('accessGate');
    const accessPasswordForm = document.getElementById('accessPasswordForm');
    const accessPasswordInput = document.getElementById('accessPasswordInput');
    const accessPasswordSubmit = document.getElementById('accessPasswordSubmit');

    if (sessionStorage.getItem('pgs_signature_access_granted') === 'true') {
        unlockAccessGate();
        await initializeApp();
        return;
    }

    if (!accessGate || !accessPasswordForm || !accessPasswordInput || !accessPasswordSubmit) {
        console.error('访问验证组件缺失');
        return;
    }

    accessGate.classList.remove('hidden');
    document.body.classList.add('access-locked');
    accessPasswordInput.focus();

    accessPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearAccessError();

        const password = accessPasswordInput.value;
        if (!password) {
            showAccessError('请输入访问密码 / Please enter the access password');
            accessPasswordInput.focus();
            return;
        }

        const originalText = accessPasswordSubmit.textContent;
        accessPasswordSubmit.disabled = true;
        accessPasswordSubmit.textContent = '验证中... / Verifying...';

        try {
            const result = await cloudflareCompanyManager.verifyAccessPassword(password);

            if (result.success) {
                accessPasswordInput.value = '';
                unlockAccessGate();
                await initializeApp();
            } else {
                showAccessError('访问密码错误 / Incorrect access password');
                accessPasswordInput.select();
            }
        } catch (error) {
            console.error('访问密码验证失败:', error);
            showAccessError('验证失败，请检查网络后重试 / Verification failed, please check the network and try again');
        } finally {
            accessPasswordSubmit.disabled = false;
            accessPasswordSubmit.textContent = originalText;
        }
    });
}



// 事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 表单变化监听
    [companySelect, customCompanyName, customCompanyAddress, contactName, publicMailboxMode, department, tel, fax, mobile, email, imType1, imValue1, imType2, imValue2].filter(Boolean).forEach(element => {
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

    // 验证访问密码后初始化应用
    initializeAccessGate();
});

window.addEventListener('resize', function() {
    updatePreview();
});

