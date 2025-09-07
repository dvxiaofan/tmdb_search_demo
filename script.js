const API_KEY = 'f67cfcb63ecbb9e50c7a4adb2e01aea1';
const BASE_URL = 'https://api.themoviedb.org/3';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsDiv = document.getElementById('results');
const resultsWrapper = document.getElementById('resultsWrapper');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const searchHistory = document.getElementById('searchHistory');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');
const darkModeToggle = document.getElementById('darkModeToggle');

// 搜索历史管理
const HISTORY_KEY = 'tmdb_search_history';
const MAX_HISTORY = 10;

// 暗黑模式管理
const DARK_MODE_KEY = 'tmdb_dark_mode';

// 暗黑模式功能
function initDarkMode() {
    const isDarkMode = localStorage.getItem(DARK_MODE_KEY) === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeToggle(true);
    }
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem(DARK_MODE_KEY, isDarkMode);
    updateDarkModeToggle(isDarkMode);
}

function updateDarkModeToggle(isDarkMode) {
    const toggleIcon = darkModeToggle.querySelector('.toggle-icon');
    toggleIcon.textContent = isDarkMode ? '☀️' : '🌙';
    darkModeToggle.title = isDarkMode ? '切换亮色模式' : '切换暗黑模式';
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return history;
}

function saveHistory(query) {
    let history = loadHistory();
    // 移除重复项
    history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
    // 添加到开头
    history.unshift(query);
    // 限制数量
    if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    displayHistory();
}

function displayHistory() {
    const history = loadHistory();
    if (history.length === 0) {
        searchHistory.classList.add('hidden');
        searchHistory.style.display = 'none';
        return;
    }
    
    // 确保历史记录面板显示
    searchHistory.style.display = 'block';
    searchHistory.classList.remove('hidden');
    
    historyList.innerHTML = history.map(item => `
        <button class="history-item" data-query="${item}">
            <span>${item}</span>
            <span class="history-remove" data-query="${item}">×</span>
        </button>
    `).join('');
    
    // 添加点击事件
    historyList.querySelectorAll('.history-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!e.target.classList.contains('history-remove')) {
                searchInput.value = btn.dataset.query;
                performSearch();
            }
        });
    });
    
    // 添加删除单个历史事件
    historyList.querySelectorAll('.history-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeHistoryItem(btn.dataset.query);
        });
    });
}

function removeHistoryItem(query) {
    let history = loadHistory();
    history = history.filter(item => item !== query);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    displayHistory();
}

// 清空历史
clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem(HISTORY_KEY);
    searchHistory.classList.add('hidden');
});

// 输入框聚焦时显示历史
searchInput.addEventListener('focus', () => {
    setTimeout(() => {
        if (!searchInput.value.trim() && !document.body.classList.contains('has-results')) {
            displayHistory();
        }
    }, 50);
});

// 点击外部隐藏历史
document.addEventListener('mousedown', (e) => {
    // 使用 mousedown 而不是 click，避免与 focus 事件冲突
    // 检查是否点击了暗黑模式按钮或其子元素
    const isDarkModeToggleClick = darkModeToggle.contains(e.target) || e.target === darkModeToggle;
    
    if (!searchHistory.contains(e.target) && 
        !searchInput.contains(e.target) && 
        !isDarkModeToggleClick &&
        e.target !== searchInput) {
        setTimeout(() => {
            searchHistory.classList.add('hidden');
        }, 100);
    }
});

// 清除按钮功能
searchInput.addEventListener('input', () => {
    if (searchInput.value.trim()) {
        clearBtn.style.display = 'flex';
        clearBtn.classList.add('show');
        searchHistory.classList.add('hidden');
    } else {
        clearBtn.style.display = 'none';
        clearBtn.classList.remove('show');
        if (!document.body.classList.contains('has-results')) {
            displayHistory();
        }
    }
});

clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    clearBtn.classList.remove('show');
    searchInput.focus();
    clearResults();
    hideError();
    // 移除结果状态
    document.body.classList.remove('has-results');
    resultsWrapper.classList.add('hidden');
    // 显示历史记录
    setTimeout(() => {
        displayHistory();
    }, 100);
});

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// 暗黑模式切换事件监听器
darkModeToggle.addEventListener('click', toggleDarkMode);

async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        showError('请输入搜索内容');
        return;
    }
    
    // 保存到历史记录
    saveHistory(query);
    // 隐藏历史记录面板
    searchHistory.classList.add('hidden');
    
    const mediaType = document.querySelector('input[name="mediaType"]:checked').value;
    
    showLoading(true);
    hideError();
    clearResults();
    
    try {
        let endpoint;
        if (mediaType === 'multi') {
            endpoint = `${BASE_URL}/search/multi`;
        } else if (mediaType === 'movie') {
            endpoint = `${BASE_URL}/search/movie`;
        } else {
            endpoint = `${BASE_URL}/search/tv`;
        }
        
        const response = await fetch(`${endpoint}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=zh-CN`);
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('API密钥无效，请设置正确的TMDB API密钥');
            }
            throw new Error('搜索失败');
        }
        
        const data = await response.json();
        displayResults(data.results);
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

function displayResults(results) {
    if (!results || results.length === 0) {
        resultsDiv.innerHTML = '<p class="no-results">没有找到相关结果</p>';
        // 先显示容器
        resultsWrapper.classList.remove('hidden');
        // 触发动画
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.add('has-results');
            });
        });
        return;
    }
    
    const resultsHTML = results.map(item => {
        const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
        const title = item.title || item.name;
        const releaseDate = item.release_date || item.first_air_date;
        const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
        const posterPath = item.poster_path 
            ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
            : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNkZGQiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+5peg5Zu+54mHPC90ZXh0Pgo8L3N2Zz4=';
        
        const typeLabel = mediaType === 'movie' ? '电影' : '电视剧';
        const typeClass = mediaType === 'movie' ? 'type-movie' : 'type-tv';
        
        const tmdbUrl = mediaType === 'movie' 
            ? `https://www.themoviedb.org/movie/${item.id}`
            : `https://www.themoviedb.org/tv/${item.id}`;
        
        return `
            <div class="result-item">
                <div class="poster-wrapper">
                    <img src="${posterPath}" alt="${title}" class="poster" data-title="${title}" data-year="${year}" title="点击下载图片">
                    <div class="download-hint">点击下载</div>
                </div>
                <div class="result-info">
                    <h3>${title} ${year ? `(${year})` : ''}</h3>
                    <div class="meta">
                        <span class="type ${typeClass}">${typeLabel}</span>
                        <span class="tmdb-id">TMDB ID: <strong>${item.id}</strong></span>
                    </div>
                    <p class="overview">${item.overview || '暂无简介'}</p>
                    <div class="actions">
                        <button class="copy-btn" data-id="${item.id}">复制ID</button>
                        <a href="${tmdbUrl}" target="_blank" class="tmdb-link">在TMDB查看</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    resultsDiv.innerHTML = resultsHTML;
    
    // 先显示容器，让宽度动画和位置动画同步
    resultsWrapper.classList.remove('hidden');
    // 稍微延迟触发动画类，确保过渡效果生效
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.add('has-results');
        });
    });
    
    // 添加复制按钮事件监听器
    resultsDiv.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            copyToClipboard(id, this);
        });
    });
    
    // 添加图片下载事件监听器
    resultsDiv.querySelectorAll('.poster').forEach(img => {
        img.addEventListener('click', function() {
            downloadImage(this.src, this.dataset.title, this.dataset.year);
        });
    });
}

function copyToClipboard(id, button) {
    // 创建临时文本输入框
    const tempInput = document.createElement('input');
    tempInput.value = id;
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    document.body.appendChild(tempInput);
    
    // 选择并复制文本
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // 移动端兼容
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            const originalText = button.textContent;
            button.textContent = '已复制!';
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        } else {
            showError('复制失败，请手动复制');
        }
    } catch (err) {
        // 如果document.execCommand也失败，尝试使用Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(id).then(() => {
                const originalText = button.textContent;
                button.textContent = '已复制!';
                button.classList.add('copied');
                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove('copied');
                }, 2000);
            }).catch(() => {
                showError('复制失败，请手动复制');
            });
        } else {
            showError('复制失败，请手动复制');
        }
    }
    
    // 移除临时输入框
    document.body.removeChild(tempInput);
}

// 下载图片功能
async function downloadImage(imageUrl, title, year) {
    try {
        // 如果是默认占位符图片，不允许下载
        if (imageUrl.startsWith('data:image/svg+xml')) {
            showError('无法下载占位符图片');
            return;
        }
        
        // 通过代理服务器获取图片，解决跨域问题
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error('图片下载失败');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // 创建下载链接
        const a = document.createElement('a');
        a.href = url;
        
        // 生成文件名
        const fileName = `${title}${year ? '_' + year : ''}_poster.jpg`;
        a.download = fileName.replace(/[^\w\s-]/gi, ''); // 移除特殊字符
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // 清理URL对象
        window.URL.revokeObjectURL(url);
        
        // 显示成功提示
        showDownloadSuccess();
        
    } catch (error) {
        console.error('下载失败:', error);
        showError('图片下载失败，请稍后重试');
    }
}

// 显示下载成功提示
function showDownloadSuccess() {
    const toast = document.createElement('div');
    toast.className = 'download-toast';
    toast.textContent = '图片下载中...';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 2000);
}

function showLoading(show) {
    loadingDiv.classList.toggle('hidden', !show);
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

function clearResults() {
    resultsDiv.innerHTML = '';
    resultsWrapper.classList.add('hidden');
    document.body.classList.remove('has-results');
}

// 页面加载时检查输入框
window.addEventListener('load', () => {
    // 初始化暗黑模式
    initDarkMode();
    
    // 确保清除按钮正确初始化
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
    
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('请先在script.js文件中设置您的TMDB API密钥');
        resultsDiv.innerHTML = `
            <div class="api-setup">
                <h3>如何获取API密钥：</h3>
                <ol>
                    <li>访问 <a href="https://www.themoviedb.org/settings/api" target="_blank">TMDB API设置页面</a></li>
                    <li>登录或注册账号</li>
                    <li>申请API密钥（选择Developer选项）</li>
                    <li>将获得的API Key (v3 auth)复制到script.js文件第1行</li>
                </ol>
            </div>
        `;
    }
    
    // 检查输入框是否有初始值
    if (searchInput && searchInput.value.trim()) {
        clearBtn.classList.add('show');
        clearBtn.style.display = 'flex';
    }
    
    // 确保搜索历史初始状态是隐藏的
    searchHistory.classList.add('hidden');
    searchHistory.style.display = 'none';
});

// 返回顶部按钮功能
const backToTopBtn = document.getElementById('backToTop');

// 监听滚动事件
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

// 点击返回顶部
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});