// 导航站核心脚本
(function() {
    // 站点数据 —— 按服务分组排列（主站 + OpenList + Blog 成组出现）
    // 注：lyy.qd.je 系列暂时使用 IPv6 直连，后续如需改为 CF 代理，只需将 domainType 从 "aily" 改为 "cfproxy" 即可
    const sitesRaw = [
        // ========== AIYY 服务组（Cloudflare 代理）==========
        {
            name: "AIYY",
            rawUrl: "http://aiyy.cc.cd",
            description: "主站 · 工具与资源中心",
            icon: "🤖",
            domainType: "cfproxy",
            group: "AIYY"
        },
        {
            name: "OpenList AIYY",
            rawUrl: "http://openlist.aiyy.cc.cd",
            description: "OpenList 程序 · 快速文件共享",
            icon: "📂",
            domainType: "cfproxy",
            group: "AIYY"
        },
        {
            name: "Blog AIYY",
            rawUrl: "https://blog.aiyy.cc.cd",
            description: "博客 · 技术分享与记录",
            icon: "📝",
            domainType: "cfproxy",
            group: "AIYY"
        },
        // // ========== aily 服务组（IPv6 直连）==========
        {
            name: "aily",
            rawUrl: "https://aily.dpdns.org:4433",
            description: "主站 · 工具与资源中心",
            icon: "✨",
            domainType: "aily",
            group: "aily"
        },
        {
            name: "OpenList aily",
            rawUrl: "https://openlist.aily.dpdns.org:4433",
            description: "OpenList 程序 · 快速文件共享",
            icon: "📁",
            domainType: "aily",
            group: "aily"
        },
        {
            name: "Blog aily",
            rawUrl: "https://blog.aily.dpdns.org:4433",
            description: "博客 · 技术分享与记录",
            icon: "📝",
            domainType: "aily",
            group: "aily"
        },
        // ========== LYY 服务组（暂时 IPv6 直连，过段时间改 CF 代理）==========
        {
            name: "LYY",
            rawUrl: "https://lyy.qd.je:4433",
            description: "主站 · 工具与资源中心（当前 IPv6 直连）",
            icon: "🌟",
            domainType: "aily",     // 暂时 IPv6 直连，后期改为 "cfproxy"
            group: "LYY"
        },
        {
            name: "OpenList LYY",
            rawUrl: "https://openlist.lyy.qd.je:4433",
            description: "OpenList 程序 · 快速文件共享（当前 IPv6 直连）",
            icon: "📂",
            domainType: "aily",     // 暂时 IPv6 直连，后期改为 "cfproxy"
            group: "LYY"
        },
        {
            name: "Blog LYY",
            rawUrl: "https://blog.lyy.qd.je:4433",
            description: "博客 · 技术分享与记录（当前 IPv6 直连）",
            icon: "📝",
            domainType: "aily",     // 暂时 IPv6 直连，后期改为 "cfproxy"
            group: "LYY"
        }
    ];

    // 处理站点数据（根据 domainType 自动添加徽标和优化链接）
    function processSites() {
        return sitesRaw.map(site => {
            let finalUrl = site.rawUrl;
            let displayHost = "";
            let extraBadge = "";

            if (site.domainType === "aily") {
                const urlObj = new URL(site.rawUrl);
                displayHost = urlObj.host;
                extraBadge = "🌐 IPv6直连";
                if (!site.description.includes("IPv6")) {
                    site.description = "🌐 IPv6直连 · 速度快 · 需IPv6地址";
                }
            } else if (site.domainType === "cfproxy") {
                const urlObj = new URL(site.rawUrl);
                displayHost = urlObj.host;
                extraBadge = "☁️ Cloudflare代理";
                // 自动升级为 HTTPS 以获得更好的 CF 代理体验
                if (urlObj.protocol === "http:") {
                    finalUrl = finalUrl.replace(/^http:/, "https:");
                }
                if (!site.description.includes("Cloudflare")) {
                    site.description = "☁️ " + site.description;
                }
            }

            if (!displayHost) {
                try {
                    displayHost = new URL(finalUrl).host;
                } catch(e) {
                    displayHost = site.rawUrl;
                }
            }

            const detectKey = (() => {
                const urlObj = new URL(finalUrl);
                const host = urlObj.host;
                if (host === 'aiyy.cc.cd' || host.endsWith('.aiyy.cc.cd')) {
                    return 'aiyy.cc.cd';
                }
                if (host === 'aily.dpdns.org:4433' || host.endsWith('.aily.dpdns.org:4433')) {
                    return 'aily.dpdns.org:4433';
                }
                if (host === 'lyy.qd.je:4433' || host.endsWith('.lyy.qd.je:4433')) {
                    return 'lyy.qd.je:4433';
                }
                return host;
            })();

            return {
                name: site.name,
                url: finalUrl,
                description: site.description,
                icon: site.icon,
                rawHost: displayHost,
                extraBadge: extraBadge,
                domainType: site.domainType,
                group: site.group,
                detectKey
            };
        });
    }

    const sites = processSites();

    // 简单的防XSS辅助函数
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function updateSiteStatus(index, text, statusType) {
        const statusEl = document.getElementById(`siteStatus-${index}`);
        if (!statusEl) return;
        statusEl.textContent = text;
        statusEl.className = `status status-${statusType}`;
    }

    function updateNetworkStatusHint() {
        const hint = document.getElementById('networkStatusHint');
        if (!hint) return;
        if (navigator.onLine) {
            hint.innerHTML = '🌐 浏览器在线，正在检测站点访问状态。';
            hint.style.color = '#38bdf8';
        } else {
            hint.innerHTML = '🚫 浏览器离线，无法访问网址检测。';
            hint.style.color = '#f87171';
        }
    }

    const detectionTargets = {
        'aiyy.cc.cd': 'https://aiyy.cc.cd',
        'aily.dpdns.org:4433': 'https://aily.dpdns.org:4433',
        'lyy.qd.je:4433': 'https://lyy.qd.je:4433'
    };

    function checkRootStatus(rootUrl) {
        return fetch(rootUrl, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-store',
            credentials: 'omit'
        }).then(() => 'online').catch(() => 'offline');
    }

    function checkAllSiteStatuses() {
        updateNetworkStatusHint();
        if (!navigator.onLine) {
            sites.forEach((site, index) => updateSiteStatus(index, '● 离线', 'offline'));
            return;
        }

        const resultMap = {};
        const checks = Object.entries(detectionTargets).map(([key, rootUrl]) => {
            return checkRootStatus(rootUrl).then(status => {
                resultMap[key] = status;
            });
        });

        Promise.all(checks).then(() => {
            sites.forEach((site, index) => {
                const status = resultMap[site.detectKey] || 'offline';
                updateSiteStatus(index, status === 'online' ? '● 在线' : '● 离线', status);
            });
            const hint = document.getElementById('networkStatusHint');
            if (hint) {
                hint.innerHTML = '✅ 站点检测已完成';
                hint.style.color = '#10b981';
            }
        });
    }

    // 全局复制函数
    window.copyToClipboard = function(text, event) {
        if (event) event.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            const toast = document.createElement('div');
            toast.innerText = '✅ 地址已复制: ' + (text.length > 45 ? text.slice(0, 42) + '...' : text);
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = '#1e293bb3';
            toast.style.backdropFilter = 'blur(12px)';
            toast.style.color = '#e0f2fe';
            toast.style.padding = '10px 20px';
            toast.style.borderRadius = '40px';
            toast.style.fontSize = '0.85rem';
            toast.style.zIndex = '999';
            toast.style.border = '1px solid #5b6e8c';
            toast.style.fontWeight = '500';
            toast.style.whiteSpace = 'nowrap';
            toast.style.maxWidth = '90vw';
            toast.style.overflow = 'auto';
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 1800);
        }).catch(() => {
            alert('手动复制吧：' + text);
        });
    };

    // ========== 主题切换功能 ==========
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    }

    function updateThemeButton() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const toggleBtn = document.getElementById('themeToggleBtn');
        if (toggleBtn) {
            const iconSpan = toggleBtn.querySelector('.theme-toggle-icon');
            const textSpan = toggleBtn.querySelector('.theme-toggle-text');
            if (currentTheme === 'dark') {
                iconSpan.textContent = '☀️';
                textSpan.textContent = '白天模式';
            } else {
                iconSpan.textContent = '🌙';
                textSpan.textContent = '夜间模式';
            }
        }
    }

    function addThemeToggle() {
        const toggleHtml = `
            <div class="theme-toggle" id="themeToggleBtn">
                <span class="theme-toggle-icon"></span>
                <span class="theme-toggle-text"></span>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', toggleHtml);
        const toggleBtn = document.getElementById('themeToggleBtn');
        toggleBtn.addEventListener('click', () => {
            toggleTheme();
            updateThemeButton();
        });
        updateThemeButton();
    }

    // ========== IPv6 连通性检测 ==========
    function checkIPv6Connectivity() {
        const hintContainer = document.getElementById('ipv6StatusHint');
        if (!hintContainer) return;

        if (!navigator.onLine) {
            hintContainer.innerHTML = '🚫 浏览器离线，无法检测IPv6连接。';
            hintContainer.style.color = '#f87171';
            return;
        }

        hintContainer.innerHTML = '⏳ 正在检测IPv6可用性...';
        hintContainer.style.color = '#38bdf8';

        const url = 'https://test.wsmdn.dpdns.org';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-store',
            credentials: 'omit',
            signal: controller.signal
        }).then(response => {
            if (!response.ok) {
                throw new Error('状态码 ' + response.status);
            }
            return response.text();
        }).then(text => {
            clearTimeout(timeoutId);
            const ipv6 = (text || '').trim().match(/([0-9a-fA-F]{1,4}:){2,}[0-9a-fA-F]{1,4}/g);
            const address = ipv6 && ipv6.length ? ipv6[0] : (text || '').trim();
            if (address) {
                hintContainer.innerHTML = `✅ 当前网络支持IPv6，IPv6直连站点可用。地址: ${escapeHtml(address)}`;
                hintContainer.style.color = '#10b981';
            } else {
                hintContainer.innerHTML = '✅ 当前网络支持IPv6，IPv6直连站点可用，但未返回可解析地址。';
                hintContainer.style.color = '#10b981';
            }
        }).catch(() => {
            clearTimeout(timeoutId);
            hintContainer.innerHTML = '⚠️ 未能检测到IPv6连接，IPv6直连站点可能需要IPv6环境';
            hintContainer.style.color = '#f59e0b';
        });
    }

    // ========== 渲染卡片 ==========
    function buildCards() {
        const gridContainer = document.getElementById('navGrid');
        if (!gridContainer) {
            console.warn('导航站: 未找到 id="navGrid" 的容器');
            return;
        }

        let cardsHtml = '';
        sites.forEach((site, index) => {
            const targetUrl = site.url;
            const displayHost = site.rawHost;
            const strategyBadge = site.extraBadge ? `<span class="strategy-badge">${site.extraBadge}</span>` : '';
            cardsHtml += `
                <div class="card">
                    <div class="card-inner">
                        <div class="icon-area">
                            <div class="icon-bg">${site.icon}</div>
                            <div class="status status-pending" id="siteStatus-${index}">● 检测中…</div>
                        </div>
                        <div class="site-title">
                            ${escapeHtml(site.name)}
                            ${strategyBadge}
                        </div>
                        <div class="url-display" title="点击复制地址" onclick="copyToClipboard('${escapeHtml(targetUrl)}', event)">
                            ${escapeHtml(displayHost)}
                        </div>
                        <div class="desc">${escapeHtml(site.description)}</div>
                        <a href="${escapeHtml(targetUrl)}" target="_blank" rel="noopener noreferrer" class="link-btn">
                            <span>🔗 立即前往</span>
                            <span style="font-size:1.1rem;">➡️</span>
                        </a>
                    </div>
                </div>
            `;
        });
        gridContainer.innerHTML = cardsHtml;

        const footer = document.querySelector('.footer');
        if (footer && !document.getElementById('networkStatusHint')) {
            const networkHint = document.createElement('div');
            networkHint.id = 'networkStatusHint';
            networkHint.style.marginTop = '1rem';
            networkHint.style.textAlign = 'center';
            footer.appendChild(networkHint);
        }

        if (sites.some(s => s.domainType === 'aily')) {
            if (footer && !document.getElementById('ipv6StatusHint')) {
                const hintDiv = document.createElement('div');
                hintDiv.id = 'ipv6StatusHint';
                hintDiv.style.marginTop = '0.5rem';
                hintDiv.style.textAlign = 'center';
                footer.appendChild(hintDiv);
                checkIPv6Connectivity();
            }
        }

        checkAllSiteStatuses();
    }

    // ========== 初始化 ==========
    function init() {
        initTheme();
        addThemeToggle();
        buildCards();
        window.addEventListener('online', checkAllSiteStatuses);
        window.addEventListener('offline', updateNetworkStatusHint);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();