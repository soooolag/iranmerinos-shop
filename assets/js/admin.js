'use strict';

/* ============================================================
   IRAN MERINOS — admin.js
   ✅ Authentication check قبل از هر چیز
   ============================================================ */

// ── Auth Guard ────────────────────────────────────────────────
(function authGuard() {
  try {
    const token = localStorage.getItem('im_admin_token');
    if (!token) {
      // ✅ redirect فوری — صفحه admin بدون token در دسترس نیست
      window.location.replace('login.html?redirect=admin');
    }
  } catch {
    window.location.replace('login.html');
  }
})();

// ── Section navigation ────────────────────────────────────────
const sectionTitles = {
  dashboard: 'داشبورد',
  products:  'مدیریت محصولات',
  orders:    'مدیریت سفارشات',
  customers: 'مدیریت مشتریان',
  settings:  'تنظیمات',
};

function showSection(id, navEl) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('section-' + id)?.classList.add('active');
  if (navEl) navEl.classList.add('active');
  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = sectionTitles[id] || '';
}

// ── Logout ────────────────────────────────────────────────────
function adminLogout() {
  try { localStorage.removeItem('im_admin_token'); localStorage.removeItem('im_user'); } catch {}
  window.location.replace('login.html');
}

document.addEventListener('DOMContentLoaded', () => {
  // نمایش اطلاعات کاربر admin
  try {
    const user = JSON.parse(localStorage.getItem('im_user') || '{}');
    const nameEl = document.querySelector('.admin-user-name');
    if (nameEl && user.name) nameEl.textContent = user.name;
  } catch {}
});
