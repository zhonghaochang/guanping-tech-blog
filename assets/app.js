(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('[data-theme-toggle]');
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) root.dataset.theme = savedTheme;
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.dataset.theme = 'dark';

  const setThemeLabel = () => {
    if (!themeButton) return;
    const dark = root.dataset.theme === 'dark';
    themeButton.textContent = dark ? '☀' : '◐';
    themeButton.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
  };

  setThemeLabel();
  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', root.dataset.theme);
    setThemeLabel();
  });

  const menuButton = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector('.nav-links');
  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', '打开导航');
  };

  menuButton?.addEventListener('click', () => {
    if (!navigation) return;
    const open = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  });
  navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (!navigation?.classList.contains('open')) return;
    if (!navigation.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  const searchForm = document.querySelector('[data-site-search]');
  const searchInput = searchForm?.querySelector('input[type="search"]');
  const searchItems = [...document.querySelectorAll('[data-search-item]')];
  const searchStatus = document.querySelector('[data-search-status]');

  const filterPosts = () => {
    if (!searchInput) return;
    const query = searchInput.value.trim().toLocaleLowerCase('zh-CN');
    let matches = 0;
    searchItems.forEach(item => {
      const matched = !query || item.textContent.toLocaleLowerCase('zh-CN').includes(query);
      item.hidden = !matched;
      if (matched) matches += 1;
    });
    if (searchStatus) {
      searchStatus.textContent = query
        ? `关键词“${searchInput.value.trim()}”找到 ${matches} 项`
        : '';
    }
  };

  searchForm?.addEventListener('submit', event => {
    event.preventDefault();
    filterPosts();
  });
  searchInput?.addEventListener('search', filterPosts);
  searchInput?.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      searchInput.value = '';
      filterPosts();
    }
  });

  const progress = document.querySelector('.progress');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = max > 0 ? `${Math.min(100, (window.scrollY / max) * 100)}%` : '0%';
  };
  updateProgress();
  addEventListener('scroll', updateProgress, { passive: true });

  document.querySelectorAll('.code-frame').forEach(frame => {
    const pre = frame.querySelector('pre');
    const head = frame.querySelector('.code-head');
    if (!pre || !head) return;

    const button = head.querySelector('.copy-btn') || document.createElement('button');
    button.className = 'copy-btn';
    button.type = 'button';
    button.textContent = '复制';
    button.setAttribute('aria-label', '复制代码');
    button.addEventListener('click', async () => {
      await navigator.clipboard.writeText(pre.innerText);
      button.textContent = '已复制';
      setTimeout(() => { button.textContent = '复制'; }, 1200);
    });
    if (!button.parentElement) head.appendChild(button);
  });

  const tocLinks = [...document.querySelectorAll('.toc a')];
  const headings = tocLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (headings.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-18% 0px -72% 0px' });
    headings.forEach(heading => observer.observe(heading));
  }
})();
