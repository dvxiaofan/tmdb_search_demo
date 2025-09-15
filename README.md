# TMDB ID 查询工具

一个简洁优雅的 TMDB（The Movie Database）ID 查询工具，用于快速查找电影、电视剧和系列的 TMDB ID。

## ✨ 功能特性

### 核心功能
- 🔍 **多类型搜索**：支持搜索电影、电视剧、系列（Collection）或全部类型
- 📋 **快速复制 ID**：一键复制 TMDB ID 到剪贴板
- 🖼️ **海报下载**：支持多种尺寸的海报图片下载（中等、大图、原图）
- 📝 **详细信息展示**：
  - 电影：评分、时长、类型、主演、相似推荐
  - 电视剧：总集数、季数信息、单集时长、每季集数详情
  - 系列：包含电影列表、系列简介
- 🔗 **TMDB 链接**：直接跳转到 TMDB 官网查看详情

### 用户体验
- 🌙 **暗黑模式**：支持亮色/暗色主题切换，保护眼睛
- 📚 **搜索历史**：自动保存最近 10 条搜索记录
- ⌨️ **快捷键支持**：
  - `/` 或 `Ctrl+K`：快速聚焦搜索框
  - `Enter`：执行搜索
  - `Esc`：清空搜索
- 🎨 **响应式设计**：完美适配桌面和移动设备
- ⬆️ **返回顶部**：便捷的返回顶部按钮（显示在右侧中间）
- 💀 **骨架屏加载**：优雅的加载动画体验

## 🚀 快速开始

### 在线使用
访问已部署的在线版本（如果有）

### 本地部署

1. **克隆项目**
```bash
git clone https://github.com/yourusername/tmdb-search.git
cd tmdb-search
```

2. **配置 API 密钥**
在 `modules/api.js` 文件中设置你的 TMDB API 密钥：
```javascript
export const API_KEY = 'YOUR_API_KEY_HERE';
```

获取 API 密钥：
- 访问 [TMDB API 设置页面](https://www.themoviedb.org/settings/api)
- 登录或注册账号
- 申请 API 密钥（选择 Developer 选项）
- 复制 API Key (v3 auth)

3. **启动本地服务器**
由于使用了 ES6 模块，需要通过 HTTP 服务器访问：
```bash
# Python 3
python3 -m http.server 8000

# 或使用 Node.js
npx serve

# 或使用 Live Server 插件（VS Code）
```

4. **访问应用**
打开浏览器访问 `http://localhost:8000`

## 📁 项目结构

```
tmdb-search/
├── index.html          # 主页面
├── main.js            # 主入口文件
├── style.css          # 样式文件
├── modules/           # ES6 模块
│   ├── api.js        # API 相关功能
│   ├── ui.js         # UI 渲染功能
│   ├── details.js    # 详情渲染功能
│   ├── utils.js      # 工具函数
│   ├── history.js    # 历史记录管理
│   └── theme.js      # 主题管理
├── LICENSE            # MIT 许可证
└── README.md         # 项目说明
```

## 🛠️ 技术栈

- **原生 JavaScript (ES6+)**：使用模块化开发，无框架依赖
- **原生 CSS3**：现代 CSS 特性，包括 Grid、Flexbox、CSS 变量
- **TMDB API v3**：官方电影数据库 API
- **静态部署**：纯静态网页，可部署到任何静态服务器

## 📱 浏览器兼容性

- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 79+

## 🌐 部署指南

本项目为纯静态网页，可以部署到任何静态网页托管服务：

### GitHub Pages
1. Fork 本项目
2. 在仓库设置中启用 GitHub Pages
3. 选择 main 分支作为源

### Netlify / Vercel
1. 连接 GitHub 仓库
2. 设置构建命令为空（纯静态项目）
3. 设置发布目录为 `/`

### 云存储静态托管
支持阿里云 OSS、腾讯云 COS、AWS S3 等云存储的静态网站托管功能。

## 🔧 配置说明

### API 配置
- API 密钥配置文件：`modules/api.js`
- API 基础 URL：`https://api.themoviedb.org/3`
- 语言设置：`zh-CN`（中文）

### 自定义设置
- 搜索历史条数：`modules/history.js` 中的 `MAX_HISTORY`（默认 10 条）
- 主题设置：自动保存在 localStorage 中

## 📖 使用说明

### 搜索功能
1. 在搜索框输入电影、电视剧或系列名称
2. 选择搜索类型（全部/电影/电视剧/系列）
3. 点击搜索按钮或按回车键

### 快捷操作
- **复制 ID**：点击"复制ID"按钮快速复制 TMDB ID
- **查看详情**：点击展开按钮查看详细信息
- **下载海报**：点击海报图片选择下载尺寸
- **TMDB 链接**：点击"在TMDB查看"跳转官网

## 🔄 更新日志

### v2.0.0 (2025-01-15)
- 🎯 采用 ES6 模块化重构项目
- ✨ 新增系列（Collection）搜索功能
- 📊 电视剧显示每季集数详情
- 🎨 优化返回顶部按钮位置（右侧中间）
- 🏗️ 代码结构优化，提升可维护性

### v1.0.0 (2025-01-08)
- 🎉 初始版本发布
- ✨ 实现基础搜索功能
- 🌓 添加暗黑模式
- 📝 添加搜索历史
- 🖼️ 支持海报下载

## 📝 开发计划

### 即将推出
- [ ] 高级筛选（年份、类型、评分）
- [ ] 收藏夹功能
- [ ] 批量导出功能
- [ ] 更多语言支持
- [ ] PWA 支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南
1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [The Movie Database (TMDB)](https://www.themoviedb.org/) 提供的 API 服务
- 所有贡献者和使用者的支持

---

⭐ 如果这个项目对你有帮助，请给一个 Star！