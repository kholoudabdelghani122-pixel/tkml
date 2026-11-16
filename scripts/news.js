(function () {
  "use strict";
  const articles = (window.TKML_NEWS_ARTICLES || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const articleBySlug = new Map(articles.map(article => [article.slug, article]));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const formatDate = value => new Intl.DateTimeFormat("en", { year:"numeric", month:"long", day:"numeric" }).format(new Date(value + "T12:00:00"));
  const slugify = value => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const card = (article, root) => { const base = new URL(root.dataset.newsBase || "./", location.href); const image = article.featuredImage ? `<img class="news-card__image" src="${escapeHtml(article.featuredImage)}" alt="${escapeHtml(article.featuredImageAlt || article.title)}" loading="lazy">` : ""; return `<a class="news-card" href="${new URL(encodeURIComponent(article.slug) + "/", base).href}">${image}<span class="news-card__top"><span class="news-card__category">${escapeHtml(article.category)}</span><span class="news-card__date">${formatDate(article.date)}</span></span><span class="news-card__title">${escapeHtml(article.title)}</span><span class="news-card__excerpt">${escapeHtml(article.excerpt)}</span><span class="news-card__read">Read article</span></a>`; };

  const listing = document.querySelector("[data-news-listing]");
  if (listing) {
    const search = listing.querySelector("[data-news-search]");
    const filters = listing.querySelector("[data-news-filters]");
    const grid = listing.querySelector("[data-news-grid]");
    const count = listing.querySelector("[data-news-count]");
    const empty = listing.querySelector("[data-news-empty]");
    const clear = listing.querySelector("[data-news-clear]");
    const categories = ["All", ...new Set(articles.map(article => article.category))];
    let activeCategory = "All";
    filters.innerHTML = categories.map((category, index) => `<button type="button" class="news-filter${index === 0 ? " is-active" : ""}" data-category="${escapeHtml(category)}" aria-pressed="${index === 0}">${escapeHtml(category)}</button>`).join("");
    const update = () => {
      const query = search.value.trim().toLocaleLowerCase();
      const visible = articles.filter(article =>
        (activeCategory === "All" || article.category === activeCategory) &&
        (!query || article.title.toLocaleLowerCase().includes(query) || article.excerpt.toLocaleLowerCase().includes(query))
      );
      count.textContent = `${visible.length} ${visible.length === 1 ? "article" : "articles"}`;
      grid.innerHTML = visible.map(article => card(article, listing)).join("");
      empty.hidden = visible.length > 0;
      grid.hidden = visible.length === 0;
    };
    filters.addEventListener("click", event => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      activeCategory = button.dataset.category;
      filters.querySelectorAll("[data-category]").forEach(item => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      update();
    });
    search.addEventListener("input", update);
    clear.addEventListener("click", () => {
      activeCategory = "All";
      search.value = "";
      filters.querySelectorAll("[data-category]").forEach((item, index) => {
        const selected = index === 0;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      update();
      search.focus();
    });
    update();
  }

  const articleRoot = document.querySelector("[data-news-article]");
  if (articleRoot) {
    const article = articleBySlug.get(articleRoot.dataset.newsArticle);
    if (!article) {
      articleRoot.innerHTML = `<p class="news-empty">This article could not be found. <a href="../">Back to News</a></p>`;
      return;
    }
    const title = articleRoot.querySelector("[data-article-title]");
    const category = articleRoot.querySelector("[data-article-category]");
    const date = articleRoot.querySelector("[data-article-date]");
    const intro = articleRoot.querySelector("[data-article-intro]");
    const toc = articleRoot.querySelector("[data-article-toc]");
    const body = articleRoot.querySelector("[data-article-body]");
    title.textContent = article.title;
    category.textContent = article.category;
    date.dateTime = article.date;
    date.textContent = formatDate(article.date);
    intro.textContent = article.intro.replace(/^Development sample — /, "");
    const featured = articleRoot.querySelector("[data-article-image]");
    if (article.featuredImage && featured) { featured.hidden = false; featured.innerHTML = `<img src="${escapeHtml(article.featuredImage)}" alt="${escapeHtml(article.featuredImageAlt || article.title)}">`; }
    const sections = article.sections.map((section, index) => {
      const id = `${article.slug}-${String(index + 1).padStart(2,"0")}-${slugify(section.heading)}`;
      return { ...section, id, number: index + 1 };
    });
    toc.innerHTML = sections.map(section => `<a class="news-toc__link" href="#${escapeHtml(section.id)}"><span>${section.number}</span><span>${escapeHtml(section.heading)}</span></a>`).join("");
    body.innerHTML = sections.map(section => `<section class="news-article__section"><h2 id="${escapeHtml(section.id)}">${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p></section>`).join("");
    if (location.hash) { const hashId = decodeURIComponent(location.hash.slice(1)); requestAnimationFrame(() => document.getElementById(hashId)?.scrollIntoView({ block: "start", behavior: "auto" })); }
    const related = articles.filter(item => item.slug !== article.slug && item.category === article.category).slice(0, 3);
    const relatedSection = document.querySelector("[data-related-section]");
    const relatedGrid = document.querySelector("[data-related-grid]");
    relatedSection.hidden = related.length === 0;
    relatedGrid.innerHTML = related.map(item => card(item, articleRoot)).join("");
    document.title = `${article.title} — tkml News`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = article.excerpt;
  }
})();
