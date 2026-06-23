'use strict';

/* ============================================================
   IRAN MERINOS — app.js  (production-ready)
   ✅ Toast XSS fix: پیام‌های سیستمی — نه input کاربر
   ✅ Cart badge با اعداد فارسی
   ✅ Header scroll با requestAnimationFrame
   ✅ Mobile Escape key support
   ✅ localStorage error boundary
   ============================================================ */

// ── Utils ─────────────────────────────────────────────────────
const toPersian = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

function safeLocalStorage(action, key, value) {
  try {
    if (action === 'get') return localStorage.getItem(key);
    if (action === 'set') localStorage.setItem(key, value);
    if (action === 'remove') localStorage.removeItem(key);
  } catch { /* private mode یا storage full */ }
  return null;
}

// ── Cart ─────────────────────────────────────────────────────
const Cart = window.Cart = {
  key: 'im_cart',

  get() {
    try { return JSON.parse(safeLocalStorage('get', this.key) || '[]'); }
    catch { return []; }
  },

  save(cart) {
    safeLocalStorage('set', this.key, JSON.stringify(cart));
    this.updateBadge();
  },

  add(product) {
    const cart     = this.get();
    const existing = cart.find(i => i.id === product.id && i.color === product.color);
    if (existing) {
      existing.qty += product.qty || 1;
    } else {
      cart.push({ ...product, qty: product.qty || 1 });
    }
    this.save(cart);
    Toast.show('محصول به سبد خرید اضافه شد', 'success');
  },

  remove(id) {
    this.save(this.get().filter(i => i.id !== id));
  },

  updateQty(id, qty) {
    const cart = this.get();
    const item = cart.find(i => i.id === id);
    if (item) { item.qty = Math.max(1, qty); this.save(cart); }
  },

  count() {
    return this.get().reduce((s, i) => s + i.qty, 0);
  },

  // ✅ اعداد فارسی در badge
  updateBadge() {
    const count = this.count();
    document.querySelectorAll('.cart-badge').forEach(b => {
      b.textContent = toPersian(count > 0 ? count : 0);
      b.style.background = count > 0 ? 'var(--green)' : 'rgba(0,125,104,0.3)';
    });
  }
};

// ── Toast ─────────────────────────────────────────────────────
// ✅ پیام‌ها همیشه از constants سیستمی هستند — نه input کاربر
// ✅ SVG icons hardcoded — XSS vector حذف شد
const Toast = window.Toast = {
  container: null,

  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    Object.assign(this.container.style, {
      position: 'fixed', bottom: '24px', left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', gap: '8px',
      zIndex: '9999', pointerEvents: 'none', direction: 'rtl'
    });
    document.body.appendChild(this.container);
  },

  show(msg, type = 'info', duration = 3000) {
    this.init();
    const themes = {
      success: { bg: 'rgba(0,125,104,0.95)', border: 'rgba(0,200,160,0.3)' },
      error:   { bg: 'rgba(192,57,43,0.95)',  border: 'rgba(231,76,60,0.3)' },
      info:    { bg: 'rgba(8,18,15,0.95)',     border: 'rgba(0,125,104,0.3)' },
    };
    // ✅ SVG icons به‌صورت DOM node ساخته می‌شوند — نه innerHTML از string
    const svgPaths = {
      success: 'M20 6 9 17 4 12',
      error:   'M18 6 6 18 M6 6 18 18',
      info:    'M12 8v4 M12 16h.01',
    };
    const c = themes[type] || themes.info;

    const toast = document.createElement('div');
    toast.style.cssText = `
      display:flex;align-items:center;gap:10px;padding:12px 18px;
      background:${c.bg};border:1px solid ${c.border};border-radius:10px;
      font-size:13px;font-weight:600;color:#EAF5F2;font-family:inherit;
      box-shadow:0 8px 24px rgba(0,0,0,0.3);backdrop-filter:blur(12px);
      pointer-events:all;opacity:0;transform:translateY(12px);
      transition:opacity 0.25s ease,transform 0.25s ease;white-space:nowrap;
    `;

    // ✅ textContent برای پیام — نه innerHTML
    const icon = document.createElementNS('http://www.w3.org/2000/svg','svg');
    icon.setAttribute('width','16'); icon.setAttribute('height','16');
    icon.setAttribute('viewBox','0 0 24 24'); icon.setAttribute('fill','none');
    icon.setAttribute('stroke','currentColor'); icon.setAttribute('stroke-width','2.5');
    icon.setAttribute('stroke-linecap','round');
    const pathEl = document.createElementNS('http://www.w3.org/2000/svg','path');
    pathEl.setAttribute('d', svgPaths[type] || svgPaths.info);
    icon.appendChild(pathEl);

    const msgNode = document.createTextNode(msg); // ✅ textContent
    toast.appendChild(icon);
    toast.appendChild(msgNode);
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    this.container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ── Mobile Menu ───────────────────────────────────────────────
function initMobileMenu() {
  const header = document.querySelector('header');
  if (!header) return;

  const burger = document.createElement('button');
  burger.className = 'mobile-burger';
  burger.setAttribute('aria-label', 'باز کردن منو');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-controls', 'mobile-nav');
  burger.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>`;
  Object.assign(burger.style, {
    display: 'none', width: '36px', height: '36px', borderRadius: '8px',
    background: 'transparent', border: '1px solid rgba(0,125,104,0.2)',
    cursor: 'pointer', color: 'rgba(180,220,215,0.7)',
    alignItems: 'center', justifyContent: 'center',
  });

  document.querySelector('.header-actions')?.prepend(burger);

  const mobileNav = document.createElement('nav');
  mobileNav.id = 'mobile-nav';
  mobileNav.className = 'mobile-nav';
  mobileNav.setAttribute('aria-hidden', 'true');
  mobileNav.setAttribute('aria-label', 'منوی موبایل');

  let linksHtml = '';
  document.querySelectorAll('.header-nav a').forEach(a => {
    linksHtml += `<a href="${a.getAttribute('href')}" class="${a.className}">${a.textContent}</a>`;
  });
  mobileNav.innerHTML = linksHtml;
  document.querySelector('.header-wrap')?.appendChild(mobileNav);

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @media (max-width: 768px) {
      .mobile-burger { display: flex !important; }
      .header-nav { display: none !important; }
    }
    .mobile-nav { display:none; flex-direction:column; background:rgba(4,10,8,0.98);
      border-top:1px solid rgba(0,125,104,0.12); border-radius:0 0 14px 14px; }
    .mobile-nav.open { display:flex; }
    .mobile-nav a { padding:14px 24px; font-size:15px; font-weight:500;
      color:rgba(180,220,215,0.6); border-bottom:1px solid rgba(0,125,104,0.08);
      transition:color 0.2s,background 0.2s; }
    .mobile-nav a:last-child { border-bottom:none; }
    .mobile-nav a:hover,.mobile-nav a.active { color:#EAF5F2; background:rgba(0,125,104,0.08); }
    .mobile-nav a:focus-visible { outline:2px solid var(--green); outline-offset:2px; }
  `;
  document.head.appendChild(styleEl);

  const openMenu = () => {
    mobileNav.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'بستن منو');
    mobileNav.setAttribute('aria-hidden', 'false');
    burger.style.background   = 'rgba(0,125,104,0.1)';
    burger.style.borderColor  = 'rgba(0,125,104,0.4)';
  };
  const closeMenu = () => {
    mobileNav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'باز کردن منو');
    mobileNav.setAttribute('aria-hidden', 'true');
    burger.style.background  = 'transparent';
    burger.style.borderColor = 'rgba(0,125,104,0.2)';
  };

  burger.addEventListener('click', () => {
    mobileNav.classList.contains('open') ? closeMenu() : openMenu();
  });

  // ✅ بستن با Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu();
  });

  document.addEventListener('click', e => {
    if (!header.contains(e.target) && !mobileNav.contains(e.target)) closeMenu();
  });
}

// ── Header Search ──────────────────────────────────────────────
function initHeaderSearch() {
  const searchBtn = document.querySelector('.icon-btn[aria-label="جستجو"]');
  if (!searchBtn) return;

  const overlay = document.createElement('div');
  overlay.id = 'search-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'جستجو در محصولات');
  overlay.style.cssText = `position:fixed;inset:0;z-index:500;background:rgba(4,10,8,0.92);
    backdrop-filter:blur(16px);display:flex;align-items:flex-start;justify-content:center;
    padding-top:120px;opacity:0;pointer-events:none;transition:opacity 0.25s ease;direction:rtl;`;

  // ✅ ساخت DOM — نه innerHTML با string ناامن
  const inner = document.createElement('div');
  inner.style.cssText = 'width:100%;max-width:600px;padding:0 24px;';

  const inputWrap = document.createElement('div');
  inputWrap.style.cssText = 'position:relative;';

  const searchInput = document.createElement('input');
  searchInput.id = 'headerSearchInput';
  searchInput.type = 'search';
  searchInput.placeholder = 'جستجو در محصولات...';
  searchInput.setAttribute('aria-label', 'جستجو در محصولات');
  searchInput.style.cssText = `width:100%;height:56px;background:rgba(8,18,15,0.9);
    border:1px solid rgba(0,125,104,0.3);border-radius:14px;padding:0 56px 0 20px;
    font-size:16px;color:#EAF5F2;font-family:inherit;direction:rtl;outline:none;
    box-shadow:0 0 0 3px rgba(0,125,104,0.1);`;

  const hint = document.createElement('p');
  hint.style.cssText = 'margin-top:12px;font-size:12px;color:rgba(120,185,175,0.4);text-align:center;';
  hint.textContent = 'برای بستن Escape را فشار دهید';

  inputWrap.appendChild(searchInput);
  inner.appendChild(inputWrap);
  inner.appendChild(hint);
  overlay.appendChild(inner);
  document.body.appendChild(overlay);

  const open = () => {
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    setTimeout(() => searchInput.focus(), 50);
  };
  const close = () => {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
  };

  searchBtn.addEventListener('click', open);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      if (q) window.location.href = `shop.html?q=${encodeURIComponent(q)}`;
    }
  });
}

// ── Add to Cart ────────────────────────────────────────────────
function initAddToCart() {
  document.querySelectorAll('.product-add-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const card = this.closest('.product-card');
      if (!card) return;

      const id        = card.getAttribute('onclick')?.match(/id=(\d+)/)?.[1] || String(Date.now());
      const name      = card.querySelector('.product-name')?.textContent.trim() || 'محصول';
      const priceText = card.querySelector('.product-price')?.textContent || '0';
      const price     = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;

      Cart.add({ id, name, price, qty: 1, color: card.dataset.color || 'پیش‌فرض' });

      const orig = this.innerHTML;
      this.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> افزوده شد`;
      this.style.background = 'var(--green-dark)';
      setTimeout(() => { this.innerHTML = orig; this.style.background = ''; }, 1800);
    });
  });
}

// ── Header Scroll — با requestAnimationFrame ───────────────────
function initHeaderScroll() {
  const wrap = document.querySelector('.header-wrap');
  if (!wrap) return;
  let last    = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        wrap.style.top = (y > 80 && y > last) ? '-90px' : '16px';
        last    = y;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ── Reveal ────────────────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

// ── Active nav ─────────────────────────────────────────────────
function initActiveNav() {
  const cur = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.header-nav a, .mobile-nav a').forEach(a => {
    if (a.getAttribute('href') === cur) a.classList.add('active');
  });
}

// ── Init ───────────────────────────────────────────────────────
// ── Cart button — opens cart.html on every page ───────────────
function initCartButton() {
  const cartBtn = document.querySelector('.icon-btn[aria-label="سبد خرید"]');
  if (!cartBtn) return;
  // Only wire up navigation if not already handled by inline onclick
  if (!cartBtn.getAttribute('onclick')) {
    cartBtn.addEventListener('click', () => {
      location.href = 'cart.html';
    });
  }
}

function initApp() {
  Cart.updateBadge();
  initReveal();
  initActiveNav();
  initMobileMenu();
  initHeaderSearch();
  initAddToCart();
  initCartButton();
  initHeaderScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
