// header.js - 헤더 스크롤 감지 + 햄버거 메뉴 + 관리자 GNB 메뉴

const header = document.getElementById('header');

// ── 관리자 로그인 시 갤러리 관리 메뉴 표시 ──
document.addEventListener('DOMContentLoaded', async () => {
  const gnbAdminMenu = document.getElementById('gnbAdminMenu');
  if (!gnbAdminMenu) return;
  try {
    const { data } = await _supabase.auth.getSession();
    if (isAdmin(data?.session)) gnbAdminMenu.style.display = '';
  } catch(e) { /* 세션 없음 */ }
});

// 스크롤 시 헤더에 is-scrolled 클래스 토글
window.addEventListener('scroll', () => {
  if (window.scrollY > 0) {
    header.classList.add('is-scrolled');
  } else {
    header.classList.remove('is-scrolled');
  }
});

// ── 햄버거 메뉴 토글 ──
const hamburgerBtn = document.getElementById('hamburgerBtn');
const gnb = document.querySelector('.gnb');

if (hamburgerBtn && gnb) {
  hamburgerBtn.addEventListener('click', () => {
    gnb.classList.toggle('is-open');
  });

  // 서브메뉴 클릭 토글 (태블릿/모바일: hover 대신 클릭)
  gnb.querySelectorAll('.gnb__item--has-sub > .gnb__link').forEach(link => {
    link.addEventListener('click', e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const sub = link.nextElementSibling;
        if (sub) sub.classList.toggle('is-open');
      }
    });
  });
}
