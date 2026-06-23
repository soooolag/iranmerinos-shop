'use strict';

/* ============================================================
   IRAN MERINOS — contact.js
   ============================================================ */

// ── FAQ accordion ────────────────────────────────────────────

function toggleFaq(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

// ── Contact form validation ──────────────────────────────────

function initContactForm() {
  const submitBtn = document.querySelector('.form-submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', e => {
    e.preventDefault();
    const inputs   = document.querySelectorAll('.form-input');
    const textarea = document.querySelector('.form-textarea');
    const select   = document.querySelector('.form-select');
    let valid = true;

    // پاک کردن خطاهای قبلی
    document.querySelectorAll('.field-error').forEach(e => e.remove());
    inputs.forEach(i => i.style.borderColor = '');
    if (textarea) textarea.style.borderColor = '';

    // نام — اجباری
    const nameInput = inputs[0];
    if (!nameInput?.value.trim()) {
      showFieldError(nameInput, 'نام را وارد کنید');
      valid = false;
    }

    // موبایل — اجباری
    const phoneInput = inputs[1];
    if (!phoneInput?.value.trim()) {
      showFieldError(phoneInput, 'شماره تماس را وارد کنید');
      valid = false;
    }

    // پیام — اجباری
    if (!textarea?.value.trim()) {
      showFieldError(textarea, 'پیام خود را بنویسید');
      valid = false;
    }

    if (valid) {
      submitBtn.disabled = true;
      const origText = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        در حال ارسال...
      `;

      setTimeout(() => {
        Toast.show('پیام شما با موفقیت ارسال شد', 'success');
        submitBtn.innerHTML = origText;
        submitBtn.disabled = false;
        // پاک کردن فرم
        inputs.forEach(i => { if(i) i.value = ''; });
        if (textarea) textarea.value = '';
      }, 1500);
    }
  });

  // real-time validation
  document.querySelectorAll('.form-input, .form-textarea').forEach(el => {
    el.addEventListener('blur', () => {
      if (el.value.trim()) {
        el.style.borderColor = 'rgba(0,125,104,0.4)';
        el.parentElement?.querySelector('.field-error')?.remove();
      }
    });
  });
}

function showFieldError(el, msg) {
  if (!el) return;
  el.style.borderColor = 'rgba(192,57,43,0.5)';
  const err = document.createElement('div');
  err.className = 'field-error';
  err.style.cssText = 'font-size:11px;color:#E74C3C;margin-top:4px;';
  err.textContent = msg;
  el.parentElement?.appendChild(err);
}

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
});
