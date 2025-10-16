// UI 渲染相关功能
import { getDetails } from './api.js';
import { renderCollectionDetails, renderMovieDetails } from './details.js';
import { copyToClipboard, downloadImage } from './utils.js';

// DOM 元素
export function getElements() {
    return {
        searchInput: document.getElementById('searchInput'),
        searchBtn: document.getElementById('searchBtn'),
        clearBtn: document.getElementById('clearBtn'),
        resultsDiv: document.getElementById('results'),
        resultsWrapper: document.getElementById('resultsWrapper'),
        loadingDiv: document.getElementById('loading'),
        errorDiv: document.getElementById('error'),
        searchHistory: document.getElementById('searchHistory'),
        historyList: document.getElementById('historyList'),
        clearHistoryBtn: document.getElementById('clearHistory'),
        darkModeToggle: document.getElementById('darkModeToggle'),
        backToTopBtn: document.getElementById('backToTop')
    };
}

// 显示加载状态
export function showLoading(show) {
    const { loadingDiv } = getElements();
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

// 显示错误信息
export function showError(message) {
    const { errorDiv } = getElements();
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// 隐藏错误信息
export function hideError() {
    const { errorDiv } = getElements();
    errorDiv.classList.add('hidden');
}

// 清空结果
export function clearResults() {
    const { resultsDiv, resultsWrapper } = getElements();
    resultsDiv.innerHTML = '';
    resultsWrapper.classList.add('hidden');
    document.body.classList.remove('has-results');
}

// 显示搜索结果
export function displayResults(results) {
    const { resultsDiv, resultsWrapper } = getElements();

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
        // 检测是否为系列
        const isCollection = item.hasOwnProperty('poster_path') && item.hasOwnProperty('backdrop_path') &&
                           !item.hasOwnProperty('media_type') && !item.hasOwnProperty('title') &&
                           !item.hasOwnProperty('release_date') && !item.hasOwnProperty('first_air_date');
        const mediaType = isCollection ? 'collection' : (item.media_type || (item.title ? 'movie' : 'tv'));
        const title = item.title || item.name;
        const releaseDate = item.release_date || item.first_air_date;
        const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
        const posterPath = item.poster_path || item.backdrop_path
            ? `https://image.tmdb.org/t/p/w200${item.poster_path || item.backdrop_path}`
            : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNkZGQiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+5peg5Zu+54mHPC90ZXh0Pgo8L3N2Zz4=';

        // 存储高清图片路径用于下载
        const hdPosterPath = item.poster_path || item.backdrop_path
            ? `https://image.tmdb.org/t/p/original${item.poster_path || item.backdrop_path}`
            : '';

        const typeLabel = mediaType === 'movie' ? '电影' : (mediaType === 'tv' ? '电视剧' : '系列');
        const typeClass = mediaType === 'movie' ? 'type-movie' : (mediaType === 'tv' ? 'type-tv' : 'type-collection');

        const tmdbUrl = mediaType === 'movie'
            ? `https://www.themoviedb.org/movie/${item.id}`
            : (mediaType === 'tv'
                ? `https://www.themoviedb.org/tv/${item.id}`
                : `https://www.themoviedb.org/collection/${item.id}`);

        return `
            <div class="result-item" data-id="${item.id}" data-media-type="${mediaType}">
                <div class="result-main-content">
                    <div class="poster-wrapper">
                        <img src="${posterPath}" alt="${title}" class="poster"
                             data-title="${title}"
                             data-year="${year}"
                             data-hd-poster="${hdPosterPath}"
                             data-poster-path="${item.poster_path || item.backdrop_path || ''}"
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
                            <span class="tmdb-id">${mediaType === 'collection' ? 'Collection' : 'TMDB'} ID: <strong>${item.id}</strong></span>
                        </div>
                        <p class="overview">${item.overview || '暂无简介'}</p>
                        <div class="actions">
                            <button class="copy-btn" data-id="${item.id}">复制ID</button>
                            <button class="copy-tmdb-btn" data-id="${item.id}">复制[ID]</button>
                            <button class="copy-full-btn" data-id="${item.id}" data-title="${title}" data-year="${year}">复制名字-ID</button>
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

    // 绑定事件监听器
    bindResultEvents();
}

// 绑定结果事件
function bindResultEvents() {
    const { resultsDiv } = getElements();

    // 添加复制按钮事件监听器 - 复制ID
    resultsDiv.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            copyToClipboard(id, this);
        });
    });

    // 添加复制 [tmdb=ID] 格式按钮
    resultsDiv.querySelectorAll('.copy-tmdb-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const text = `[tmdb=${id}]`;
            copyToClipboard(text, this);
        });
    });

    // 添加复制 "名字-年份-[tmdb=ID]" 格式按钮
    resultsDiv.querySelectorAll('.copy-full-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const title = this.dataset.title;
            const year = this.dataset.year;
            const text = `${title}${year ? `-${year}` : ''}-[tmdb=${id}]`;
            copyToClipboard(text, this);
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
        btn.addEventListener('click', async function(e) {
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
                    await loadMovieDetails(resultItem);
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

        const data = await getDetails(itemId, mediaType);

        if (mediaType === 'collection') {
            renderCollectionDetails(detailContent, data.details);
        } else {
            renderMovieDetails(detailContent, data.details, data.credits, data.similar, mediaType);
        }

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