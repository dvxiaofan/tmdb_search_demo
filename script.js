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

// 输入框聚焦时的处理 - 合并历史显示和清除按钮检查
searchInput.addEventListener('focus', () => {
    // 检查是否需要显示清除按钮
    if (searchInput.value.trim().length > 0) {
        clearBtn.style.display = 'flex';
        clearBtn.classList.add('show');
    }
    
    // 显示历史记录（如果没有输入内容且没有结果）
    setTimeout(() => {
        if (!searchInput.value.trim() && !document.body.classList.contains('has-results')) {
            displayHistory();
        }
    }, 50);
});

// 点击外部隐藏历史和下载选项
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
    
    // 隐藏所有下载选项（除非点击的是选项本身）
    if (!e.target.closest('.poster-wrapper')) {
        document.querySelectorAll('.download-options').forEach(div => {
            div.style.display = 'none';
        });
    }
});

// 清除按钮功能（移除自动搜索）
searchInput.addEventListener('input', () => {
    const hasValue = searchInput.value.trim().length > 0;
    
    if (hasValue) {
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
        
        // 存储高清图片路径用于下载
        const hdPosterPath = item.poster_path 
            ? `https://image.tmdb.org/t/p/original${item.poster_path}`
            : '';
        
        const typeLabel = mediaType === 'movie' ? '电影' : '电视剧';
        const typeClass = mediaType === 'movie' ? 'type-movie' : 'type-tv';
        
        const tmdbUrl = mediaType === 'movie' 
            ? `https://www.themoviedb.org/movie/${item.id}`
            : `https://www.themoviedb.org/tv/${item.id}`;
        
        return `
            <div class="result-item" data-id="${item.id}" data-media-type="${mediaType}">
                <div class="result-main-content">
                    <div class="poster-wrapper">
                        <img src="${posterPath}" alt="${title}" class="poster" 
                             data-title="${title}" 
                             data-year="${year}" 
                             data-hd-poster="${hdPosterPath}"
                             data-poster-path="${item.poster_path || ''}"
                             title="点击下载高清图片">
                        <div class="download-hint">点击下载高清</div>
                        <div class="download-options" style="display: none;">
                            <button class="download-size-btn" data-size="w500">中等 (500px)</button>
                            <button class="download-size-btn" data-size="w780">大图 (780px)</button>
                            <button class="download-size-btn" data-size="original">原图 (最高清)</button>
                        </div>
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
                <button class="expand-btn" data-id="${item.id}" title="展开详细信息">
                    <span class="expand-icon">▼</span>
                </button>
                <div class="detail-panel">
                    <div class="detail-loading">
                        <div class="loading-spinner"></div>
                        <span>加载详细信息中...</span>
                    </div>
                    <div class="detail-content" style="display: none;">
                        <!-- 详细内容将在这里动态填充 -->
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
    
    // 添加图片下载事件监听器 - 支持多种尺寸选择
    resultsDiv.querySelectorAll('.poster').forEach(img => {
        img.addEventListener('click', function(e) {
            e.preventDefault();
            const posterWrapper = this.closest('.poster-wrapper');
            const optionsDiv = posterWrapper.querySelector('.download-options');
            
            // 切换选项显示
            if (optionsDiv.style.display === 'none') {
                // 隐藏所有其他的下载选项
                document.querySelectorAll('.download-options').forEach(div => {
                    div.style.display = 'none';
                });
                optionsDiv.style.display = 'flex';
            } else {
                optionsDiv.style.display = 'none';
            }
        });
    });
    
    // 添加尺寸选择按钮事件
    resultsDiv.querySelectorAll('.download-size-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const posterWrapper = this.closest('.poster-wrapper');
            const poster = posterWrapper.querySelector('.poster');
            const size = this.dataset.size;
            const posterPath = poster.dataset.posterPath;
            
            if (!posterPath) {
                showError('该项目没有可用的海报图片');
                return;
            }
            
            const imageUrl = `https://image.tmdb.org/t/p/${size}${posterPath}`;
            const sizeLabel = size === 'original' ? '原图' : size;
            downloadImage(imageUrl, poster.dataset.title, poster.dataset.year, sizeLabel);
            
            // 隐藏选项
            posterWrapper.querySelector('.download-options').style.display = 'none';
        });
    });
    
    // 添加展开按钮事件监听器
    resultsDiv.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const resultItem = this.closest('.result-item');
            const detailPanel = resultItem.querySelector('.detail-panel');
            const expandIcon = this.querySelector('.expand-icon');
            
            if (resultItem.classList.contains('expanded')) {
                // 收起
                resultItem.classList.remove('expanded');
                detailPanel.classList.remove('expanded');
                expandIcon.textContent = '▼';
                this.title = '展开详细信息';
            } else {
                // 展开
                resultItem.classList.add('expanded');
                detailPanel.classList.add('expanded');
                expandIcon.textContent = '▲';
                this.title = '收起详细信息';
                
                // 如果还没有加载详细信息，开始加载
                if (!resultItem.dataset.detailsLoaded) {
                    loadMovieDetails(resultItem);
                }
            }
        });
    });
}

// 加载影片详细信息
async function loadMovieDetails(resultItem) {
    const itemId = resultItem.dataset.id;
    const mediaType = resultItem.dataset.mediaType;
    const detailLoading = resultItem.querySelector('.detail-loading');
    const detailContent = resultItem.querySelector('.detail-content');
    
    try {
        // 显示加载状态
        detailLoading.style.display = 'flex';
        detailContent.style.display = 'none';
        
        // 根据媒体类型确定API端点
        const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
        
        // 并行请求详细信息、演员信息和相似推荐
        const [detailsRes, creditsRes, similarRes] = await Promise.all([
            fetch(`${BASE_URL}/${endpoint}/${itemId}?api_key=${API_KEY}&language=zh-CN`),
            fetch(`${BASE_URL}/${endpoint}/${itemId}/credits?api_key=${API_KEY}&language=zh-CN`),
            fetch(`${BASE_URL}/${endpoint}/${itemId}/similar?api_key=${API_KEY}&language=zh-CN`)
        ]);
        
        if (!detailsRes.ok || !creditsRes.ok || !similarRes.ok) {
            throw new Error('获取详细信息失败');
        }
        
        const [details, credits, similar] = await Promise.all([
            detailsRes.json(),
            creditsRes.json(),
            similarRes.json()
        ]);
        
        // 渲染详细信息
        renderMovieDetails(detailContent, details, credits, similar, mediaType);
        
        // 标记为已加载
        resultItem.dataset.detailsLoaded = 'true';
        
        // 显示内容，隐藏加载
        detailLoading.style.display = 'none';
        detailContent.style.display = 'block';
        
    } catch (error) {
        console.error('加载详细信息失败:', error);
        detailLoading.innerHTML = `
            <div class="error-message">
                <span>❌ 加载失败: ${error.message}</span>
                <button onclick="loadMovieDetails(this.closest('.result-item'))" class="retry-btn">重试</button>
            </div>
        `;
    }
}

// 渲染影片详细信息
function renderMovieDetails(container, details, credits, similar, mediaType) {
    // 获取基础信息
    const runtime = details.runtime || details.episode_run_time?.[0] || 0;
    const genres = details.genres?.map(g => g.name).join('、') || '未知';
    const rating = details.vote_average || 0;
    const voteCount = details.vote_count || 0;
    
    // 获取主要演员（前6位）
    const mainCast = credits.cast?.slice(0, 6) || [];
    
    // 获取相似推荐（前4部）
    const similarMovies = similar.results?.slice(0, 4) || [];
    
    const html = `
        <div class="detail-content-wrapper">
            <div class="movie-stats">
                <div class="stat-item">
                    <span class="stat-label">评分</span>
                    <span class="stat-value">${rating.toFixed(1)}/10 (${voteCount}人评价)</span>
                </div>
                ${runtime > 0 ? `
                    <div class="stat-item">
                        <span class="stat-label">时长</span>
                        <span class="stat-value">${runtime}分钟</span>
                    </div>
                ` : ''}
                <div class="stat-item">
                    <span class="stat-label">类型</span>
                    <span class="stat-value">${genres}</span>
                </div>
            </div>
            
            ${mainCast.length > 0 ? `
                <div class="cast-section">
                    <h4>主要演员</h4>
                    <div class="cast-list-compact">
                        ${mainCast.map(actor => `
                            <span class="cast-item-compact">
                                <strong>${actor.name}</strong> 饰 ${actor.character || '未知角色'}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${similarMovies.length > 0 ? `
                <div class="similar-section">
                    <h4>相似推荐</h4>
                    <div class="similar-list">
                        ${similarMovies.map(movie => {
                            const title = movie.title || movie.name;
                            const poster = movie.poster_path 
                                ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                                : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iOTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI5MCIgZmlsbD0iI2RkZCIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7ml6Dlm77niYc8L3RleHQ+Cjwvc3ZnPg==';
                            return `
                                <div class="similar-item">
                                    <img src="${poster}" alt="${title}" class="similar-poster">
                                    <div class="similar-info">
                                        <span class="similar-title">${title}</span>
                                        <span class="similar-rating">${(movie.vote_average || 0).toFixed(1)}★</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    container.innerHTML = html;
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

// 下载图片功能 - 增强版支持多种尺寸
async function downloadImage(imageUrl, title, year, sizeLabel = '') {
    try {
        // 如果是默认占位符图片，不允许下载
        if (imageUrl.startsWith('data:image/svg+xml')) {
            showError('无法下载占位符图片');
            return;
        }
        
        // 显示下载进度提示
        showDownloadProgress(sizeLabel);
        
        // 尝试多个代理服务
        const proxyUrls = [
            `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`,
            `https://cors-anywhere.herokuapp.com/${imageUrl}`
        ];
        
        let downloadSuccess = false;
        
        for (const proxyUrl of proxyUrls) {
            try {
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'image/*'
                    }
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    
                    // 检查是否真的是图片
                    if (blob.type.startsWith('image/')) {
                        triggerDownload(blob, title, year, sizeLabel);
                        downloadSuccess = true;
                        break;
                    }
                }
            } catch (proxyError) {
                console.log(`代理失败: ${proxyUrl}`, proxyError);
                continue;
            }
        }
        
        // 如果所有代理都失败，使用创建链接的方式
        if (!downloadSuccess) {
            // 创建一个隐藏的链接元素来触发下载
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `${title}${year ? '_' + year : ''}_${sizeLabel || 'poster'}.jpg`.replace(/[^\w\s-]/gi, '');
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            // 尝试通过链接下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 显示提示
            showDownloadAlternative(sizeLabel);
        }
        
    } catch (error) {
        console.error('下载失败:', error);
        // 提供备选方案
        fallbackDownload(imageUrl, title);
    }
}

// 触发文件下载
function triggerDownload(blob, title, year, sizeLabel) {
    const url = window.URL.createObjectURL(blob);
    
    // 创建下载链接
    const a = document.createElement('a');
    a.href = url;
    
    // 生成文件名，包含尺寸信息
    const sizeInfo = sizeLabel ? `_${sizeLabel}` : '';
    const fileName = `${title}${year ? '_' + year : ''}${sizeInfo}_poster.jpg`;
    a.download = fileName.replace(/[^\w\s-]/gi, ''); // 移除特殊字符
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // 清理URL对象
    window.URL.revokeObjectURL(url);
    
    // 显示成功提示
    showDownloadSuccess(sizeLabel);
}

// 备选下载方案
function fallbackDownload(imageUrl, title) {
    // 在新标签页打开图片
    window.open(imageUrl, '_blank');
    
    // 显示提示
    const toast = document.createElement('div');
    toast.className = 'download-toast fallback';
    toast.innerHTML = `
        <div>图片已在新标签页打开</div>
        <small>右键点击图片选择"另存为"保存</small>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// 显示下载进度提示
function showDownloadProgress(sizeLabel) {
    const existingToast = document.querySelector('.download-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'download-toast progress';
    const sizeText = sizeLabel ? `(${sizeLabel})` : '';
    toast.innerHTML = `
        <span>正在下载图片 ${sizeText}</span>
        <div class="download-progress-bar"></div>
    `;
    document.body.appendChild(toast);
}

// 显示下载成功提示
function showDownloadSuccess(sizeLabel) {
    const existingToast = document.querySelector('.download-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'download-toast success';
    const sizeText = sizeLabel ? `(${sizeLabel})` : '';
    toast.textContent = `图片下载成功 ${sizeText}`;
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

// 显示备选下载方式提示
function showDownloadAlternative(sizeLabel) {
    const existingToast = document.querySelector('.download-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'download-toast alternative';
    const sizeText = sizeLabel ? `(${sizeLabel})` : '';
    toast.innerHTML = `
        <div>图片已在新标签页打开 ${sizeText}</div>
        <small>请右键保存图片或等待自动下载</small>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function showLoading(show) {
    if (show) {
        // 显示骨架屏
        loadingDiv.innerHTML = `
            <div class="skeleton-container">
                ${Array(3).fill('').map(() => `
                    <div class="skeleton-item">
                        <div class="skeleton-poster"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-meta"></div>
                            <div class="skeleton-text"></div>
                            <div class="skeleton-text"></div>
                            <div class="skeleton-text"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        loadingDiv.classList.remove('hidden');
    } else {
        loadingDiv.classList.add('hidden');
        loadingDiv.innerHTML = '';
    }
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
    
    // 确保清除按钮正确初始化 - 不要重新声明变量
    if (clearBtn) {
        clearBtn.style.display = 'none';
        clearBtn.classList.remove('show');
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
        clearBtn.style.display = 'flex';
        clearBtn.classList.add('show');
    }
    
    // 确保搜索历史初始状态是隐藏的
    searchHistory.classList.add('hidden');
    searchHistory.style.display = 'none';
});

// 键盘快捷键支持
document.addEventListener('keydown', (e) => {
    // 按 / 聚焦搜索框（排除已在输入框的情况）
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
    }
    
    // 按 Escape 清空搜索/关闭结果
    if (e.key === 'Escape') {
        if (searchInput.value.trim()) {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            clearBtn.classList.remove('show');
            clearResults();
            hideError();
            document.body.classList.remove('has-results');
            resultsWrapper.classList.add('hidden');
            setTimeout(() => {
                displayHistory();
            }, 100);
        }
        searchInput.blur(); // 失去焦点
    }
    
    // Ctrl/Cmd + K 快速搜索
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
    }
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