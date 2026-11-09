# TMDB ID 查询工具

一个简洁优雅的 TMDB（The Movie Database）ID 查询工具，用于快速查找电影、电视剧和系列的 TMDB ID。

## ✨ 功能特性

### 核心功能
- 🔍 **多类型搜索**：支持搜索电影、电视剧、系列（Collection）或全部类型
- 📋 **快速复制 ID**：一键复制 TMDB ID 到剪贴板
- 🖼️ **海报下载**：支持多种尺寸的海报图片下载（中等 500px、大图 780px、原图最高清）
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

---

## 🌐 线上部署

**生产环境**：https://tmdb.ccucc.de5.net/

- **部署平台**：Cloudflare Pages（项目 `cctmdbsearch`，自定义域名 + 橙云 CDN）
- **发布方式**：Cloudflare Pages 直接上传（`ad_hoc` 部署）。GitHub 仅保存代码，`git push` **不会**自动发布，需要手动执行下面的 `wrangler` 命令或在 Dashboard 上传
- **缓存策略**：HTML `public, max-age=0, must-revalidate`；JS/CSS `public, max-age=14400, must-revalidate`。Pages 部署成功后，浏览器或边缘节点仍可能继续使用旧 JS 最长 4 小时，强制刷新（`Cmd+Shift+R`）不一定能绕过边缘缓存
- **HTTPS**：Cloudflare 自动签发证书，强制 HTTPS

---

## 🚀 快速开始

### 本地开发

```bash
# 1. 克隆项目
git clone git@github.com:dvxiaofan/tmdb_search_demo.git
cd tmdb_search_demo

# 2. 启动本地服务器（ES6 模块需要 HTTP 协议，不能直接双击 index.html）
python3 -m http.server 8000
# 或 npx serve
# 或 VS Code Live Server 插件

# 3. 访问 http://localhost:8000
```

### API 密钥（已内置）

项目 `modules/api.js` 已配置可用的 TMDB API Key（v3 auth）：
```javascript
export const API_KEY = 'f67cfcb63ecbb9e50c7a4adb2e01aea1';
```
> 如需更换：访问 [TMDB API 设置](https://www.themoviedb.org/settings/api) 申请 Developer Key，替换该行即可。

---

## 📁 项目结构

```
tmdb_search_demo/
├── index.html          # 主页面（2.8 KB）
├── main.js             # 入口文件（7.4 KB）——初始化、事件绑定、全局快捷键
├── style.css           # 样式文件（36.5 KB）——CSS 变量主题、响应式、动画
├── modules/            # ES6 模块（按职责拆分）
│   ├── api.js          # TMDB API 封装（搜索、详情、演员、相似推荐）
│   ├── ui.js           # 结果渲染、事件绑定（下载菜单、展开面板、复制 ID）
│   ├── details.js      # 电影/电视剧/系列详情 HTML 生成
│   ├── utils.js        # 下载核心：直连 TMDB + Accept: image/jpeg + MIME 决定扩展名 + 兜底
│   ├── history.js      # localStorage 搜索历史（最多 10 条）
│   └── theme.js        # 暗黑模式切换 + localStorage 持久化
├── LICENSE             # MIT
└── README.md           # 本文件
```

---

## 🛠️ 技术栈

- **原生 JavaScript (ES6+)**：模块化开发，无框架、无构建工具
- **原生 CSS3**：CSS 变量、Grid、Flexbox、媒体查询
- **TMDB API v3**：官方电影数据库 API，语言 `zh-CN`
- **纯静态部署**：任意静态服务器均可托管

---

## 📦 部署运维指南（给后续 AI / 维护者）

### 当前部署架构

```
GitHub (dvxiaofan/tmdb_search_demo, main)
     │
     │ 仅保存代码，push 不触发部署
     ▼
本地项目根目录
     │
     │ npx wrangler pages deploy . --project-name cctmdbsearch
     │
     ▼
Cloudflare Pages (Project: cctmdbsearch)
     │
     │ 自定义域名 tmdb.ccucc.de5.net + CNAME 到 <project>.pages.dev
     │ 橙云代理（CDN + WAF + 缓存）
     ▼
用户访问 https://tmdb.ccucc.de5.net/
```

### 部署流程（手动发布）

1. 本地改代码并测试
2. `git commit`、`git push origin main`（只同步 GitHub，不触发 Pages 部署）
3. 在项目根目录手动发布：

```bash
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... \
npx wrangler pages deploy . --project-name cctmdbsearch --branch main \
  --commit-hash "$(git rev-parse HEAD)" --commit-message "$(git log -1 --pretty=%s)"
```

4. 在 Dashboard 的 Deployments 确认最新部署的 Commit 与 `origin/main` 一致
5. 验证线上资源是否已更新：

```bash
curl -s https://tmdb.ccucc.de5.net/modules/utils.js | grep "getImageExtension"
```

没有输出说明线上仍是旧版，需要检查部署状态或清理 Cloudflare 缓存。

> ⚠️ **无 GitHub Actions / Workflows**，该项目也没有连接 Pages 的 GitHub「Git 集成」，必须手动发布。

### 回滚

Cloudflare Pages Dashboard → Deployments → 任意历史部署 → `Rollback`（秒级生效）。

### 修改自定义域名 / SSL

Cloudflare Pages Dashboard → Custom domains → 添加/删除域名，自动申请证书。

### 环境变量 / 构建设置

- **构建命令**：`（留空）`
- **构建输出目录**：`/`（根目录）
- **环境变量**：运行时无需配置。API Key 会随前端源码公开，不能写入 TMDB 数据，但可能被他人调用并耗尽请求配额。生产环境建议通过 Cloudflare Worker 代理并限流；Key 一旦进入 Git 历史，轮换只能降低滥用风险，无法从历史中删除。手动发布时需要 `CLOUDFLARE_API_TOKEN`（Pages Edit 权限）和 `CLOUDFLARE_ACCOUNT_ID`

---

## 🔧 关键模块逻辑速览

| 模块 | 核心职责 | 关键函数/导出 |
|---|---|---|
| `api.js` | TMDB REST 封装 | `searchTMDB(query, type)`、`getDetails(id, type)` |
| `ui.js` | 结果列表渲染、交互绑定 | `displayResults()`、`bindResultEvents()` |
| `details.js` | 详情面板 HTML 生成 | `renderMovieDetails()`、`renderCollectionDetails()` |
| `utils.js` | **海报下载核心** | `downloadImage(url, title, year, sizeLabel)` |
| `history.js` | 搜索历史本地存储 | `saveHistory()`、`displayHistory()` |
| `theme.js` | 暗黑模式切换 | `initDarkMode()`、`initThemeEvents()` |

### 下载逻辑（`utils.js` 关键变更点）

- **直连 TMDB**：`fetch(imageUrl, { headers: { Accept: 'image/jpeg' } })`，不再走第三方 CORS 代理。依赖图片 CDN 当前返回的 `access-control-allow-origin: *`；如果 CORS 策略变化，需要改走自建代理
- **20s 超时控制**：`AbortController` 防止挂起
- **MIME 决定扩展名**：`image/jpeg→jpg`、`image/webp→webp`、`image/png→png`… 避免「下载 .jpg 实为 WebP」
- **文件名规则**：`${title}_${year}_${sizeLabel}_poster.${ext}`，非法字符替换为 `_`，长度 ≤ 150
- **兜底**：直连失败 → `window.open(url)` 新标签页 + 提示「右键另存为」

---

## 📱 浏览器兼容性

| 浏览器 | 最低版本 | 备注 |
|---|---|---|
| Chrome | 80+ | 可选链、AbortController、fetch |
| Firefox | 74+ | 可选链、AbortController |
| Safari / iOS Safari | 14.1+ | JS 基线 13.1+，flex `gap` 需要 14.1+ |
| Edge | 80+ | Chromium 内核 |

---

## 🔄 更新日志

### v2.1.0 (2026-11-09)
- 🐛 **修复海报下载失败及格式不一致问题**
  - 移除 3 个不稳定的 CORS 代理，改为直连 TMDB + 显式 `Accept: image/jpeg`
  - 新增 20s 超时控制（`AbortController`）
  - 新增 `getImageExtension()`：按实际 MIME 类型决定文件扩展名
  - 新增 `buildFileName()`：保留中文、安全过滤、长度限制
  - 统一兜底路径为「新标签页打开 + 右键保存提示」

### v2.0.0 (2025-09-15)
- 🎯 采用 ES6 模块化重构项目（`1e12446`）
- ✨ 新增系列（Collection）搜索功能
- 📊 电视剧显示每季集数详情
- 🎨 优化返回顶部按钮位置（右侧中间）
- 🏗️ 代码结构优化，提升可维护性

### v1.0.0 (2025-09-06)
- 🎉 初始版本发布
- ✨ 实现基础搜索功能
- 🌓 添加暗黑模式
- 📝 添加搜索历史
- 🖼️ 支持海报下载

---

## 🛡️ 常见问题排查

| 现象 | 原因 | 处理 |
|---|---|---|
| 点击下载无反应 / 报错 | TMDB 限流 / 网络波动 | 刷新重试；或右键海报「在新标签页打开图片」手动保存 |
| 线上改了代码不生效 | 未手动发布 / 边缘缓存 4h | 按上面的 `wrangler` 命令发布，确认 Deployments 的 Commit 与 `origin/main` 一致；部署成功后仍是旧版则清理缓存，并用上面的 `curl` 命令验证 |
| 搜索无结果 / 报 401、429 | API Key 失效、额度或频率受限 | 换新 Key 替换 `modules/api.js` 第 2 行；429 时降低请求频率或加代理限流 |
| 本地 `file://` 打开白屏 | ES6 Module 需 HTTP 协议 | 必须用 `python3 -m http.server` / `npx serve` 等本地服务器 |

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

```bash
git checkout -b feature/xxx
git commit -m 'feat: xxx'
git push origin feature/xxx
# 开 PR
```

---

## 📄 许可证

MIT License — 查看 [LICENSE](LICENSE)

---

## 🙏 致谢

- [The Movie Database (TMDB)](https://www.themoviedb.org/) 提供的 API 服务
- 所有贡献者和使用者的支持

---

⭐ 如果这个项目对你有帮助，请给一个 Star！
