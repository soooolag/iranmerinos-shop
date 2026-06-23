'use strict';

/* ============================================================
   IRAN MERINOS — shop.js
   ============================================================ */

// ── State ────────────────────────────────────────────────────

const FilterState = {
  types:    [],      // نوع پارچه
  colors:   [],      // رنگ
  seasons:  [],      // فصل
  minPrice: 500000,
  maxPrice: 2000000,
  search:   '',
};

// ── Pagination State ─────────────────────────────────────────
const PaginationState = {
  currentPage:   1,
  itemsPerPage:  12,
  filteredCards: [],
};

// ── Apply all filters ────────────────────────────────────────

// تبدیل اعداد فارسی/عربی به انگلیسی
function toEnDigit(str) {
  return String(str || '0')
    .replace(/[۰-۹]/g, d => d.charCodeAt(0) - 0x06F0)
    .replace(/[٠-٩]/g, d => d.charCodeAt(0) - 0x0660)
    .replace(/,/g, '');
}

function parsePrice(card) {
  return parseInt(toEnDigit(card.dataset.price)) || 0;
}

function applyFilters() {
  const cards = Array.from(document.querySelectorAll('.product-card'));

  PaginationState.filteredCards = cards.filter(card => {
    const type    = (card.dataset.type    || '').toLowerCase();
    const season  = (card.dataset.season  || '');
    const color   = (card.dataset.color   || '');
    const price   = parsePrice(card);
    const name    = (card.querySelector('.product-name')?.textContent || '').toLowerCase();
    const desc    = (card.querySelector('.product-desc')?.textContent || '').toLowerCase();

    const matchType   = FilterState.types.length   === 0 || FilterState.types.some(t => type.includes(t.toLowerCase()));
    const matchSeason = FilterState.seasons.length === 0 || FilterState.seasons.includes(season);
    const matchColor  = FilterState.colors.length  === 0 || FilterState.colors.includes(color);
    const matchPrice  = price >= FilterState.minPrice && price <= FilterState.maxPrice;
    const matchSearch = !FilterState.search || name.includes(FilterState.search) || desc.includes(FilterState.search);

    return matchType && matchSeason && matchColor && matchPrice && matchSearch;
  });

  PaginationState.currentPage = 1;
  renderPage();
}

// ── Render current page ───────────────────────────────────────

function renderPage() {
  const { currentPage, itemsPerPage, filteredCards } = PaginationState;
  const allCards  = Array.from(document.querySelectorAll('.product-card'));
  const start     = (currentPage - 1) * itemsPerPage;
  const end       = start + itemsPerPage;
  const pageCards = new Set(filteredCards.slice(start, end));

  allCards.forEach(card => {
    const show = pageCards.has(card);
    card.style.display   = show ? '' : 'none';
    card.style.animation = show ? 'shopFadeIn 0.3s ease' : '';
  });

  const countEl = document.getElementById('visibleCount');
  if (countEl) countEl.textContent = filteredCards.length;

  renderPagination();
}

// ── Render pagination buttons ─────────────────────────────────

function renderPagination() {
  const paginationEl = document.querySelector('.shop-pagination');
  if (!paginationEl) return;

  const { currentPage, itemsPerPage, filteredCards } = PaginationState;
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / itemsPerPage));

  if (totalPages <= 1) {
    paginationEl.style.display = 'none';
    return;
  }
  paginationEl.style.display = '';

  const toFa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

  const pages = ['prev'];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }
  pages.push('next');

  paginationEl.innerHTML = pages.map(p => {
    if (p === 'prev') return `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>`;
    if (p === 'next') return `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button>`;
    if (p === '...') return `<span style="color:var(--text-faint);font-size:13px;padding:0 4px">...</span>`;
    return `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="goToPage(${p})">${toFa(p)}</button>`;
  }).join('');
}

function goToPage(page) {
  const totalPages = Math.ceil(PaginationState.filteredCards.length / PaginationState.itemsPerPage);
  if (page < 1 || page > totalPages) return;
  PaginationState.currentPage = page;
  renderPage();
}

// ── Type filter ──────────────────────────────────────────────

// نگاشت برچسب فارسی به مقدار data-type انگلیسی
const FABRIC_TYPE_MAP = {
  'مرینوس':  'merino',
  'ویول':    'viol',
  'گابردین': 'gabardine',
  'فلانل':   'flannel',
  'تویید':   'tweed',
};

function toggleFilter(el) {
  const label = el.querySelector('.filter-label')?.textContent.trim();
  const block = el.closest('.filter-list');
  const allItem = block?.querySelector('.filter-item:first-child');
  const isAll = label === 'همه';

  if (isAll) {
    block.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    FilterState.types = [];
  } else {
    allItem?.classList.remove('active');
    el.classList.toggle('active');
    FilterState.types = Array.from(block.querySelectorAll('.filter-item.active'))
      .map(i => {
        const lbl = i.querySelector('.filter-label')?.textContent.trim();
        return FABRIC_TYPE_MAP[lbl] || lbl;
      })
      .filter(Boolean);
    if (FilterState.types.length === 0) allItem?.classList.add('active');
  }
  applyFilters();
}

function clearFilter(btn) {
  const block = btn.closest('.sidebar-block');
  block.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
  block.querySelector('.filter-item:first-child')?.classList.add('active');
  FilterState.types = [];
  applyFilters();
}

// ── Season filter ────────────────────────────────────────────

function initSeasonFilter() {
  const seasonList = document.getElementById('seasonFilterList');
  if (!seasonList) return;

  seasonList.querySelectorAll('.filter-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('active');
      FilterState.seasons = Array.from(seasonList.querySelectorAll('.filter-item.active'))
        .map(i => i.querySelector('.filter-label')?.textContent.trim())
        .filter(Boolean);
      applyFilters();
    });
  });
}

// ── Color filter ─────────────────────────────────────────────

function clearColors() {
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
  FilterState.colors = [];
  document.getElementById('colorClear')?.style.setProperty('display','none');
  applyFilters();
}

function initColorFilter() {
  document.querySelectorAll('#colorSwatches .color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatch.classList.toggle('active');
      FilterState.colors = Array.from(document.querySelectorAll('#colorSwatches .color-swatch.active'))
        .map(s => s.dataset.color)
        .filter(Boolean);

      const clearBtn = document.getElementById('colorClear');
      if (clearBtn) clearBtn.style.display = FilterState.colors.length > 0 ? 'inline' : 'none';
      applyFilters();
    });
  });
}

// ── Price range slider ───────────────────────────────────────

function initPriceRange() {
  const minThumb = document.getElementById('priceMin');
  const maxThumb = document.getElementById('priceMax');
  const fill     = document.getElementById('priceRangeFill');
  const minLabel = document.getElementById('priceMinLabel');
  const maxLabel = document.getElementById('priceMaxLabel');
  if (!minThumb || !maxThumb) return;

  const fmt = n => n.toLocaleString('fa-IR');

  function updateSlider() {
    const min = parseInt(minThumb.value);
    const max = parseInt(maxThumb.value);
    const range = parseInt(maxThumb.max) - parseInt(minThumb.min);
    const left  = ((min - parseInt(minThumb.min)) / range) * 100;
    const right = ((parseInt(maxThumb.max) - max) / range) * 100;

    if (fill) {
      fill.style.left  = left  + '%';
      fill.style.right = right + '%';
    }
    if (minLabel) minLabel.textContent = fmt(min);
    if (maxLabel) maxLabel.textContent = fmt(max);

    FilterState.minPrice = min;
    FilterState.maxPrice = max;
  }

  minThumb.addEventListener('input', () => {
    if (parseInt(minThumb.value) > parseInt(maxThumb.value) - 100000) {
      minThumb.value = parseInt(maxThumb.value) - 100000;
    }
    updateSlider();
    applyFilters();
  });

  maxThumb.addEventListener('input', () => {
    if (parseInt(maxThumb.value) < parseInt(minThumb.value) + 100000) {
      maxThumb.value = parseInt(minThumb.value) + 100000;
    }
    updateSlider();
    applyFilters();
  });

  // preset buttons
  document.querySelectorAll('.price-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.price-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      minThumb.value = btn.dataset.min;
      maxThumb.value = btn.dataset.max;
      updateSlider();
      applyFilters();
    });
  });

  updateSlider();
}

// ── Sort ─────────────────────────────────────────────────────

function initSort() {
  const select = document.querySelector('.shop-sort');
  if (!select) return;

  select.addEventListener('change', () => {
    const grid  = document.getElementById('productsGrid');
    const cards = Array.from(grid.querySelectorAll('.product-card'));

    const getPrice  = c => parsePrice(c);
    const getRating = c => {
      const m = c.querySelector('.product-stars')?.textContent.match(/\((\d+)\)/);
      return m ? parseInt(m[1]) : 0;
    };

    cards.sort((a,b) => {
      if (select.value === 'ارزان‌ترین')  return getPrice(a)  - getPrice(b);
      if (select.value === 'گران‌ترین')   return getPrice(b)  - getPrice(a);
      if (select.value === 'پرفروش‌ترین') return getRating(b) - getRating(a);
      return 0;
    });

    cards.forEach(c => grid.appendChild(c));
    // بعد از مرتب‌سازی، صفحه رو دوباره رندر می‌کنیم
    applyFilters();
  });
}

// ── View toggle ──────────────────────────────────────────────

function setView(v) {
  const grid = document.getElementById('productsGrid');
  const gb   = document.getElementById('gridViewBtn');
  const lb   = document.getElementById('listViewBtn');
  if (!grid) return;
  grid.classList.toggle('list-view', v === 'list');
  gb.classList.toggle('active', v !== 'list');
  lb.classList.toggle('active', v === 'list');
  localStorage.setItem('im_view', v);
}

// ── Search ───────────────────────────────────────────────────

function initSearch() {
  const input = document.getElementById('shopSearch');
  if (!input) return;

  const params = new URLSearchParams(location.search);
  const q = params.get('q');
  if (q) { input.value = q; FilterState.search = q.toLowerCase(); } // بدون applyFilters — آخر init صدا زده می‌شه

  input.addEventListener('input', () => {
    FilterState.search = input.value.toLowerCase().trim();
    applyFilters();
  });
}

// ── Cart ─────────────────────────────────────────────────────

function initShopCart() {
  document.querySelectorAll('.product-add-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const card  = this.closest('.product-card');
      const id    = card?.getAttribute('onclick')?.match(/id=(\d+)/)?.[1] || String(Date.now());
      const name  = card?.querySelector('.product-name')?.textContent || 'محصول';
      const price = parseInt(card?.dataset.price?.replace(/,/g,'') || '0');
      Cart.add({ id, name, price, qty: 1, color: card?.dataset.color || 'پیش‌فرض' });
      const orig = this.innerHTML;
      this.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> افزوده شد`;
      this.style.background = 'var(--green-dark)';
      setTimeout(() => { this.innerHTML = orig; this.style.background = ''; }, 1800);
    });
  });
}

// ── Animation ────────────────────────────────────────────────

const style = document.createElement('style');
style.textContent = `
  @keyframes shopFadeIn {
    from { opacity:0; transform:translateY(6px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;
document.head.appendChild(style);

// ── Init ─────────────────────────────────────────────────────


// ── Keyboard navigation برای product cards ───────────────────
function initCardKeyboard() {
  document.querySelectorAll('.product-card[tabindex]').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter') card.click();
    });
  });
}
document.addEventListener('DOMContentLoaded', () => {
  initPriceRange();   // اول — مقادیر قیمت رو ست می‌کنه
  initSearch();       // فقط مقدار search رو ست می‌کنه، applyFilters صدا نمی‌زنه
  initSort();
  initColorFilter();
  initSeasonFilter();
  initShopCart();
  const saved = localStorage.getItem('im_view');
  if (saved === 'list') setView('list');
  applyFilters();
  initCardKeyboard();
});
