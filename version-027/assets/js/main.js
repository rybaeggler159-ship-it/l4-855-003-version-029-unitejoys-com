(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupYear() {
    document.querySelectorAll('[data-year]').forEach(function (item) {
      item.textContent = new Date().getFullYear();
    });
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
      button.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      var source = shell.getAttribute('data-stream');
      var loaded = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function loadSource() {
        if (loaded) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
        loaded = true;
      }

      function playVideo() {
        loadSource();
        var result = video.play();
        shell.classList.add('is-playing');
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });

      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
          hlsInstance = null;
          loaded = false;
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearchCard(item) {
    var tags = item.tags.slice(0, 6).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-frame" href="' + escapeHtml(item.url) + '">',
      '    <img src="./' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async" onerror="this.classList.add(\'image-hidden\')">',
      '    <span class="poster-badge">' + escapeHtml(item.type) + '</span>',
      '    <span class="poster-play">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-row">',
      '      <span>' + escapeHtml(item.category) + '</span>',
      '      <span>' + escapeHtml(item.year) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '    <div class="movie-tags">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function setupSearch() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var title = document.querySelector('[data-search-title]');
    var subtitle = document.querySelector('[data-search-subtitle]');
    var input = document.querySelector('[data-search-form] input[name="q"]');
    if (input) {
      input.value = query;
    }

    var list = window.SEARCH_INDEX;
    if (query) {
      var lower = query.toLowerCase();
      list = list.filter(function (item) {
        return [item.title, item.region, item.type, item.genre, item.oneLine, item.tags.join(' ')].join(' ').toLowerCase().indexOf(lower) !== -1;
      });
      if (title) {
        title.textContent = '搜索结果';
      }
      if (subtitle) {
        subtitle.textContent = '关键词：' + query;
      }
    } else {
      list = list.slice(0, 24);
    }

    if (!list.length) {
      results.innerHTML = '<div class="text-panel"><h2>未找到相关内容</h2><p>可以尝试更换影片标题、地区、类型或标签关键词。</p></div>';
      return;
    }

    results.innerHTML = list.slice(0, 160).map(renderSearchCard).join('');
  }

  ready(function () {
    setupYear();
    setupMenu();
    setupHero();
    setupPlayers();
    setupSearch();
  });
})();
