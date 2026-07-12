
(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('[data-theme-toggle]');
  const saved = localStorage.getItem('theme');
  if (saved) root.dataset.theme = saved;
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.dataset.theme = 'dark';

  const setLabel = () => {
    if (!themeButton) return;
    themeButton.textContent = root.dataset.theme === 'dark' ? '☀' : '◐';
    themeButton.setAttribute('aria-label', root.dataset.theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
  };
  setLabel();
  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', root.dataset.theme);
    setLabel();
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
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? '关闭导航' : '打开导航');
  });
  navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (event) => {
    if (!navigation?.classList.contains('open')) return;
    if (!navigation.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  const progress = document.querySelector('.progress');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
  };
  updateProgress();
  addEventListener('scroll', updateProgress, { passive: true });

  document.querySelectorAll('pre').forEach((pre) => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = '复制';
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.innerText || pre.innerText.replace(/^复制\n/, '');
      await navigator.clipboard.writeText(code);
      btn.textContent = '已复制';
      setTimeout(() => btn.textContent = '复制', 1100);
    });
    pre.appendChild(btn);
  });

  const tocLinks = [...document.querySelectorAll('.toc a')];
  const headings = tocLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (headings.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: '-18% 0px -70% 0px' });
    headings.forEach(h => observer.observe(h));
  }
})();
