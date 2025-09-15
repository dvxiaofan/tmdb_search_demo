// 搜索历史管理功能
import { getElements } from './ui.js';

const HISTORY_KEY = 'tmdb_search_history';
const MAX_HISTORY = 10;

// 加载历史记录
export function loadHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return history;
}

// 保存历史记录
export function saveHistory(query) {
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

// 显示历史记录
export function displayHistory() {
    const { searchHistory, historyList, searchInput } = getElements();
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
                // 触发搜索 - 通过触发按钮点击事件
                document.getElementById('searchBtn').click();
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

// 删除单个历史记录
function removeHistoryItem(query) {
    let history = loadHistory();
    history = history.filter(item => item !== query);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    displayHistory();
}

// 清空历史记录
export function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    const { searchHistory } = getElements();
    searchHistory.classList.add('hidden');
}

// 初始化历史记录相关事件
export function initHistoryEvents() {
    const { clearHistoryBtn } = getElements();

    // 清空历史按钮事件
    clearHistoryBtn.addEventListener('click', clearHistory);
}