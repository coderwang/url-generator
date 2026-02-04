# URL Generator Chrome 插件

一个使用TypeScript开发的Chrome插件，点击图标显示Hello World。

## 开发环境设置

### 1. 安装依赖

```bash
npm install
```

### 2. 编译TypeScript

```bash
# 编译一次
npm run build

# 或者开启watch模式（推荐开发时使用）
npm run watch
```

这会将 `src/popup.ts` 编译为 `dist/popup.js`。

## 安装插件到Chrome

1. 确保已经运行 `npm run build` 编译了TypeScript代码
2. 打开Chrome浏览器
3. 进入扩展程序页面：`chrome://extensions/`
4. 开启右上角的"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择本项目文件夹
7. 插件安装完成！

## 使用方法

点击浏览器工具栏中的插件图标，即可看到"Hello World"面板。

## 文件结构

```
url-generator/
├── src/
│   └── popup.ts          # TypeScript源码
├── dist/                 # 编译输出目录
│   └── popup.js          # 编译后的JavaScript
├── manifest.json         # Chrome插件配置文件
├── popup.html            # 点击图标时显示的页面
├── popup.css             # 样式文件
├── package.json          # npm配置文件
├── tsconfig.json         # TypeScript配置文件
├── .gitignore            # Git忽略文件
└── README.md             # 说明文档
```

## 技术栈

- **TypeScript 5.3+** - 类型安全的JavaScript超集
- **Chrome Extension Manifest V3** - 最新的Chrome插件标准
- **@types/chrome** - Chrome API的TypeScript类型定义

## 开发建议

1. 使用 `npm run watch` 在开发时自动编译TypeScript
2. 修改代码后，在 `chrome://extensions/` 页面点击插件的刷新按钮
3. 所有TypeScript源码放在 `src/` 目录下
4. `dist/` 目录是自动生成的，不要手动修改
