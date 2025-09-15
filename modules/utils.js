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