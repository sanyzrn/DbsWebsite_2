(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const cards = $("idea-list");
  const filters = $("idea-filters");
  const search = $("idea-search");
  let data = [];
  let category = "همه";

  const fields = [
    ["evidence", "شواهد تقاضا و رقبا"],
    ["product", "محصول و تمایز"],
    ["pricing", "مدل درآمد و قیمت"],
    ["mvp", "هزینه و زمان MVP"],
    ["risk", "ریسک اصلی"],
    ["acquisition", "جذب ۱۰ مشتری اول"],
    ["validation", "آزمون اعتبارسنجی"],
    ["notes", "فرضیات و نکات"],
  ];
  const metrics = [
    ["demand", "شواهد تقاضا"],
    ["differentiation", "فرصت تمایز"],
    ["build", "سادگی MVP"],
    ["reach", "دسترسی به مشتری"],
    ["revenue", "پتانسیل درآمد"],
    ["scale", "مقیاس‌پذیری"],
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }

  function safeLink(url) {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch { return false; }
  }

  // Never inject untrusted JSON as HTML: links and text are DOM nodes only.
  function appendTextWithLinks(container, value) {
    const input = String(value ?? "");
    const pattern = /https?:\/\/[^\s<>]+/g;
    let cursor = 0;
    for (const match of input.matchAll(pattern)) {
      const start = match.index ?? 0;
      container.append(document.createTextNode(input.slice(cursor, start)));
      let url = match[0];
      const trail = url.match(/[،؛,.;!?\])}]+$/u)?.[0] || "";
      url = url.slice(0, url.length - trail.length);
      if (safeLink(url)) {
        const link = el("a", "", url);
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer nofollow";
        container.append(link);
      } else container.append(document.createTextNode(url));
      if (trail) container.append(document.createTextNode(trail));
      cursor = start + match[0].length;
    }
    container.append(document.createTextNode(input.slice(cursor)));
  }

  function normalizedScore(scores, key) {
    const n = Number(scores?.[key]);
    return Number.isFinite(n) ? Math.max(0, Math.min(10, n)) : 0;
  }
  function score(idea) {
    const values = metrics.map(([key]) => normalizedScore(idea.scores, key));
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
  const str = (v) => typeof v === "string" ? v : "";


  function renderIdea(idea) {
    // The entire idea is a native, keyboard-accessible accordion item.
    // Grouping by name keeps only one idea expanded at a time.
    const article = el("details", "idea-card");
    article.setAttribute("name", "idea-archive");
    const toggle = el("summary", "idea-toggle");
    const top = el("div", "card-top");
    const left = el("div");
    left.append(el("span", "category", str(idea.category) || "سایر"));
    left.append(el("span", "entry-date", str(idea.date)));
    const scorePill = el("span", "score-pill", score(idea).toFixed(1));
    scorePill.append(el("small", "", " / ۱۰"));
    top.append(left, scorePill);
    toggle.append(top, el("h3", "idea-title", str(idea.title)));

    const hint = el("span", "expand-hint");
    const action = el("span", "expand-text", "مشاهده جزئیات");
    const arrow = el("span", "expand-arrow", "⌄");
    arrow.setAttribute("aria-hidden", "true");
    hint.append(action, arrow);
    toggle.append(hint);
    article.append(toggle);

    // Fallback for browsers without support for the details "name" group.
    article.addEventListener("toggle", () => {
      action.textContent = article.open ? "بستن جزئیات" : "مشاهده جزئیات";
      if (article.open) {
        for (const other of cards.querySelectorAll(".idea-card[open]")) {
          if (other !== article) other.open = false;
        }
      }
    });

    const body = el("div", "idea-body");
    body.append(el("p", "summary", str(idea.problem)));
    const audience = el("div", "audience");
    audience.append(el("span", "", "مشتری هدف"), el("strong", "", str(idea.audience)));
    body.append(audience);

    const grid = el("div", "detail-grid");
    for (const [key, label] of fields) {
      if (!str(idea[key]).trim()) continue;
      const section = el("section");
      section.append(el("h4", "", label));
      const content = el("p");
      appendTextWithLinks(content, idea[key]);
      section.append(content);
      grid.append(section);
    }
    body.append(grid);

    const scoring = el("div", "scoreboard");
    scoring.append(el("h4", "", "ارزیابی شش‌معیاره"));
    const rows = el("div", "metrics");
    for (const [key, label] of metrics) {
      const n = normalizedScore(idea.scores, key);
      const row = el("div", "metric");
      const header = el("div");
      header.append(el("span", "", label), el("b", "", `${n} / ۱۰`));
      const progress = el("progress");
      progress.max = 10;
      progress.value = n;
      progress.setAttribute("aria-label", label);
      row.append(header, progress);
      rows.append(row);
    }
    scoring.append(rows);
    body.append(scoring);
    article.append(body);
    return article;
  }

  function renderFilters() {
    filters.replaceChildren();
    const values = ["همه", ...new Set(data.map((x) => str(x.category)).filter(Boolean))];
    for (const value of values) {
      const button = el("button", "filter" + (value === category ? " active" : ""), value);
      button.type = "button";
      button.setAttribute("aria-pressed", String(value === category));
      button.addEventListener("click", () => { category = value; renderFilters(); renderCards(); });
      filters.append(button);
    }
  }

  function renderCards() {
    const query = search.value.trim().toLocaleLowerCase("fa");
    const found = data.filter((idea) => {
      if (category !== "همه" && str(idea.category) !== category) return false;
      const content = [idea.title, idea.category, idea.problem, idea.audience,
        ...fields.map(([k]) => idea[k])].map(str).join(" ").toLocaleLowerCase("fa");
      return content.includes(query);
    });
    cards.replaceChildren(...found.map(renderIdea));
    $("empty-state").hidden = data.length !== 0;
    $("no-matches").hidden = found.length !== 0 || data.length === 0;
  }

  async function load() {
    $("error-state").hidden = true;
    try {
      const response = await fetch("/idea/ideas.json?v=" + Date.now(), { cache: "no-store" });
      if (!response.ok) throw Error("HTTP " + response.status);
      const payload = await response.json();
      if (payload?.schemaVersion !== 1 || !Array.isArray(payload.ideas)) throw Error("Invalid archive schema");
      data = payload.ideas.filter((i) => i && typeof i === "object" && typeof i.title === "string");
      const average = data.length ? data.reduce((acc, idea) => acc + score(idea), 0) / data.length : 0;
      $("stat-count").textContent = data.length.toLocaleString("fa-IR");
      $("stat-average").textContent = data.length ? average.toFixed(1) : "—";
      $("stat-date").textContent = data[0]?.date || "—";
      renderFilters();
      renderCards();
    } catch (error) {
      console.error("Idea archive load failed", error);
      cards.replaceChildren();
      $("error-state").hidden = false;
      $("stat-count").textContent = "—";
    }
  }

  search.addEventListener("input", renderCards);
  $("retry-load").addEventListener("click", load);
  load();
})();
