// 主入口文件
import { API_KEY, searchTMDB } from './modules/api.js';
import {
    getElements,
    showLoading,
    showError,
    hideError,
    clearResults,
    displayResults
} from './modules/ui.js';
import { saveHistory, displayHistory, initHistoryEvents } from './modules/history.js';
import { initDarkMode, initThemeEvents } from './modules/theme.js';

// 执行搜索
export async function performSearch() {
    const { searchInput } = getElements();
    const query = searchInput.value.trim();

    if (!query) {
        showError('请输入搜索内容');
        return;
    }

    // 保存到历史记录
    saveHistory(query);
    // 隐藏历史记录面板
    const { searchHistory } = getElements();
    searchHistory.classList.add('hidden');

    const mediaType = document.querySelector('input[name="mediaType"]:checked').value;

    showLoading(true);
    hideError();
    clearResults();

    try {
        const data = await searchTMDB(query, mediaType);
        displayResults(data.results);
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// 初始化搜索相关事件
function initSearchEvents() {
    const { searchBtn, searchInput, clearBtn } = getElements();

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // 输入框聚焦时的处理
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

    // 清除按钮功能
    searchInput.addEventListener('input', () => {
        const hasValue = searchInput.value.trim().length > 0;

        if (hasValue) {
            clearBtn.style.display = 'flex';
            clearBtn.classList.add('show');
            const { searchHistory } = getElements();
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
        const { resultsWrapper } = getElements();
        resultsWrapper.classList.add('hidden');
        // 显示历史记录
        setTimeout(() => {
            displayHistory();
        }, 100);
    });
}

// 初始化全局事件
function initGlobalEvents() {
    const { searchHistory, searchInput, darkModeToggle } = getElements();

    // 点击外部隐藏历史和下载选项
    document.addEventListener('mousedown', (e) => {
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
            const { clearBtn, resultsWrapper } = getElements();
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
    const { backToTopBtn } = getElements();

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
}

// 初始化应用
function initApp() {
    const { clearBtn, searchInput, resultsDiv, errorDiv } = getElements();

    // 初始化暗黑模式
    initDarkMode();

    // 确保清除按钮正确初始化
    if (clearBtn) {
        clearBtn.style.display = 'none';
        clearBtn.classList.remove('show');
    }

    // 检查API密钥
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('请先在modules/api.js文件中设置您的TMDB API密钥');
        resultsDiv.innerHTML = `
            <div class="api-setup">
                <h3>如何获取API密钥：</h3>
                <ol>
                    <li>访问 <a href="https://www.themoviedb.org/settings/api" target="_blank">TMDB API设置页面</a></li>
                    <li>登录或注册账号</li>
                    <li>申请API密钥（选择Developer选项）</li>
                    <li>将获得的API Key (v3 auth)复制到modules/api.js文件第2行</li>
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
    const { searchHistory } = getElements();
    searchHistory.classList.add('hidden');
    searchHistory.style.display = 'none';

    // 初始化各个模块事件
    initSearchEvents();
    initHistoryEvents();
    initThemeEvents();
    initGlobalEvents();
}

// 页面加载完成后初始化
window.addEventListener('load', initApp);