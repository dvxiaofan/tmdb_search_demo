// 暗黑模式管理功能
import { getElements } from './ui.js';

const DARK_MODE_KEY = 'tmdb_dark_mode';

// 初始化暗黑模式
export function initDarkMode() {
    const isDarkMode = localStorage.getItem(DARK_MODE_KEY) === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeToggle(true);
    }
}

// 切换暗黑模式
export function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem(DARK_MODE_KEY, isDarkMode);
    updateDarkModeToggle(isDarkMode);
}

// 更新暗黑模式切换按钮
function updateDarkModeToggle(isDarkMode) {
    const { darkModeToggle } = getElements();
    const toggleIcon = darkModeToggle.querySelector('.toggle-icon');
    toggleIcon.textContent = isDarkMode ? '☀️' : '🌙';
    darkModeToggle.title = isDarkMode ? '切换亮色模式' : '切换暗黑模式';
}

// 初始化暗黑模式事件
export function initThemeEvents() {
    const { darkModeToggle } = getElements();
    darkModeToggle.addEventListener('click', toggleDarkMode);
}