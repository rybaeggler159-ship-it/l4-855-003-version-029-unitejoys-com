(function () {
    'use strict';

    function getBase() {
        return document.body.getAttribute('data-base') || '';
    }

    function resolveUrl(path) {
        return getBase() + path;
    }

    function setupImageFallbacks() {
        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-missing');
                image.setAttribute('aria-hidden', 'true');
            }, { once: true });
        });
    }

    function setupHeader() {
        var searchToggle = document.querySelector('.search-toggle');
        var searchPanel = document.querySelector('.header-search');
        var menuToggle = document.querySelector('.menu-toggle');
        var mobileNav = document.querySelector('.mobile-nav');

        if (searchToggle && searchPanel) {
            searchToggle.addEventListener('click', function () {
                var nextHidden = !searchPanel.hidden;
                searchPanel.hidden = nextHidden;
                if (!nextHidden) {
                    var input = searchPanel.querySelector('input');
                    if (input) {
                        input.focus();
                    }
                }
            });
        }

        if (menuToggle && mobileNav) {
            menuToggle.addEventListener('click', function () {
                mobileNav.hidden = !mobileNav.hidden;
            });
        }
    }

    function setupSearchForms() {
        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = resolveUrl('search.html?q=' + encodeURIComponent(query));
                }
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                play();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        play();
    }

    function setupSorting() {
        var select = document.querySelector('.sort-select');
        var grid = document.querySelector('[data-sortable]');
        if (!select || !grid) {
            return;
        }

        var originalCards = Array.prototype.slice.call(grid.children);
        select.addEventListener('change', function () {
            var cards = originalCards.slice();
            var mode = select.value;

            if (mode === 'score') {
                cards.sort(function (a, b) {
                    return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
                });
            }

            if (mode === 'year') {
                cards.sort(function (a, b) {
                    return String(b.getAttribute('data-year')).localeCompare(String(a.getAttribute('data-year')));
                });
            }

            if (mode === 'title') {
                cards.sort(function (a, b) {
                    return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
                });
            }

            if (mode === 'default') {
                cards = originalCards.slice();
            }

            cards.forEach(function (card) {
                grid.appendChild(card);
            });
        });
    }

    function makeCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '  <a href="' + resolveUrl('movie/' + movie.id + '.html') + '" class="movie-card-link">',
            '    <div class="poster-frame">',
            '      <img src="' + resolveUrl(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" class="poster-image" loading="lazy">',
            '      <div class="poster-shade">',
            '        <span class="play-badge">▶</span>',
            '        <p>' + escapeHtml(movie.oneLine || '') + '</p>',
            '      </div>',
            '      <span class="type-badge">' + escapeHtml(movie.type || '') + '</span>',
            '    </div>',
            '    <div class="movie-card-body">',
            '      <h3>' + escapeHtml(movie.title || '') + '</h3>',
            '      <p class="card-line">' + escapeHtml(movie.oneLine || movie.summary || '') + '</p>',
            '      <div class="movie-meta">',
            '        <span>' + escapeHtml(movie.year || '') + '</span>',
            '        <span>' + escapeHtml(movie.region || '') + '</span>',
            '        <span>' + escapeHtml(movie.categoryName || '') + '</span>',
            '      </div>',
            '      <div class="tag-row">' + tags + '</div>',
            '    </div>',
            '  </a>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function setupSearchPage() {
        var results = document.querySelector('[data-search-results]');
        var summary = document.querySelector('[data-search-summary]');
        var searchInput = document.querySelector('.search-page-form input[name="q"]');
        if (!results || !summary || !window.MOVIES) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        if (searchInput) {
            searchInput.value = query;
        }

        if (!query) {
            results.innerHTML = '';
            summary.textContent = '请输入关键词进行搜索。';
            return;
        }

        var lowerQuery = query.toLowerCase();
        var filtered = window.MOVIES.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genreRaw,
                movie.oneLine,
                movie.summary,
                movie.categoryName,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();
            return haystack.indexOf(lowerQuery) !== -1;
        });

        summary.textContent = '搜索“' + query + '”，找到 ' + filtered.length + ' 个结果。';
        results.innerHTML = filtered.map(makeCard).join('');
        setupImageFallbacks();
    }

    function setupPlayer() {
        var video = document.querySelector('[data-player-video]');
        var button = document.querySelector('[data-play-button]');
        var status = document.querySelector('[data-player-status]');
        if (!video || !button) {
            return;
        }

        var source = video.getAttribute('data-src');
        var hlsInstance = null;
        var started = false;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function startPlayback() {
            if (started) {
                video.play();
                return;
            }
            started = true;
            button.hidden = true;
            setStatus('正在加载播放源...');

            if (!source) {
                setStatus('未配置播放源。');
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('播放源已加载。');
                    video.play().catch(function () {
                        setStatus('浏览器阻止自动播放，请再次点击播放器。');
                    });
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('播放加载出错，请刷新页面或稍后重试。');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    setStatus('播放源已加载。');
                    video.play().catch(function () {
                        setStatus('浏览器阻止自动播放，请再次点击播放器。');
                    });
                }, { once: true });
            } else {
                video.src = source;
                video.play().catch(function () {
                    setStatus('当前浏览器可能不支持此播放源。');
                });
            }
        }

        button.addEventListener('click', startPlayback);
        video.addEventListener('play', function () {
            button.hidden = true;
            setStatus('正在播放。');
        });
        video.addEventListener('pause', function () {
            setStatus('播放已暂停。');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupImageFallbacks();
        setupHeader();
        setupSearchForms();
        setupHero();
        setupSorting();
        setupSearchPage();
        setupPlayer();
    });
}());
