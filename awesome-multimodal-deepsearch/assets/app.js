(() => {
  const data = Array.isArray(window.BENCHMARKS) ? window.BENCHMARKS : [];
  const grid = document.querySelector("#benchmark-grid");
  const searchInput = document.querySelector("#search-input");
  const sortSelect = document.querySelector("#sort-select");
  const status = document.querySelector("#result-status");
  const emptyState = document.querySelector("#empty-state");
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const themeButton = document.querySelector("#theme-button");
  const resetButton = document.querySelector("#reset-button");

  const state = {
    query: new URLSearchParams(location.search).get("q") || "",
    filter: new URLSearchParams(location.search).get("filter") || "all",
    sort: "newest"
  };

  const processOrder = { strong: 0, partial: 1, training: 2, none: 3 };

  const escapeHTML = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const searchableText = (item) => JSON.stringify(item).toLocaleLowerCase("zh-CN");

  function updateURL() {
    const params = new URLSearchParams();
    if (state.query) params.set("q", state.query);
    if (state.filter !== "all") params.set("filter", state.filter);
    const next = params.toString() ? `${location.pathname}?${params}` : location.pathname;
    history.replaceState(null, "", next);
  }

  function linkMarkup(link) {
    return `<a href="${escapeHTML(link.url)}" target="_blank" rel="noreferrer">${escapeHTML(link.label)}<span aria-hidden="true">↗</span></a>`;
  }

  function benchmarkCard(item, index) {
    const metrics = item.metrics.map((metric) => `<span>${escapeHTML(metric)}</span>`).join("");
    const tags = item.tags.map((tag) => `<li>${escapeHTML(tag)}</li>`).join("");
    const links = item.links.map(linkMarkup).join("");
    const examples = item.queryExamples.map((query) => `<blockquote>${escapeHTML(query)}</blockquote>`).join("");

    return `
      <article class="benchmark-card" id="${escapeHTML(item.id)}" style="--delay:${index * 28}ms">
        <div class="card-topline">
          <span class="card-index">${String(index + 1).padStart(2, "0")}</span>
          <span class="process-badge process-${escapeHTML(item.processLevel)}">过程评分 · ${escapeHTML(item.processLabel)}</span>
        </div>
        <div class="card-heading">
          <div>
            <p class="card-date">${escapeHTML(item.date)} · ${escapeHTML(item.venue)}</p>
            <h3>${escapeHTML(item.name)}</h3>
            <p class="full-title">${escapeHTML(item.title)}</p>
          </div>
        </div>
        <p class="positioning">${escapeHTML(item.positioning)}</p>
        <dl class="quick-facts">
          <div><dt>Scale</dt><dd>${escapeHTML(item.scale)}</dd></div>
          <div><dt>Environment</dt><dd>${escapeHTML(item.environment)}</dd></div>
        </dl>
        <ul class="tag-list" aria-label="标签">${tags}</ul>
        <div class="card-links">${links}</div>
        <details>
          <summary>查看完整对比 <span aria-hidden="true">＋</span></summary>
          <div class="details-body">
            <section><h4>数据构建</h4><p>${escapeHTML(item.construction)}</p></section>
            <section><h4>关键创新</h4><p>${escapeHTML(item.innovation)}</p></section>
            <section><h4>过程评估</h4><p>${escapeHTML(item.processDetail)}</p></section>
            <section><h4>主要指标</h4><div class="metric-list">${metrics}</div></section>
            <section><h4>公开强结果</h4><p>${escapeHTML(item.bestResult)}</p></section>
            <section><h4>边界与提示</h4><p>${escapeHTML(item.note)}</p></section>
            <section><h4>Query 示例</h4>${examples}</section>
          </div>
        </details>
      </article>`;
  }

  function getVisibleItems() {
    const query = state.query.trim().toLocaleLowerCase("zh-CN");
    const filtered = data.filter((item) => {
      const inFacet = state.filter === "all" || item.facets.includes(state.filter);
      const inSearch = !query || searchableText(item).includes(query);
      return inFacet && inSearch;
    });

    return filtered.sort((a, b) => {
      if (state.sort === "oldest") return a.date.localeCompare(b.date) || a.name.localeCompare(b.name);
      if (state.sort === "name") return a.name.localeCompare(b.name);
      if (state.sort === "process") return processOrder[a.processLevel] - processOrder[b.processLevel] || b.date.localeCompare(a.date);
      return b.date.localeCompare(a.date) || a.name.localeCompare(b.name);
    });
  }

  function render() {
    const items = getVisibleItems();
    grid.innerHTML = items.map(benchmarkCard).join("");
    status.textContent = `显示 ${items.length} / ${data.length} 个条目`;
    emptyState.hidden = items.length !== 0;
    filterButtons.forEach((button) => {
      const active = button.dataset.filter === state.filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    updateURL();
  }

  function reset() {
    state.query = "";
    state.filter = "all";
    state.sort = "newest";
    searchInput.value = "";
    sortSelect.value = "newest";
    render();
    searchInput.focus();
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("awesome-mmds-theme", theme);
    themeButton.setAttribute("aria-label", theme === "dark" ? "切换浅色模式" : "切换深色模式");
  }

  const savedTheme = localStorage.getItem("awesome-mmds-theme");
  const preferredTheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(savedTheme || preferredTheme);

  document.querySelector("#stat-total").textContent = data.length;
  document.querySelector("#stat-open").textContent = data.filter((item) => item.facets.includes("open-web")).length;
  document.querySelector("#stat-process").textContent = data.filter((item) => item.processLevel !== "none").length;

  searchInput.value = state.query;
  if (!filterButtons.some((button) => button.dataset.filter === state.filter)) state.filter = "all";

  searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });
  sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
  });
  filterButtons.forEach((button) => button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    render();
  }));
  resetButton.addEventListener("click", reset);
  themeButton.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== searchInput && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      event.preventDefault();
      searchInput.focus();
    }
    if (event.key === "Escape" && document.activeElement === searchInput) {
      state.query = "";
      searchInput.value = "";
      render();
      searchInput.blur();
    }
  });

  render();
})();
