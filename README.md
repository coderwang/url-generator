# URL Generator Chrome 插件

一个使用 **React + TypeScript** 开发的现代化 Chrome 插件。

## 技术栈

- ⚛️ **React 18** - 现代化的 UI 库
- 🔷 **TypeScript** - 类型安全
- 📦 **Webpack** - 模块打包
- 🎨 **CSS Modules** - 样式管理
- 🔧 **Chrome Extension Manifest V3** - 最新标准

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 构建项目

```bash
# 生产环境构建
npm run build

# 开发模式（自动监听文件变化）
npm run dev
```

### 3. 加载插件到 Chrome

1. 运行 `npm run build` 构建项目
2. 打开 Chrome 浏览器
3. 访问：`chrome://extensions/`
4. 开启右上角的"**开发者模式**"
5. 点击"**加载已解压的扩展程序**"
6. 选择项目的 `dist` 文件夹
7. 插件安装完成！🎉

## 开发流程

1. 运行 `npm run dev` 启动开发模式
2. 修改 `src/` 目录下的代码
3. Webpack 会自动重新打包
4. 在 `chrome://extensions/` 页面点击插件的刷新按钮
5. 点击插件图标查看效果

## 项目结构

```
url-generator/
├── src/
│   ├── popup.tsx         # React入口文件
│   ├── popup.html        # HTML模板
│   ├── App.tsx           # 主React组件
│   └── App.css           # 组件样式
├── dist/                 # 构建输出目录（加载到Chrome）
│   ├── popup.html
│   ├── popup.js
│   └── manifest.json
├── manifest.json         # Chrome插件配置
├── package.json          # npm配置
├── tsconfig.json         # TypeScript配置
├── webpack.config.js     # Webpack配置
└── README.md
```

## 功能说明

### Generate 页面

- 输入 H5、PC、App 三个平台的 pathname
- 点击"OK"按钮生成完整 URL
- 自动拼接已配置的 Origin 和输入的 pathname
- 显示所有环境（Qa、Pre、Prod）的完整 URL

### Setting 页面

- 配置 H5、PC、App 三个平台的环境 Origin
- 每个平台可配置 Qa、Pre、Prod 三个环境
- 配置会自动保存到 Chrome 本地存储
- 示例：`https://www.google.com`

## 使用流程

1. **首次使用**：先进入 Setting 页面配置各环境的 Origin
2. **生成 URL**：在 Generate 页面输入 pathname，点击 OK 生成完整 URL
3. **配置持久化**：所有配置自动保存，重新打开插件时自动恢复

## 开发说明

### 添加新组件

在 `src/` 目录下创建新的 `.tsx` 文件：

```js
import React from "react";

const MyComponent: React.FC = () => {
  return <div>My Component</div>;
};

export default MyComponent;
```

### 使用 Chrome API

在 React 组件中可以直接使用 Chrome API：

```tsx
chrome.tabs.query({ active: true }, (tabs) => {
  console.log(tabs);
});
```

### 调试技巧

1. 点击插件图标打开 popup
2. 右键 popup 面板 → 选择"检查"
3. 在 DevTools 的 Console 中查看日志
4. 使用 React DevTools 扩展调试组件

## 常用命令

```bash
npm run build    # 生产环境构建
npm run dev      # 开发模式
npm run watch    # 同dev，监听文件变化
npm run package  # 构建并打包为zip（用于发布）
```

## 📦 发布到 Chrome Web Store

准备好发布你的插件了吗？查看详细的发布指南：

📄 **[查看发布指南](./PUBLISH_GUIDE.md)**

### 快速发布步骤：

1. **打包插件**

   ```bash
   npm run package
   ```

   这会生成 `url-generator-v1.0.0.zip` 文件

2. **注册开发者账号**

   - 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - 支付 $5 一次性注册费

3. **上传并发布**
   - 上传 zip 文件
   - 填写商店信息和截图
   - 提交审核（1-3 个工作日）

详细步骤请查看 [PUBLISH_GUIDE.md](./PUBLISH_GUIDE.md)
