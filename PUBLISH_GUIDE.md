# Chrome 扩展商店发布指南

## 📋 准备清单

### 1. 必需文件

- ✅ manifest.json (已完成)
- ✅ 图标 (16x16, 48x48, 128x128) (已完成)
- ✅ 构建后的代码在 `dist/` 目录 (已完成)

### 2. 商店资源（需要准备）

- 📷 截图 (1280x800 或 640x400)，至少 1 张，最多 5 张
- 🖼️ 宣传图片（可选）
  - 小型宣传图: 440x280
  - 大型宣传图: 920x680
  - Marquee 图: 1400x560
- 📝 详细描述
- 🎥 宣传视频链接（可选，YouTube）

## 🚀 发布步骤

### 步骤 1: 注册开发者账号

1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 使用 Google 账号登录
3. **支付一次性注册费用 $5**（终身有效）
4. 填写开发者信息

### 步骤 2: 打包扩展程序

```bash
# 确保已构建最新版本
npm run build

# 打包dist目录为zip文件
cd dist
zip -r ../url-generator-v1.0.0.zip .
cd ..
```

或者手动压缩：

- 进入 `dist/` 目录
- 选择所有文件（不是 dist 文件夹本身）
- 压缩为 `url-generator-v1.0.0.zip`

⚠️ **重要**: 压缩包内应该直接是文件，不要包含 dist 文件夹层级

### 步骤 3: 准备商店资源

#### 截图建议

1. 在 Chrome 中打开插件
2. 截取以下页面：
   - Generate 页面（输入 pathname）
   - Generate 页面（显示生成的 URLs）
   - Setting 页面（配置界面）
   - Snapshot 页面（显示快照）
3. 使用工具调整为 1280x800 或 640x400

#### 描述模板

**简短描述** (132 字符以内):

```
快速生成多环境URL工具，支持QA、Pre、Prod环境配置，管理URL快照
```

**详细描述**:

```
URL Generator - 多环境URL生成工具

🎯 功能特性

✅ 多环境配置
- 支持QA、Pre、Prod三个环境
- 支持H5、PC、App三个平台
- 一键配置各环境Origin

✅ 快速生成
- 输入pathname自动生成完整URL
- 支持9个URL同时生成（3平台 × 3环境）
- 一键复制所有或单个平台URL

✅ 快照管理
- 保存常用URL组合为快照
- 快速复制历史快照
- 便捷管理多个项目URL

🔧 使用场景
- 前端开发测试不同环境
- 快速切换测试环境
- 团队协作共享URL配置
- 保存常用URL组合

💡 使用方法
1. Setting页面配置各平台各环境的Origin
2. Generate页面输入pathname生成URL
3. 点击URL复制到剪贴板
4. 保存常用URL为快照方便后续使用
```

### 步骤 4: 提交扩展程序

1. 登录 [开发者控制台](https://chrome.google.com/webstore/devconsole)
2. 点击 "**New Item**" 或 "**新增项目**"
3. 上传 `url-generator-v1.0.0.zip`
4. 填写商店信息：
   - **商品名称**: URL Generator
   - **摘要**: 快速生成多环境 URL 工具
   - **详细说明**: 粘贴上面的详细描述
   - **类别**: Developer Tools（开发者工具）
   - **语言**: 中文 / English
5. 上传截图和宣传图片
6. 填写隐私政策相关信息：
   - 是否使用远程代码: 否
   - 是否收集用户数据: 否
   - 单一用途描述: URL 生成和管理工具
7. 选择发布选项：
   - **公开**: 所有人可见可安装
   - **不公开**: 仅通过链接访问
   - **私密**: 仅指定用户

### 步骤 5: 提交审核

1. 检查所有信息
2. 点击 "**提交审核**" / "**Submit for Review**"
3. 等待审核（通常 1-3 个工作日）

## 📊 审核要求

### 必须满足的条件

- ✅ 单一用途明确
- ✅ 请求的权限合理（我们只用 storage，没问题）
- ✅ 不包含恶意代码
- ✅ 功能描述准确
- ✅ 截图真实反映功能
- ✅ 不侵犯他人版权

### 可能被拒绝的原因

- ❌ 功能描述不清
- ❌ 请求过多不必要权限
- ❌ 截图质量差或误导
- ❌ 隐私政策不完整
- ❌ 包含广告或付费内容但未声明

## 🔄 更新版本

1. 修改 `manifest.json` 中的 `version`
2. 重新构建: `npm run build`
3. 打包新的 zip 文件
4. 在开发者控制台上传新版本
5. 提交审核

## 💰 费用说明

- 开发者注册: $5（一次性，永久有效）
- 发布扩展: 免费
- 更新扩展: 免费

## 🔗 相关链接

- [Chrome Web Store 开发者控制台](https://chrome.google.com/webstore/devconsole)
- [Chrome 扩展发布政策](https://developer.chrome.com/docs/webstore/program-policies/)
- [开发者计划政策](https://developer.chrome.com/docs/webstore/program-policies/developer-program-policies/)
- [最佳实践](https://developer.chrome.com/docs/webstore/best-practices/)

## 📝 注意事项

1. **首次审核时间较长**，可能需要几天
2. **保持描述真实**，不要夸大功能
3. **及时响应审核反馈**
4. **定期更新维护**，提高评分
5. **收集用户反馈**，持续优化

## 🎉 发布后

- 获取扩展商店链接分享给用户
- 监控用户评价和反馈
- 根据反馈优化功能
- 定期发布更新版本
