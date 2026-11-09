// 工具函数
import { showError } from './ui.js';

// 复制到剪贴板
export function copyToClipboard(id, button) {
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
export async function downloadImage(imageUrl, title, year, sizeLabel = '') {
    try {
        // 如果是默认占位符图片，不允许下载
        if (imageUrl.startsWith('data:image/svg+xml')) {
            showError('无法下载占位符图片');
            return;
        }

        // 显示下载进度提示
        showDownloadProgress(sizeLabel);

        // TMDB 会根据 Accept 返回 WebP。显式请求 JPEG，避免下载后缀与内容不一致。
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        let response;
        try {
            response = await fetch(imageUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'image/jpeg'
                },
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            throw new Error(`图片请求失败（HTTP ${response.status}）`);
        }

        const blob = await response.blob();
        if (blob.type && !blob.type.startsWith('image/')) {
            throw new Error('返回内容不是图片');
        }

        triggerDownload(blob, title, year, sizeLabel, imageUrl);
    } catch (error) {
        console.error('下载失败:', error);
        fallbackDownload(imageUrl, title, sizeLabel);
    }
}

// 根据图片 MIME 类型确定文件扩展名
function getImageExtension(blobType, imageUrl) {
    const mimeExtensions = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/avif': 'avif',
        'image/svg+xml': 'svg'
    };

    if (mimeExtensions[blobType]) {
        return mimeExtensions[blobType];
    }

    const urlExtension = imageUrl.split('?')[0].split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg'].includes(urlExtension)
        ? urlExtension
        : 'jpg';
}

// 生成保留中文的文件名
function buildFileName(title, year, sizeLabel, extension) {
    const parts = [title?.trim(), year, sizeLabel].filter(Boolean);
    const fileName = `${parts.join('_')}_poster.${extension}`;

    return fileName
        .replace(/[\\/:*?"<>|\x00-\x1f]/g, '_')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 150);
}

// 触发文件下载
function triggerDownload(blob, title, year, sizeLabel, imageUrl) {
    const url = window.URL.createObjectURL(blob);

    // 创建下载链接
    const a = document.createElement('a');
    a.href = url;

    // 扩展名以实际返回的图片类型为准
    const extension = getImageExtension(blob.type, imageUrl);
    a.download = buildFileName(title, year, sizeLabel, extension);

    // 触发下载
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 延迟释放，避免部分浏览器还没读取完 blob
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    // 显示成功提示
    showDownloadSuccess(sizeLabel);
}

// 备选下载方案
function fallbackDownload(imageUrl, title, sizeLabel = '') {
    const existingToast = document.querySelector('.download-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // 在新标签页打开图片
    window.open(imageUrl, '_blank');

    // 显示提示
    const toast = document.createElement('div');
    toast.className = 'download-toast fallback';
    const sizeText = sizeLabel ? `(${sizeLabel})` : '';
    toast.innerHTML = `
        <div>下载失败，图片已在新标签页打开 ${sizeText}</div>
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
