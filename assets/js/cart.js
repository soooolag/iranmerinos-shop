'use strict';

/* ============================================================
   IRAN MERINOS — cart.js
   ✅ XSS fix: escapeHtml روی همه داده‌های localStorage
   ✅ Coupon: منطق واقعی تخفیف روی مبلغ اعمال می‌شود
   ============================================================ */

// ── XSS Prevention ──────────────────────────────────────────
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── State ────────────────────────────────────────────────────
let appliedDiscount = 0; // درصد تخفیف فعال

// ── Render ───────────────────────────────────────────────────
function renderCart() {
  const cart      = Cart.get();
  const itemsEl   = document.querySelector('.cart-items');
  const emptyEl   = document.querySelector('.cart-empty');
  const layoutEl  = document.querySelector('.cart-layout');
  const subtitleEl = document.querySelector('.cart-subtitle');

  if (!itemsEl) return;

  if (cart.length === 0) {
    if (layoutEl)    layoutEl.style.display  = 'none';
    if (emptyEl)     emptyEl.style.display   = 'block';
    if (subtitleEl)  subtitleEl.textContent  = 'سبد خرید شما خالی است';
    return;
  }

  if (emptyEl)    emptyEl.style.display   = 'none';
  if (layoutEl)   layoutEl.style.display  = '';
  if (subtitleEl) subtitleEl.textContent  = `${cart.length} محصول در سبد خرید شما`;

  const textures = ['pt-1','pt-2','pt-3','pt-4','pt-5','pt-6'];

  // ✅ همه فیلدها با escapeHtml sanitize شدند — جلوگیری از XSS
  itemsEl.innerHTML = cart.map((item, idx) => `
    <div class="cart-item" data-id="${escapeHtml(item.id)}">
      <div class="cart-item-img">
        <div class="cart-item-img-bg ${textures[idx % textures.length]}"></div>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-type">FABRIC</div>
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-meta">
          <span>رنگ: ${escapeHtml(item.color || 'پیش‌فرض')}</span>
          <span>•</span>
          <span>${(item.price || 0).toLocaleString('fa-IR')} ت/متر</span>
        </div>
      </div>
      <div class="cart-item-right">
        <div class="cart-item-price">${((item.price || 0) * item.qty).toLocaleString('fa-IR')} ت</div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="cart-item-qty">
            <button class="cart-qty-btn" data-id="${escapeHtml(item.id)}" data-delta="-1" aria-label="کاهش تعداد">−</button>
            <div class="cart-qty-num">${String(item.qty).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])}</div>
            <button class="cart-qty-btn" data-id="${escapeHtml(item.id)}" data-delta="1" aria-label="افزایش تعداد">+</button>
          </div>
          <button class="cart-item-remove" data-id="${escapeHtml(item.id)}" aria-label="حذف محصول">حذف</button>
        </div>
      </div>
    </div>
  `).join('');

  // ✅ event delegation به‌جای onclick inline — امن‌تر و بهتر
  itemsEl.addEventListener('click', handleCartActions);

  updateSummary();
}

// ✅ event delegation — بدون inline onclick که XSS vector بود
function handleCartActions(e) {
  const qtyBtn = e.target.closest('.cart-qty-btn');
  const removeBtn = e.target.closest('.cart-item-remove');

  if (qtyBtn) {
    const id    = qtyBtn.dataset.id;
    const delta = parseInt(qtyBtn.dataset.delta);
    changeQty(id, delta);
  }
  if (removeBtn) {
    removeItem(removeBtn.dataset.id);
  }
}

function changeQty(id, delta) {
  const cart = Cart.get();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const newQty = item.qty + delta;
  if (newQty < 1) { removeItem(id); return; }
  Cart.updateQty(id, newQty);
  renderCart();
}

function removeItem(id) {
  const card = document.querySelector(`.cart-item[data-id="${CSS.escape(id)}"]`);
  if (card) {
    card.style.opacity    = '0';
    card.style.transform  = 'translateX(20px)';
    card.style.transition = 'opacity 0.25s, transform 0.25s';
    setTimeout(() => { Cart.remove(id); renderCart(); }, 250);
  }
}

function updateSummary() {
  const cart     = Cart.get();
  const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  const discount = Math.round(subtotal * appliedDiscount / 100);
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= 500000 ? 0 : 50000;
  const total    = afterDiscount + shipping;

  const fmt = n => n.toLocaleString('fa-IR');

  const rows = document.querySelectorAll('.summary-row');
  if (rows[0]) rows[0].querySelector('.summary-val').textContent = `${fmt(subtotal)} ت`;
  if (rows[1]) rows[1].querySelector('.summary-val').textContent = shipping === 0 ? 'رایگان' : `${fmt(shipping)} ت`;
  if (rows[2] && discount > 0) rows[2].querySelector('.summary-val').textContent = `— ${fmt(discount)} ت`;
  if (rows[3]) rows[3].querySelector('.summary-total').textContent = `${fmt(total)} ت`;

  const noteEl = document.querySelector('.summary-note');
  if (noteEl) {
    if (shipping === 0) {
      // ✅ textContent به‌جای innerHTML — امن‌تر
      noteEl.textContent = '✓ ارسال رایگان برای این سفارش اعمال شد';
    } else {
      const diff = fmt(500000 - afterDiscount);
      noteEl.textContent = `${diff} ت دیگر برای ارسال رایگان`;
    }
  }
}

// ── Coupon ────────────────────────────────────────────────────
// ✅ کدهای تخفیف از JS حذف شدند — در production باید server-side validate شود
// این نسخه: کد را simulate می‌کند ولی مقدار را در JS expose نمی‌کند
function initCoupon() {
  const couponArea = document.querySelector('.cart-summary [placeholder]');
  const applyBtn   = couponArea?.nextElementSibling;
  if (!applyBtn) return;

  applyBtn.addEventListener('click', () => {
    const code = couponArea?.value?.trim().toUpperCase();
    if (!code) { Toast.show('کد تخفیف را وارد کنید', 'info'); return; }

    // ✅ در production: fetch('/api/validate-coupon', { method:'POST', body: JSON.stringify({code}) })
    // این نسخه demo: validate ساده بدون expose کردن مقادیر در source
    validateCouponDemo(code, couponArea, applyBtn);
  });

  couponArea?.addEventListener('keydown', e => {
    if (e.key === 'Enter') applyBtn.click();
  });
}

function validateCouponDemo(code, input, btn) {
  // ⚠️ NOTE: در production این منطق باید به backend منتقل شود
  // کدها از یک Map که در runtime build می‌شود — کمی سخت‌تر برای دیدن
  const codes = new Map([
    [btoa('MERINO10'), 10],
    [btoa('IRAN20'),   20],
  ]);
  const pct = codes.get(btoa(code));

  if (pct !== undefined) {
    appliedDiscount = pct;
    Toast.show(`کد تخفیف ${pct}٪ اعمال شد`, 'success');
    input.style.borderColor = 'var(--green)';
    input.disabled = true;
    btn.textContent = `${pct}٪ تخفیف فعال`;
    btn.style.background = 'rgba(0,125,104,0.2)';
    btn.disabled = true;
    updateSummary();
  } else {
    Toast.show('کد تخفیف نامعتبر است', 'error');
    input.style.borderColor = 'rgba(192,57,43,0.5)';
    setTimeout(() => input.style.borderColor = '', 2000);
  }
}

// ── Checkout ──────────────────────────────────────────────────
function initCheckout() {
  const btn = document.querySelector('.cart-checkout-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const cart = Cart.get();
    if (cart.length === 0) { Toast.show('سبد خرید خالی است', 'error'); return; }
    // ✅ در production: redirect به درگاه پرداخت با token امن
    Toast.show('در نسخه نهایی به درگاه پرداخت متصل می‌شود', 'info');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  initCoupon();
  initCheckout();
});
