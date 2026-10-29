(() => {
  const input = document.getElementById('idea-search');
  const list = document.getElementById('idea-list');
  const filters = document.getElementById('idea-filters');
  if (!input || !list || !filters) return;
  const cards = [...list.querySelectorAll('.idea-card')];
  let currentCategory = 'all';
  const noMatches = document.getElementById('no-matches');
  function applyFilters() {
    const query = input.value.trim().toLocaleLowerCase('fa');
    let shown = 0;
    for (const card of cards) {
      const category = card.getAttribute('data-category');
      const haystack = (card.getAttribute('data-search') || '').toLocaleLowerCase('fa');
      const visible = (currentCategory === 'all' || category === currentCategory) && (!query || haystack.includes(query));
      card.hidden = !visible;
      if (visible) shown++;
    }
    if (noMatches) noMatches.hidden = shown > 0;
  }
  input.addEventListener('input', applyFilters);
  filters.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-category]');
    if (!target) return;
    currentCategory = target.getAttribute('data-category');
    filters.querySelectorAll('button[data-category]').forEach((button) => {
      const active = button === target;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    applyFilters();
  });
})();
