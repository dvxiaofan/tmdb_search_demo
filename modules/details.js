// 详情渲染功能

// 渲染影片详细信息
export function renderMovieDetails(container, details, credits, similar, mediaType) {
    // 获取基础信息
    const runtime = details.runtime || details.episode_run_time?.[0] || 0;
    const genres = details.genres?.map(g => g.name).join('、') || '未知';
    const rating = details.vote_average || 0;
    const voteCount = details.vote_count || 0;

    // 获取国家信息
    let countries = '';

    // 国家名称中英文映射表（电影用）
    const countryNameMap = {
        'United States of America': '美国',
        'United Kingdom': '英国',
        'China': '中国',
        'Japan': '日本',
        'South Korea': '韩国',
        'France': '法国',
        'Germany': '德国',
        'Italy': '意大利',
        'Spain': '西班牙',
        'Canada': '加拿大',
        'Australia': '澳大利亚',
        'India': '印度',
        'Brazil': '巴西',
        'Mexico': '墨西哥',
        'Russia': '俄罗斯',
        'Thailand': '泰国',
        'Taiwan': '台湾',
        'Hong Kong': '香港',
        'Singapore': '新加坡',
        'Malaysia': '马来西亚',
        'Netherlands': '荷兰',
        'Sweden': '瑞典',
        'Norway': '挪威',
        'Denmark': '丹麦',
        'Poland': '波兰',
        'Czech Republic': '捷克',
        'Argentina': '阿根廷',
        'New Zealand': '新西兰',
        'Ireland': '爱尔兰',
        'Belgium': '比利时',
        'Switzerland': '瑞士',
        'Austria': '奥地利',
        'Portugal': '葡萄牙',
        'Greece': '希腊',
        'Turkey': '土耳其',
        'Israel': '以色列',
        'South Africa': '南非',
        'Philippines': '菲律宾',
        'Indonesia': '印度尼西亚',
        'Vietnam': '越南'
    };

    // 国家代码映射表（电视剧用）
    const countryCodeMap = {
        'US': '美国', 'GB': '英国', 'CN': '中国', 'JP': '日本', 'KR': '韩国',
        'FR': '法国', 'DE': '德国', 'IT': '意大利', 'ES': '西班牙', 'CA': '加拿大',
        'AU': '澳大利亚', 'IN': '印度', 'BR': '巴西', 'MX': '墨西哥', 'RU': '俄罗斯',
        'TH': '泰国', 'TW': '台湾', 'HK': '香港', 'SG': '新加坡', 'MY': '马来西亚',
        'NL': '荷兰', 'SE': '瑞典', 'NO': '挪威', 'DK': '丹麦', 'PL': '波兰',
        'CZ': '捷克', 'AR': '阿根廷', 'NZ': '新西兰', 'IE': '爱尔兰', 'BE': '比利时'
    };

    if (mediaType === 'movie') {
        // 电影使用 production_countries (返回完整国家名)
        countries = details.production_countries?.map(c => countryNameMap[c.name] || c.name).join('、') || '';
    } else if (mediaType === 'tv') {
        // 电视剧使用 origin_country (国家代码)
        countries = details.origin_country?.map(code => countryCodeMap[code] || code).join('、') || '';
    }

    // 获取主要演员（前6位）
    const mainCast = credits.cast?.slice(0, 6) || [];

    // 获取相似推荐（前4部）
    const similarMovies = similar.results?.slice(0, 4) || [];

    // 获取电视剧集数和季数信息
    const numberOfSeasons = details.number_of_seasons || 0;
    const numberOfEpisodes = details.number_of_episodes || 0;
    const seasons = details.seasons || [];

    // 生成季信息的HTML
    let seasonsHTML = '';
    if (mediaType === 'tv' && seasons.length > 0) {
        // 过滤掉第0季（特别篇）并按季数排序
        const regularSeasons = seasons.filter(s => s.season_number > 0).sort((a, b) => a.season_number - b.season_number);
        if (regularSeasons.length > 0) {
            seasonsHTML = `
                <div class="seasons-section">
                    <h4>季信息</h4>
                    <div class="seasons-list">
                        ${regularSeasons.map(season => `
                            <div class="season-item">
                                <span class="season-number">第${season.season_number}季</span>
                                <span class="season-episodes">${season.episode_count || 0}集</span>
                                ${season.air_date ? `<span class="season-year">${new Date(season.air_date).getFullYear()}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    const html = `
        <div class="detail-content-wrapper">
            <div class="movie-stats">
                <div class="stat-item">
                    <span class="stat-label">评分</span>
                    <span class="stat-value">${rating.toFixed(1)}/10 (${voteCount}人评价)</span>
                </div>
                ${mediaType === 'tv' && numberOfEpisodes > 0 ? `
                    <div class="stat-item">
                        <span class="stat-label">总集数</span>
                        <span class="stat-value">${numberOfEpisodes}集${numberOfSeasons > 0 ? ` (${numberOfSeasons}季)` : ''}</span>
                    </div>
                ` : ''}
                ${runtime > 0 ? `
                    <div class="stat-item">
                        <span class="stat-label">${mediaType === 'tv' ? '单集时长' : '时长'}</span>
                        <span class="stat-value">${runtime}分钟</span>
                    </div>
                ` : ''}
                <div class="stat-item">
                    <span class="stat-label">类型</span>
                    <span class="stat-value">${genres}</span>
                </div>
                ${countries ? `
                    <div class="stat-item">
                        <span class="stat-label">国家</span>
                        <span class="stat-value">${countries}</span>
                    </div>
                ` : ''}
            </div>

            ${seasonsHTML}

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

// 渲染系列详细信息
export function renderCollectionDetails(container, details) {
    // 获取系列中的电影
    const movies = details.parts || [];

    // 按发布日期排序
    movies.sort((a, b) => {
        const dateA = a.release_date ? new Date(a.release_date) : new Date(0);
        const dateB = b.release_date ? new Date(b.release_date) : new Date(0);
        return dateA - dateB;
    });

    const html = `
        <div class="detail-content-wrapper">
            <div class="collection-overview">
                ${details.overview ? `
                    <div class="collection-description">
                        <h4>系列简介</h4>
                        <p>${details.overview}</p>
                    </div>
                ` : ''}
                <div class="collection-stats">
                    <span class="stat-item">
                        <span class="stat-label">包含电影</span>
                        <span class="stat-value">${movies.length} 部</span>
                    </span>
                </div>
            </div>

            <div class="collection-movies">
                <h4>系列电影</h4>
                <div class="collection-movies-list">
                    ${movies.map(movie => {
                        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '未上映';
                        const poster = movie.poster_path
                            ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                            : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMTIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iMTIwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuaXoOWbvueJhzwvdGV4dD4KPC9zdmc+';

                        return `
                            <div class="collection-movie-item">
                                <img src="${poster}" alt="${movie.title}" class="collection-movie-poster">
                                <div class="collection-movie-info">
                                    <span class="collection-movie-title">${movie.title}</span>
                                    <span class="collection-movie-year">${year}</span>
                                    <span class="collection-movie-rating">${(movie.vote_average || 0).toFixed(1)}★</span>
                                    <a href="https://www.themoviedb.org/movie/${movie.id}" target="_blank" class="collection-movie-link">查看详情</a>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}