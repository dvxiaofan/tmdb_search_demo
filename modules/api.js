// API 配置和相关功能
export const API_KEY = 'f67cfcb63ecbb9e50c7a4adb2e01aea1';
export const BASE_URL = 'https://api.themoviedb.org/3';

// 搜索功能
export async function searchTMDB(query, mediaType) {
    let endpoint;
    if (mediaType === 'multi') {
        endpoint = `${BASE_URL}/search/multi`;
    } else if (mediaType === 'movie') {
        endpoint = `${BASE_URL}/search/movie`;
    } else if (mediaType === 'tv') {
        endpoint = `${BASE_URL}/search/tv`;
    } else if (mediaType === 'collection') {
        endpoint = `${BASE_URL}/search/collection`;
    } else {
        endpoint = `${BASE_URL}/search/multi`;
    }

    const response = await fetch(`${endpoint}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=zh-CN`);

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('API密钥无效，请设置正确的TMDB API密钥');
        }
        throw new Error('搜索失败');
    }

    return await response.json();
}

// 获取电影或电视剧详细信息
export async function getDetails(itemId, mediaType) {
    const endpoint = mediaType === 'movie' ? 'movie' : (mediaType === 'tv' ? 'tv' : 'collection');

    if (mediaType === 'collection') {
        const response = await fetch(`${BASE_URL}/collection/${itemId}?api_key=${API_KEY}&language=zh-CN`);
        if (!response.ok) {
            throw new Error('获取系列详细信息失败');
        }
        return { details: await response.json() };
    }

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

    return { details, credits, similar };
}