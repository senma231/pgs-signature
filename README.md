# 🎯 电子签名生成器 - 纯前端版本

## 📋 系统特点

### ✅ 超级简单
- **零配置** - 上传文件即可使用
- **零依赖** - 不需要Python、数据库、服务器配置
- **零维护** - 不需要管理后端服务
- **即开即用** - 打开网页就能用

### ✅ 功能完整
- 电子签名生成和预览
- 公司信息管理 (存储在浏览器本地)
- PNG图片导出
- 图片复制到剪贴板
- 密码保护的管理功能
- 响应式设计，支持手机访问

### ✅ 数据安全
- 数据存储在用户浏览器本地 (localStorage)
- 不会上传到任何服务器
- 用户完全控制自己的数据
- 支持数据导出和备份

## 🚀 5分钟部署指南

### 方法一：宝塔面板 (推荐)

1. **创建网站**
   - 登录宝塔面板
   - 点击"网站" → "添加站点"
   - 域名: `your-domain.com`
   - PHP版本: **纯静态**

2. **上传文件**
   - 将 `simple-version` 文件夹中的所有文件上传到网站根目录
   - 确保文件结构如下:
   ```
   /www/wwwroot/your-domain.com/
   ├── index.html
   ├── js/
   ├── css/
   └── images/
   ```

3. **完成！**
   - 直接访问 `https://your-domain.com` 即可使用

### 方法二：虚拟主机

1. **FTP上传**
   - 使用FTP客户端连接虚拟主机
   - 上传所有文件到网站根目录

2. **完成！**
   - 访问域名即可使用

### 方法三：免费托管平台

#### GitHub Pages
1. 创建GitHub仓库
2. 上传所有文件
3. 开启GitHub Pages
4. 访问 `https://username.github.io/repo-name`

#### Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 拖拽 `simple-version` 文件夹
3. 自动部署完成

#### Netlify
1. 访问 [netlify.com](https://netlify.com)
2. 拖拽 `simple-version` 文件夹
3. 自动部署完成

## 📁 文件结构

```
simple-version/
├── index.html              # 主页面文件
├── js/
│   ├── app.js             # 核心应用逻辑
│   └── storage.js         # 本地存储管理
├── css/
│   └── style.css          # 样式文件
├── images/
│   ├── back.png           # 签名背景图
│   └── logo.png           # 公司Logo
└── README.md              # 说明文档
```

## 🎯 使用说明

### 基本使用
1. 打开网站
2. 填写个人信息 (姓名、部门等)
3. 填写联系方式 (可选)
4. 点击"生成签名"预览
5. 点击"导出图片"下载PNG文件

### 公司管理
1. 点击右上角"管理公司"按钮
2. 输入密码: `Sz@pgsit`
3. 添加自定义公司信息
4. 在表单中选择公司使用

### 数据管理
- **自动保存**: 添加的公司信息自动保存在浏览器
- **数据备份**: 可以导出公司数据为JSON文件
- **数据恢复**: 可以导入之前备份的数据
- **清空数据**: 清除浏览器数据会重置为默认状态

## 🔧 自定义配置

### 修改背景图片
替换 `images/back.png` 文件，建议尺寸: 1600x580px

### 修改Logo
替换 `images/logo.png` 文件

### 修改管理密码
编辑 `js/storage.js` 文件，修改 `correctPassword` 变量

### 修改签名样式
编辑 `js/app.js` 文件中的 `SIGNATURE_CONFIG` 对象

## 🌐 Cloudflare Tunnel部署

如果您使用内网服务器 + Cloudflare Tunnel:

1. **配置Cloudflare Tunnel**
   - 在Cloudflare Dashboard创建Tunnel
   - 域名映射: `sign.your-domain.com` → `localhost:80`

2. **宝塔面板配置**
   - 创建网站，域名: `sign.your-domain.com`
   - 添加备用域名: `localhost`
   - 上传纯前端文件

3. **无需其他配置**
   - 不需要申请SSL证书 (Cloudflare自动提供)
   - 不需要配置反向代理
   - 不需要Python环境

## 🛡️ 安全说明

### 数据安全
- 所有数据存储在用户浏览器本地
- 不会发送到任何远程服务器
- 用户完全控制自己的数据

### 密码保护
- 管理功能使用密码保护
- 密码: `Sz@pgsit`
- 可以修改密码 (编辑源代码)

### 隐私保护
- 不收集任何用户信息
- 不使用任何第三方追踪
- 完全离线工作 (除了CDN资源)

## 📱 浏览器兼容性

### 支持的浏览器
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ 移动端浏览器

### 功能要求
- localStorage支持 (现代浏览器都支持)
- Canvas API支持 (绘制签名)
- Clipboard API支持 (复制功能，可选)

## 🔄 数据迁移

### 从数据库版本迁移
如果您之前使用的是数据库版本，可以:
1. 在数据库版本中导出公司数据
2. 在纯前端版本中手动添加公司信息

### 备份和恢复
```javascript
// 导出数据 (在浏览器控制台执行)
console.log(JSON.stringify(storageManager.getCompanies(), null, 2));

// 导入数据 (通过管理界面的导入功能)
```

## 📞 技术支持

### 常见问题
1. **页面无法加载** → 检查文件是否完整上传
2. **图片无法显示** → 检查images文件夹是否存在
3. **数据丢失** → 检查浏览器是否清除了localStorage
4. **功能异常** → 检查浏览器控制台错误信息

### 故障排除
```javascript
// 检查存储状态 (浏览器控制台)
console.log('存储信息:', storageManager.getStorageInfo());

// 重置数据 (浏览器控制台)
storageManager.clearAllData();
```

## 🎉 部署完成

当您看到以下内容时，说明部署成功：

1. ✅ 访问域名页面正常加载
2. ✅ 可以填写表单信息
3. ✅ 可以生成签名预览
4. ✅ 可以导出PNG图片
5. ✅ 管理功能正常 (密码: Sz@pgsit)

**恭喜！您的纯前端电子签名系统已成功部署！** 🎊

---

**版本**: v1.0 - 纯前端版本  
**特点**: 零配置、零依赖、即开即用  
**适用**: 个人用户、小团队、快速部署需求
