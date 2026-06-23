'use strict';

/* ============================================================
   IRAN MERINOS — product.js
   Loads product data dynamically from window.PRODUCTS
   (defined in data/products.js) based on the ?id= URL param.
   Falls back to product id=1 if the param is missing/invalid.
   ============================================================ */

(function () {

  // ── Helpers ───────────────────────────────────────────────────
  const _toPersian = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  const _fmt       = n => Number(n).toLocaleString('fa-IR');

  const ALL_TEXTURES = ['pt-1', 'pt-2', 'pt-3', 'pt-4', 'pt-5', 'pt-6'];

  // ── Resolve which product to show ────────────────────────────
  const urlId   = parseInt(new URLSearchParams(location.search).get('id')) || 1;
  const product = (window.PRODUCTS || []).find(p => p.id === urlId)
               || (window.PRODUCTS || [])[0];

  if (!product) {
    console.error('product.js: window.PRODUCTS is empty or not loaded. Make sure data/products.js is included before product.js.');
    return;
  }

  // ── Mutable state ────────────────────────────────────────────
  const state = {
    selectedColor: product.colors[0],
    qty:           1,
  };

  // ── DOM population ───────────────────────────────────────────
  function populatePage() {
    document.title = product.name + ' — ' + product.subtitle + ' | ایران مرینوس';

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', product.name + ' ' + product.subtitle + ' — ایران مرینوس');

    const bcLast = document.querySelector('.breadcrumb span:last-child');
    if (bcLast) bcLast.textContent = product.name + ' — ' + product.subtitle;

    const typeLabel = document.querySelector('.product-info-label');
    if (typeLabel) typeLabel.innerHTML = '<span class="dot"></span> ' + product.typeLabel;

    const nameEl = document.querySelector('.product-info-name');
    if (nameEl) nameEl.innerHTML = product.name + '<br>' + product.subtitle;

    const ratingNum = document.querySelector('.rating-num');
    if (ratingNum) ratingNum.textContent = product.rating;

    const ratingCnt = document.querySelector('.rating-cnt');
    if (ratingCnt) ratingCnt.textContent = _toPersian(product.reviewCount) + ' نظر';

    const ratingSold = document.querySelector('.rating-sold');
    if (ratingSold) ratingSold.textContent = product.soldCount + ' فروش';

    const reviewTab = document.querySelector('[data-tab="tab-reviews"]');
    if (reviewTab) reviewTab.textContent = 'نظرات (' + _toPersian(product.reviewCount) + ')';

    // Badge
    const badgeEl = document.querySelector('.gallery-badge-wrap .product-badge');
    if (badgeEl) {
      if (product.badge) {
        badgeEl.textContent = product.badge;
        badgeEl.className   = 'product-badge ' + (product.badgeClass || 'badge-new');
      } else {
        badgeEl.style.display = 'none';
      }
    }

    // Price
    const priceEl = document.querySelector('.product-price-num');
    if (priceEl) {
      priceEl.setAttribute('data-base', String(state.selectedColor.price));
      priceEl.textContent = _fmt(state.selectedColor.price);
    }

    // Old price / discount
    const oldWrap    = document.querySelector('.product-price-old-wrap');
    const oldPriceEl = document.querySelector('.product-price-old-num');
    const discountEl = document.querySelector('.product-discount-badge');
    if (product.oldPrice && oldWrap) {
      if (oldPriceEl) oldPriceEl.textContent = _fmt(product.oldPrice) + ' ت';
      if (discountEl) {
        const pct = Math.round((1 - product.price / product.oldPrice) * 100);
        discountEl.textContent = _toPersian(pct) + '٪ تخفیف';
      }
      oldWrap.style.display = '';
    } else if (oldWrap) {
      oldWrap.style.display = 'none';
    }

    // Specs grid (quick-facts section)
    const specsGrid = document.querySelector('.product-specs-grid');
    if (specsGrid && product.specs) {
      const s = product.specs;
      specsGrid.innerHTML =
        '<div class="spec-item"><div class="spec-key">الیاف</div><div class="spec-val">' + s.fiber + '</div></div>' +
        '<div class="spec-item"><div class="spec-key">وزن</div><div class="spec-val">' + s.weight + '</div></div>' +
        '<div class="spec-item"><div class="spec-key">عرض</div><div class="spec-val">' + s.width + '</div></div>' +
        '<div class="spec-item"><div class="spec-key">کشور تولید</div><div class="spec-val">' + s.origin + '</div></div>' +
        '<div class="spec-item"><div class="spec-key">فصل کاربرد</div><div class="spec-val">' + s.season + '</div></div>' +
        '<div class="spec-item"><div class="spec-key">کاربرد</div><div class="spec-val">' + s.use + '</div></div>';
    }

    // Full spec table (tab)
    const specTable = document.querySelector('.spec-table');
    if (specTable && product.specs) {
      const s = product.specs;
      specTable.innerHTML =
        '<tr><td>نوع پارچه</td><td>' + product.typeLabel + '</td></tr>' +
        '<tr><td>ترکیب الیاف</td><td>' + s.fiber + '</td></tr>' +
        '<tr><td>وزن</td><td>' + s.weight + '</td></tr>' +
        '<tr><td>عرض پارچه</td><td>' + s.width + '</td></tr>' +
        '<tr><td>کشور تولید</td><td>' + s.origin + '</td></tr>' +
        '<tr><td>نوع بافت</td><td>' + s.weave + '</td></tr>' +
        '<tr><td>رنگ</td><td>' + product.color + '</td></tr>' +
        '<tr><td>دمای شستشو</td><td>' + s.washTemp + '</td></tr>' +
        '<tr><td>نحوه شستشو</td><td>' + s.washMethod + '</td></tr>' +
        '<tr><td>کاربرد</td><td>' + s.use + '</td></tr>' +
        '<tr><td>فصل کاربرد</td><td>' + s.season + '</td></tr>' +
        '<tr><td>حداقل سفارش</td><td>' + s.minOrder + '</td></tr>';
    }

    // Description tab
    const descPanel = document.querySelector('#tab-desc .tab-desc');
    if (descPanel && product.desc) {
      descPanel.innerHTML = product.desc
        .split('\n\n')
        .map(function(p) { return '<p>' + p.trim() + '</p>'; })
        .join('');
    }

    // Color selector
    const colorSel     = document.querySelector('.color-selector');
    const colorLabelEl = document.getElementById('selectedColor');
    if (colorSel && product.colors.length) {
      colorSel.innerHTML = product.colors.map(function(c, i) {
        return '<div class="color-opt' + (i === 0 ? ' active' : '') + '" style="background:' + c.hex + '" data-name="' + c.name + '" title="' + c.name + '"></div>';
      }).join('');
      if (colorLabelEl) colorLabelEl.textContent = product.colors[0].name;
    }

    // Gallery — initial textures
    var mainImg = document.querySelector('.gallery-main-img');
    if (mainImg) {
      ALL_TEXTURES.forEach(function(t) { mainImg.classList.remove(t); });
      mainImg.classList.add(state.selectedColor.textures[0]);
    }
    document.querySelectorAll('.gallery-thumb-img').forEach(function(img, i) {
      ALL_TEXTURES.forEach(function(t) { img.classList.remove(t); });
      img.classList.add(state.selectedColor.textures[i] || state.selectedColor.textures[0]);
    });
  }

  // ── Gallery helpers ───────────────────────────────────────────
  function setMainTexture(texture, animate) {
    var mainImg = document.querySelector('.gallery-main-img');
    if (!mainImg) return;
    if (animate) {
      mainImg.style.opacity   = '0';
      mainImg.style.transform = 'scale(0.97)';
      setTimeout(function() {
        ALL_TEXTURES.forEach(function(t) { mainImg.classList.remove(t); });
        mainImg.classList.add(texture);
        mainImg.style.opacity   = '1';
        mainImg.style.transform = 'scale(1)';
      }, 180);
    } else {
      ALL_TEXTURES.forEach(function(t) { mainImg.classList.remove(t); });
      mainImg.classList.add(texture);
    }
  }

  function initGallery() {
    var mainImg = document.querySelector('.gallery-main-img');
    if (mainImg) mainImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

    document.querySelectorAll('.gallery-thumb').forEach(function(thumb, i) {
      thumb.addEventListener('click', function() {
        document.querySelectorAll('.gallery-thumb').forEach(function(t) { t.classList.remove('active'); });
        thumb.classList.add('active');
        var texture = state.selectedColor.textures[i] || state.selectedColor.textures[0];
        setMainTexture(texture, true);
      });
    });
  }

  // ── Color selector ────────────────────────────────────────────
  function initColorSelector() {
    var priceEl      = document.querySelector('.product-price-num');
    var colorLabelEl = document.getElementById('selectedColor');

    var colorSel = document.querySelector('.color-selector');
    if (!colorSel) return;

    colorSel.addEventListener('click', function(e) {
      var opt = e.target.closest('.color-opt');
      if (!opt) return;

      document.querySelectorAll('.color-opt').forEach(function(o) { o.classList.remove('active'); });
      opt.classList.add('active');

      var name  = opt.getAttribute('data-name') || '';
      var color = product.colors.find(function(c) { return c.name === name; }) || product.colors[0];
      state.selectedColor = color;

      if (colorLabelEl) colorLabelEl.textContent = name;
      if (priceEl) {
        priceEl.setAttribute('data-base', String(color.price));
        updateDisplayPrice();
      }

      setMainTexture(color.textures[0], true);
      document.querySelectorAll('.gallery-thumb-img').forEach(function(img, i) {
        ALL_TEXTURES.forEach(function(t) { img.classList.remove(t); });
        img.classList.add(color.textures[i] || color.textures[0]);
      });
      document.querySelectorAll('.gallery-thumb').forEach(function(t, i) {
        t.classList.toggle('active', i === 0);
      });
    });
  }

  // ── Price ─────────────────────────────────────────────────────
  function updateDisplayPrice() {
    var el = document.querySelector('.product-price-num');
    if (el) el.textContent = _fmt(state.selectedColor.price * state.qty);
  }

  // ── Qty ───────────────────────────────────────────────────────
  window.updateQty = function (delta) {
    state.qty = Math.max(1, Math.min(100, state.qty + delta));
    var el = document.getElementById('qtyNum');
    if (el) el.textContent = _toPersian(state.qty);
    updateDisplayPrice();
  };

  // ── Tabs ──────────────────────────────────────────────────────
  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var target = btn.getAttribute('data-tab');
        if (!target) return;
        document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ── Add to cart ───────────────────────────────────────────────
  function initProductAddToCart() {
    var btn = document.querySelector('.btn-add-cart');
    if (!btn) return;

    btn.addEventListener('click', function() {
      var cartObj = window.Cart;
      if (!cartObj) { console.error('Cart module not loaded'); return; }

      cartObj.add({
        id:    String(product.id),
        name:  product.name + ' \u2014 ' + product.subtitle,
        price: state.selectedColor.price,
        qty:   state.qty,
        color: state.selectedColor.name,
      });

      var orig = btn.innerHTML;
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> \u0627\u0641\u0632\u0648\u062f\u0647 \u0634\u062f';
      btn.style.background = 'var(--green-dark, #005544)';
      btn.disabled = true;
      setTimeout(function() {
        btn.innerHTML        = orig;
        btn.style.background = '';
        btn.disabled         = false;
      }, 2000);
    });
  }

  // ── Wishlist ──────────────────────────────────────────────────
  function initWishlist() {
    var btn = document.querySelector('.btn-wishlist');
    if (!btn) return;

    var id = String(product.id);
    var getList  = function() { try { return JSON.parse(localStorage.getItem('im_wishlist') || '[]'); } catch(e) { return []; } };
    var saveList = function(arr) { try { localStorage.setItem('im_wishlist', JSON.stringify(arr)); } catch(e) {} };

    var setWished = function(active) {
      var svg = btn.querySelector('svg');
      btn.style.color       = active ? 'var(--green)' : '';
      btn.style.borderColor = active ? 'rgba(0,125,104,0.5)' : '';
      btn.style.background  = active ? 'rgba(0,125,104,0.08)' : '';
      if (svg) {
        svg.style.fill   = active ? 'var(--green)' : 'none';
        svg.style.stroke = active ? 'var(--green)' : 'currentColor';
      }
    };

    setWished(getList().includes(id));

    btn.addEventListener('click', function() {
      var list = getList();
      var has  = list.includes(id);
      if (has) {
        list = list.filter(function(i) { return i !== id; });
        setWished(false);
        if (window.Toast) window.Toast.show('\u0627\u0632 \u0639\u0644\u0627\u0642\u0647\u200c\u0645\u0646\u062f\u06cc\u200c\u0647\u0627 \u062d\u0630\u0641 \u0634\u062f', 'info');
      } else {
        list.push(id);
        setWished(true);
        if (window.Toast) window.Toast.show('\u0628\u0647 \u0639\u0644\u0627\u0642\u0647\u200c\u0645\u0646\u062f\u06cc\u200c\u0647\u0627 \u0627\u0636\u0627\u0641\u0647 \u0634\u062f', 'success');
      }
      saveList(list);
    });
  }

  // ── Related products ──────────────────────────────────────────
  function renderRelated() {
    var grid = document.querySelector('.related-grid');
    if (!grid || !window.PRODUCTS) return;

    var related = window.PRODUCTS
      .filter(function(p) { return p.id !== product.id; })
      .slice(0, 4);

    grid.innerHTML = related.map(function(p) {
      return '<div class="product-card" onclick="location.href=\'product.html?id=' + p.id + '\'">' +
        '<div class="product-img" style="aspect-ratio:4/3;">' +
          '<div class="product-img-bg ' + p.texture + '" style="position:absolute;inset:0;"></div>' +
          '<div class="product-img-overlay"></div>' +
        '</div>' +
        '<div class="product-body">' +
          '<div class="product-meta"><span class="product-type">' + p.typeLabel + '</span><div class="product-stars">\u2605\u2605\u2605\u2605\u2605</div></div>' +
          '<h3 class="product-name">' + p.name + ' \u2014 ' + p.subtitle + '</h3>' +
          '<div class="product-footer">' +
            '<div class="product-price">' + _fmt(p.price) + ' \u062a</div>' +
            '<button class="product-add-btn" onclick="event.stopPropagation()">' +
              '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>\u0627\u0641\u0632\u0648\u062f\u0646' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    grid.querySelectorAll('.product-add-btn').forEach(function(btn, i) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var p = related[i];
        if (!p || !window.Cart) return;
        window.Cart.add({ id: String(p.id), name: p.name + ' \u2014 ' + p.subtitle, price: p.price, qty: 1, color: p.color });
      });
    });
  }

  // ── Init ──────────────────────────────────────────────────────
  function initProduct() {
    populatePage();
    initGallery();
    initColorSelector();
    initTabs();
    initProductAddToCart();
    initWishlist();
    renderRelated();

    var qtyEl = document.getElementById('qtyNum');
    if (qtyEl) qtyEl.textContent = _toPersian(state.qty);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProduct);
  } else {
    initProduct();
  }

})();
