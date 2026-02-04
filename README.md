# URL Generator Chrome 插件

一个使用 **React + TypeScript** 开发的现代化Chrome插件。

## 技术栈

- ⚛️ **React 18** - 现代化的UI库
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

### 3. 加载插件到Chrome

1. 运行 `npm run build` 构建项目
2. 打开Chrome浏览器
3. 访问：`chrome://extensions/`
4. 开启右上角的"**开发者模式**"
5. 点击"**加载已解压的扩展程序**"
6. 选择项目的 `dist` 文件夹
7. 插件安装完成！🎉

## 开发流程

1. 运行 `npm run dev` 启动开发模式
2. 修改 `src/` 目录下的代码
3. Webpack会自动重新打包
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

## 使用方法

点击Chrome工具栏中的插件图标，即可看到使用React渲染的"Hello World"面板。

## 开发说明

### 添加新组件

在 `src/` 目录下创建新的 `.tsx` 文件：

```js
import React from 'react';

const MyComponent: React.FC = () => {
  return <div>My Component</div>;
};

export default MyComponent;
```

### 使用Chrome API

在React组件中可以直接使用Chrome API：

```tsx
chrome.tabs.query({active: true}, (tabs) => {
  console.log(tabs);
});
```

### 调试技巧

1. 点击插件图标打开popup
2. 右键popup面板 → 选择"检查"
3. 在DevTools的Console中查看日志
4. 使用React DevTools扩展调试组件

## 常用命令

```bash
npm run build    # 生产环境构建
npm run dev      # 开发模式
npm run watch    # 同dev，监听文件变化
```
