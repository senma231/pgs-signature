# 🚀 PGS电子签名系统 - 完整部署指南

本文档详细说明如何部署PGS电子签名系统，包括前端和后端API的完整部署流程。

## 📋 系统架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   前端应用      │    │  Cloudflare      │    │   KV存储        │
│  (静态网站)     │◄──►│   Workers API    │◄──►│  (公司数据)     │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎯 部署概览

1. **前端部署** - 静态网站托管 (GitHub Pages/Vercel/Netlify)
2. **后端部署** - Cloudflare Workers + KV存储
3. **配置连接** - 前端连接到API端点

## 📦 前端部署

### 方法一：GitHub Pages (推荐)

#### 1. 准备仓库
```bash
# Clone项目
git clone https://github.com/senma231/pgs-signature.git
cd pgs-signature

# 或者Fork仓库到你的GitHub账号
```

#### 2. 配置GitHub Pages
1. 进入GitHub仓库设置页面
2. 找到 "Pages" 设置
3. 选择源分支：`main`
4. 选择文件夹：`/ (root)`
5. 保存设置

#### 3. 访问网站
- 网站地址：`https://username.github.io/pgs-signature`
- 部署时间：通常1-2分钟

### 方法二：Vercel

#### 1. 连接仓库
1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 "New Project"
4. 选择 `pgs-signature` 仓库

#### 2. 配置部署
- Framework Preset: `Other`
- Root Directory: `./`
- Build Command: (留空)
- Output Directory: `./`

#### 3. 部署
- 点击 "Deploy"
- 获得自定义域名：`https://pgs-signature.vercel.app`

### 方法三：Netlify

#### 1. 拖拽部署
1. 访问 [netlify.com](https://netlify.com)
2. 将项目文件夹拖拽到部署区域
3. 自动部署完成

#### 2. 连接Git (可选)
1. 连接GitHub仓库
2. 启用自动部署
3. 每次推送代码自动更新

## ⚡ 后端API部署 (Cloudflare Workers)

### 1. 创建Cloudflare账号
1. 访问 [cloudflare.com](https://cloudflare.com)
2. 注册免费账号
3. 进入Dashboard

### 2. 创建KV命名空间
1. 进入 "Workers & Pages"
2. 点击 "KV"
3. 创建命名空间：`COMPANIES_KV`
4. 记录命名空间ID

### 3. 创建Worker
1. 点击 "Create application"
2. 选择 "Create Worker"
3. 命名：`pgs-signature-api`
4. 点击 "Deploy"

### 4. 配置Worker代码
1. 点击 "Edit code"
2. 删除默认代码
3. 复制 `cloudflare-worker.js` 中的完整代码
4. 粘贴到编辑器
5. 点击 "Save and deploy"

### 5. 绑定KV存储
1. 进入Worker设置页面
2. 找到 "Variables" 选项卡
3. 在 "KV Namespace Bindings" 中添加：
   - Variable name: `COMPANIES_KV`
   - KV namespace: 选择之前创建的命名空间
4. 保存设置

### 6. 测试API
访问：`https://pgs-signature-api.your-subdomain.workers.dev/api/health`

应该返回：
```json
{
  "success": true,
  "message": "Cloudflare Workers API正常运行",
  "worker": "electronic-signature-api",
  "kv_status": "connected"
}
```

## 🔗 连接前端和后端

### 1. 配置API地址
在 `index.html` 的 `<head>` 部分添加：

```html
<meta name="api-url" content="https://pgs-signature-api.your-subdomain.workers.dev/api">
```

### 2. 更新前端代码
如果使用自定义域名，确保API地址正确配置。

### 3. 测试连接
1. 打开前端网站
2. 按F12打开开发者工具
3. 查看Console是否有API连接成功的日志
4. 尝试管理公司功能

## 🛠️ 高级配置

### 自定义域名 (可选)

#### 1. 配置Worker域名
1. 在Cloudflare Dashboard中添加域名
2. 配置DNS记录指向Worker
3. 启用SSL证书

#### 2. 更新前端配置
更新 `index.html` 中的API地址为自定义域名。

### 环境变量配置

在Worker中可以配置环境变量：
- `ADMIN_PASSWORD`: 管理密码 (默认: Sz@pgsit)
- `CORS_ORIGIN`: 允许的前端域名

## 🔍 故障排除

### 常见问题

#### 1. API连接失败
- 检查API地址是否正确
- 确认Worker已正确部署
- 检查KV命名空间绑定

#### 2. CORS错误
- 确认Worker中的CORS配置
- 检查前端域名是否在允许列表中

#### 3. 数据无法保存
- 检查KV命名空间是否正确绑定
- 确认Worker有写入权限
- 查看Worker日志

### 调试方法

#### 1. 检查Worker日志
1. 进入Worker管理页面
2. 查看 "Logs" 选项卡
3. 观察实时日志

#### 2. 测试API端点
```bash
# 健康检查
curl https://your-worker.workers.dev/api/health

# 获取公司列表
curl https://your-worker.workers.dev/api/companies

# 验证密码
curl -X POST https://your-worker.workers.dev/api/verify-password \
  -H "Content-Type: application/json" \
  -d '{"password":"Sz@pgsit"}'
```

## 📊 监控和维护

### 1. 监控指标
- Worker请求数量
- KV读写操作
- 错误率统计

### 2. 数据备份
定期导出公司数据：
1. 访问管理界面
2. 使用导出功能
3. 保存JSON文件

### 3. 更新部署
- 前端：推送代码到Git仓库自动部署
- 后端：在Worker编辑器中更新代码

## 🎉 部署完成检查清单

- [ ] 前端网站可以正常访问
- [ ] API健康检查返回成功
- [ ] 可以正常填写和预览签名
- [ ] 管理功能正常 (密码: Sz@pgsit)
- [ ] 可以添加、编辑、删除公司
- [ ] 数据可以正常保存和加载
- [ ] 导出功能正常工作

**恭喜！您的PGS电子签名系统已成功部署！** 🎊

---

**技术支持**: 如有问题，请查看项目README或提交Issue。
