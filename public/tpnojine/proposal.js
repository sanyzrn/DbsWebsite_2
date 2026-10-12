/* Nojin proposal. No tracking, cookies, or external requests. */
(() => {
  "use strict";
  const printButton = document.querySelector("[data-print]");
  printButton?.addEventListener("click", () => window.print());

  const progress = document.querySelector(".reading-progress");
  let scheduled = false;
  function updateProgress() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const amount = Math.min(100, Math.max(0, window.scrollY / maxScroll * 100));
    if (progress instanceof HTMLElement) progress.style.width = amount + "%";
    scheduled = false;
  }
  function requestUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateProgress);
  }
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  requestUpdate();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)) return;

  const sections = document.querySelectorAll(".section-heading, .pillar, .audit-card, .strategy-card, .deliverable, .timeline-item, .kpi, .competitor-panel, .journey-detail");
  const observer = new IntersectionObserver((entries) => {
    for (const item of entries) {
      if (item.isIntersecting) {
        item.target.classList.add("in-view");
        observer.unobserve(item.target);
      }
    }
  }, { rootMargin: "0px 0px -35px 0px", threshold: .08 });

  sections.forEach((element) => {
    element.classList.add("reveal");
    observer.observe(element);
  });
  document.documentElement.classList.add("js");
})();
