// 导航站核心脚本
(function() {
    // 站点数据 —— 按服务分组排列（主站 + OpenList + Blog 成组出现）
    // 注：lyy.qd.je 系列暂时使用 IPv6 直连，后续如需改为 CF 代理，只需将 domainType 从 "magiclr" 改为 "cfproxy" 即可
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
        // // ========== MagicLR 服务组（IPv6 直连）==========
        // {
        //     name: "MagicLR",
        //     rawUrl: "http://magiclr.dpdns.org:8888",
        //     description: "主站 · 工具与资源中心",
        //     icon: "✨",
        //     domainType: "magiclr",
        //     group: "MagicLR"
        // },
        // {
        //     name: "OpenList MagicLR",
        //     rawUrl: "http://openlist.magiclr.dpdns.org:8888",
        //     description: "OpenList 程序 · 快速文件共享",
        //     icon: "📁",
        //     domainType: "magiclr",
        //     group: "MagicLR"
        // },
        // {
        //     name: "Blog MagicLR",
        //     rawUrl: "http://blog.magiclr.dpdns.org:8888",
        //     description: "博客 · 技术分享与记录",
        //     icon: "📝",
        //     domainType: "magiclr",
        //     group: "MagicLR"
        // },
        // ========== LYY 服务组（暂时 IPv6 直连，过段时间改 CF 代理）==========
        {
            name: "LYY",
            rawUrl: "http://lyy.qd.je:8888",
            description: "主站 · 工具与资源中心（当前 IPv6 直连）",
            icon: "🌟",
            domainType: "magiclr",     // 暂时 IPv6 直连，后期改为 "cfproxy"
            group: "LYY"
        },
        {
            name: "OpenList LYY",
            rawUrl: "http://openlist.lyy.qd.je:8888",
            description: "OpenList 程序 · 快速文件共享（当前 IPv6 直连）",
            icon: "📂",
            domainType: "magiclr",     // 暂时 IPv6 直连，后期改为 "cfproxy"
            group: "LYY"
        },
        {
            name: "Blog LYY",
            rawUrl: "http://blog.lyy.qd.je:8888",
            description: "博客 · 技术分享与记录（当前 IPv6 直连）",
            icon: "📝",
            domainType: "magiclr",     // 暂时 IPv6 直连，后期改为 "cfproxy"
            group: "LYY"
        }
    ];

    // 处理站点数据（根据 domainType 自动添加徽标和优化链接）
    function processSites() {
        return sitesRaw.map(site => {
            let finalUrl = site.rawUrl;
            let displayHost = "";
            let extraBadge = "";

            if (site.domainType === "magiclr") {
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

            return {
                name: site.name,
                url: finalUrl,
                description: site.description,
                icon: site.icon,
                rawHost: displayHost,
                extraBadge: extraBadge,
                domainType: site.domainType,
                group: site.group
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
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else if (prefersDark) {
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
        const img = new Image();
        img.src = "https://test.wsmdn.dpdns.org";// + Date.now();
        img.onload = () => {
            const hintContainer = document.getElementById('ipv6StatusHint');
            if (hintContainer) {
                hintContainer.innerHTML = '✅ 当前网络支持IPv6，IPv6直连站点可用';
                hintContainer.style.color = '#10b981';
            }
        };
        img.onerror = () => {
            const hintContainer = document.getElementById('ipv6StatusHint');
            if (hintContainer) {
                hintContainer.innerHTML = '⚠️ 未能检测到IPv6连接，IPv6直连站点可能需要IPv6环境';
                hintContainer.style.color = '#f59e0b';
            }
        };
    }

    // ========== 渲染卡片 ==========
    function buildCards() {
        const gridContainer = document.getElementById('navGrid');
        if (!gridContainer) {
            console.warn('导航站: 未找到 id="navGrid" 的容器');
            return;
        }

        let cardsHtml = '';
        sites.forEach(site => {
            const targetUrl = site.url;
            const displayHost = site.rawHost;
            const strategyBadge = site.extraBadge ? `<span class="strategy-badge">${site.extraBadge}</span>` : '';
            cardsHtml += `
                <div class="card">
                    <div class="card-inner">
                        <div class="icon-area">
                            <div class="icon-bg">${site.icon}</div>
                            <div class="status">● 在线</div>
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

        // 添加 IPv6 提示栏（如果存在 IPv6 直连站点）
        if (sites.some(s => s.domainType === 'magiclr')) {
            const footer = document.querySelector('.footer');
            if (footer && !document.getElementById('ipv6StatusHint')) {
                const hintDiv = document.createElement('div');
                hintDiv.id = 'ipv6StatusHint';
                hintDiv.style.marginTop = '1rem';
                hintDiv.style.textAlign = 'center';
                footer.appendChild(hintDiv);
                checkIPv6Connectivity();
            }
        }
    }

    // ========== 初始化 ==========
    function init() {
        initTheme();
        addThemeToggle();
        buildCards();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();