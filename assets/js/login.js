'use strict';

/* ============================================================
   IRAN MERINOS — login.js
   ✅ Session ذخیره می‌شود بعد از ورود موفق
   ✅ Admin token برای redirect به admin
   ✅ label/input با for/id مرتبط
   ✅ autocomplete صحیح
   ============================================================ */

function switchTab(tab) {
  document.querySelectorAll('.login-tab').forEach((t, i) => {
    t.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'register' && i === 1));
  });
  document.querySelectorAll('.login-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + tab)?.classList.add('active');
}

// ── Validation ────────────────────────────────────────────────
function showError(input, msg) {
  clearError(input);
  input.style.borderColor = 'rgba(192,57,43,0.6)';
  input.setAttribute('aria-invalid', 'true');
  const err = document.createElement('div');
  err.className = 'field-error';
  err.id        = input.id + '-error';
  err.style.cssText = 'font-size:11px;color:#E74C3C;margin-top:4px;';
  err.textContent   = msg; // ✅ textContent — نه innerHTML
  input.setAttribute('aria-describedby', err.id);
  input.parentElement.appendChild(err);
}

function clearError(input) {
  input.style.borderColor = '';
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
  input.parentElement.querySelector('.field-error')?.remove();
}

const validatePhone = val => /^09\d{9}$/.test(val.replace(/[\s\-]/g, ''));
const validateEmail = val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
const validatePassword = val => val.length >= 6;

// ── Session Save ─────────────────────────────────────────────
function saveSession(user, isAdmin = false) {
  try {
    localStorage.setItem('im_user', JSON.stringify(user));
    if (isAdmin) {
      // ✅ token — در production باید JWT از server باشد
      const token = btoa(user.phone + ':' + Date.now());
      localStorage.setItem('im_admin_token', token);
    }
  } catch { /* storage unavailable */ }
}

// ── Login ─────────────────────────────────────────────────────
function initLoginForm() {
  const form      = document.getElementById('panel-login');
  if (!form) return;
  const phoneInput = document.getElementById('login-phone');
  const passInput  = document.getElementById('login-password');
  const submitBtn  = form.querySelector('.login-submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', e => {
    e.preventDefault();
    let valid = true;
    [phoneInput, passInput].forEach(i => i && clearError(i));

    const phone = phoneInput?.value.trim();
    if (!phone) {
      showError(phoneInput, 'شماره موبایل یا ایمیل را وارد کنید'); valid = false;
    } else if (!validatePhone(phone) && !validateEmail(phone)) {
      showError(phoneInput, 'شماره موبایل یا ایمیل معتبر وارد کنید'); valid = false;
    }

    const pass = passInput?.value;
    if (!pass) {
      showError(passInput, 'رمز عبور را وارد کنید'); valid = false;
    } else if (!validatePassword(pass)) {
      showError(passInput, 'رمز عبور باید حداقل ۶ کاراکتر باشد'); valid = false;
    }

    if (!valid) return;

    submitBtn.textContent = 'در حال ورود...';
    submitBtn.disabled    = true;

    setTimeout(() => {
      // ✅ ذخیره session بعد از ورود موفق
      const isAdmin = phone === '09120000000' || phone === 'admin@iranmerinos.ir';
      saveSession({ phone, name: 'کاربر', isAdmin }, isAdmin);

      Toast.show('ورود موفق!', 'success');

      // redirect — اگه از admin آمده بود برگرد
      const params   = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      setTimeout(() => {
        location.href = (redirect === 'admin' && isAdmin) ? 'admin.html' : 'index.html';
      }, 1000);
    }, 800);
  });
}

// ── Register ──────────────────────────────────────────────────
function initRegisterForm() {
  const form = document.getElementById('panel-register');
  if (!form) return;
  const firstName   = document.getElementById('reg-firstname');
  const lastName    = document.getElementById('reg-lastname');
  const phone       = document.getElementById('reg-phone');
  const pass        = document.getElementById('reg-password');
  const passConfirm = document.getElementById('reg-password-confirm');
  const submitBtn   = form.querySelector('.login-submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', e => {
    e.preventDefault();
    let valid = true;
    [firstName, lastName, phone, pass, passConfirm].forEach(i => i && clearError(i));

    if (!firstName?.value.trim())       { showError(firstName, 'نام را وارد کنید'); valid = false; }
    if (!lastName?.value.trim())        { showError(lastName, 'نام خانوادگی را وارد کنید'); valid = false; }
    if (!validatePhone(phone?.value||'')){ showError(phone, 'شماره موبایل معتبر وارد کنید'); valid = false; }
    if (!validatePassword(pass?.value||'')){ showError(pass, 'رمز عبور باید حداقل ۶ کاراکتر باشد'); valid = false; }
    if (pass?.value !== passConfirm?.value){ showError(passConfirm, 'رمز عبور تکرار نشد'); valid = false; }

    if (!valid) return;
    submitBtn.textContent = 'در حال ثبت‌نام...';
    submitBtn.disabled    = true;

    setTimeout(() => {
      saveSession({ phone: phone.value, name: `${firstName.value} ${lastName.value}` });
      Toast.show('ثبت‌نام موفق! خوش آمدید', 'success');
      setTimeout(() => location.href = 'index.html', 1000);
    }, 1000);
  });
}

// ── Password Toggle ───────────────────────────────────────────
function initPasswordToggle() {
  document.querySelectorAll('input[type="password"]').forEach(input => {
    const wrap   = input.parentElement;
    const toggle = document.createElement('button');
    toggle.type  = 'button';
    toggle.setAttribute('aria-label', 'نمایش/مخفی رمز عبور');
    toggle.style.cssText = `position:absolute;left:14px;top:50%;transform:translateY(-50%);
      background:transparent;border:none;cursor:pointer;color:rgba(120,185,175,0.4);padding:4px;transition:color 0.2s;`;
    toggle.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>`;
    wrap.appendChild(toggle);
    toggle.addEventListener('click', () => {
      const isPass = input.type === 'password';
      input.type   = isPass ? 'text' : 'password';
      toggle.style.color = isPass ? 'var(--green)' : 'rgba(120,185,175,0.4)';
      toggle.setAttribute('aria-label', isPass ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور');
    });
  });
}

// ── Label/Input IDs (اضافه شدن برای accessibility) ───────────
function fixLabelInputAssociation() {
  const map = {
    'login-phone':           'شماره موبایل یا ایمیل',
    'login-password':        'رمز عبور',
    'reg-firstname':         'نام',
    'reg-lastname':          'نام خانوادگی',
    'reg-phone':             'شماره موبایل',
    'reg-password':          'رمز عبور',
    'reg-password-confirm':  'تکرار رمز عبور',
  };
  Object.entries(map).forEach(([id, label]) => {
    const input = document.getElementById(id);
    const labelEl = input?.closest('.login-form-group')?.querySelector('.login-form-label');
    if (input && labelEl) labelEl.setAttribute('for', id);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
  initPasswordToggle();
  fixLabelInputAssociation();
});
