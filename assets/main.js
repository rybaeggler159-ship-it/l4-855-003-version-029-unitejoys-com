(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll(".site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (!value) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(value);
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (slides.length < 2) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var previous = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function setupFilters() {
        var input = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        var empty = document.querySelector("[data-empty-state]");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
        var chipValue = "";
        if (!cards.length) {
            return;
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-title") || "").toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchChip = !chipValue || text.indexOf(chipValue.toLowerCase()) !== -1;
                var matched = matchKeyword && matchChip;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                chip.classList.add("is-active");
                chipValue = chip.getAttribute("data-filter-chip") || "";
                apply();
            });
        });
        apply();
    }

    function cardTemplate(movie) {
        return "" +
            "<article class=\"movie-card\">" +
                "<a class=\"movie-poster\" href=\"./" + movie.file + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
                    "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                    "<span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>" +
                    "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>" +
                "</a>" +
                "<div class=\"movie-card-body\">" +
                    "<h2><a href=\"./" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h2>" +
                    "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                    "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>" +
                "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setupSearchPage() {
        var results = document.getElementById("search-results");
        if (!results || !window.SITE_MOVIES) {
            return;
        }
        var empty = document.getElementById("search-empty");
        var input = document.getElementById("search-page-input");
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (input) {
            input.value = query;
        }
        var normalized = query.toLowerCase();
        var matches = window.SITE_MOVIES.filter(function (movie) {
            if (!normalized) {
                return false;
            }
            return movie.searchText.toLowerCase().indexOf(normalized) !== -1;
        }).slice(0, 200);
        results.innerHTML = matches.map(cardTemplate).join("");
        if (empty) {
            empty.classList.toggle("is-visible", matches.length === 0);
        }
    }

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();

function initVideoPlayer(sourceUrl) {
    var video = document.getElementById("video-player");
    var overlay = document.querySelector("[data-play-layer]");
    if (!video || !sourceUrl) {
        return;
    }
    var attached = false;

    function attach(playAfterAttach) {
        if (attached) {
            if (playAfterAttach) {
                video.play().catch(function () {});
            }
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            if (playAfterAttach) {
                video.play().catch(function () {});
            }
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            video.hlsPlayer = hls;
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                if (playAfterAttach) {
                    video.play().catch(function () {});
                }
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
            return;
        }
        video.src = sourceUrl;
        if (playAfterAttach) {
            video.play().catch(function () {});
        }
    }

    function start() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        attach(true);
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        } else {
            video.pause();
        }
    });
    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });
    video.addEventListener("loadedmetadata", function () {
        if (!video.paused && overlay) {
            overlay.classList.add("is-hidden");
        }
    });
}
