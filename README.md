# TMDB Search Tool

一个简洁优雅的 TMDB（The Movie Database）搜索工具，帮助快速查询电影和电视剧的 TMDB ID。

## ✨ 功能特点

- 🔍 **快速搜索** - 支持电影和电视剧的实时搜索
- 📋 **ID 复制** - 一键复制 TMDB ID 到剪贴板
- 🖼️ **海报下载** - 支持多种尺寸的海报下载（w185, w342, w500, w780, original）
- 📝 **搜索历史** - 自动保存最近 10 条搜索记录
- 🌓 **暗黑模式** - 支持明暗主题切换，保护眼睛
- ⌨️ **快捷键支持** - 按 `/` 或 `Ctrl+K` 快速聚焦搜索框
- 📱 **响应式设计** - 完美适配桌面和移动设备

## 🚀 快速开始

### 在线访问

访问 [在线演示](https://your-github-username.github.io/tmdb_search_demo/) （需要部署到 GitHub Pages）

### 本地运行

1. 克隆仓库
```bash
git clone https://github.com/your-username/tmdb_search_demo.git
cd tmdb_search_demo
```

2. 直接在浏览器中打开 `index.html` 文件即可使用

> 💡 提示：本项目为纯前端实现，无需安装依赖或构建工具

## 🔧 配置

### API 密钥

项目已内置 TMDB API 密钥用于演示。如需使用自己的密钥：

1. 访问 [TMDB API](https://www.themoviedb.org/settings/api) 获取 API 密钥
2. 修改 `script.js` 文件中的 `API_KEY` 变量

```javascript
const API_KEY = 'your_api_key_here';
```

## 📖 使用说明

### 搜索功能
1. 在搜索框输入电影或电视剧名称
2. 选择搜索类型（全部/电影/电视剧）
3. 点击搜索按钮或按回车键

### 快捷键
- `/` 或 `Ctrl+K` - 快速聚焦搜索框
- `Esc` - 清空搜索内容
- `Enter` - 执行搜索

### 搜索结果操作
- 点击 ID 标签复制 TMDB ID
- 点击海报查看大图
- 使用下载菜单选择不同尺寸下载海报

## 🏗️ 技术栈

- **前端框架**: 原生 JavaScript (ES6+)
- **样式**: 纯 CSS3 with CSS Variables
- **API**: TMDB API v3
- **存储**: LocalStorage (搜索历史和主题设置)

## 📁 项目结构

```
tmdb_search_demo/
├── index.html              # 主页面
├── script.js               # 核心功能逻辑
├── style.css               # 样式文件
├── OPTIMIZATION_ROADMAP.md # 优化计划文档
└── README.md              # 项目说明文档
```

## 🎯 特性亮点

### 性能优化
- 图片懒加载
- 防抖搜索输入
- 结果分页加载

### 用户体验
- 搜索历史快速访问
- 错误提示友好
- 加载状态反馈
- 平滑动画过渡

### 可访问性
- 键盘导航支持
- ARIA 标签
- 高对比度模式兼容

## 🔄 更新日志

### v1.0.0 (2025-01-08)
- 🎉 初始版本发布
- ✨ 实现基础搜索功能
- 🌓 添加暗黑模式
- 📝 添加搜索历史
- 🖼️ 支持海报下载

## 📝 开发计划

查看 [OPTIMIZATION_ROADMAP.md](./OPTIMIZATION_ROADMAP.md) 了解详细的优化计划和未来功能。

### 即将推出
- [ ] 高级筛选（年份、类型、评分）
- [ ] 收藏夹功能
- [ ] 批量导出功能
- [ ] 更多语言支持

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

- [TMDB](https://www.themoviedb.org/) - 提供电影数据 API
- 所有贡献者和用户的支持

## 📧 联系方式

- 项目地址: [https://github.com/your-username/tmdb_search_demo](https://github.com/your-username/tmdb_search_demo)
- Issue 反馈: [https://github.com/your-username/tmdb_search_demo/issues](https://github.com/your-username/tmdb_search_demo/issues)

---

⭐ 如果这个项目对你有帮助，请给一个 Star！