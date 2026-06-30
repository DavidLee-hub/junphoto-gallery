// auth.js - 로그인/로그아웃 및 아이콘 상태 관리

// ── 이메일 @앞 추출 (작성자명으로 사용) ──
function getAuthorName(email) {
  if (!email) return '익명';
  if (email === 'cslee835@gmail.com') return '관리자';
  return email.split('@')[0];
}

// ── 관리자 확인 ──
function isAdmin(session) {
  return !!(session && session.user.email === 'cslee835@gmail.com');
}

// ── 관리자 모드 상태 확인 ──
function isAdminMode() {
  return sessionStorage.getItem('adminMode') === 'true';
}

document.addEventListener('DOMContentLoaded', () => {
  const userBtn      = document.getElementById('userBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose   = document.getElementById('modalClose');
  const iconLogin    = userBtn.querySelector('.icon-login');
  const iconLogout   = userBtn.querySelector('.icon-logout');
  const adminModeBtn = document.getElementById('adminModeBtn');

  // ── 현재 로그인 상태 확인 및 아이콘 초기화 ──
  _supabase.auth.getSession().then(({ data: { session } }) => {
    updateIcon(session);
    updateAdminBtn(session);
  });

  // ── 인증 상태 변경 감지 ──
  _supabase.auth.onAuthStateChange((_event, session) => {
    updateIcon(session);
    updateAdminBtn(session);
    // 로그아웃 시 관리자 모드 자동 해제
    if (!session) sessionStorage.removeItem('adminMode');
  });

  // ── 아이콘 전환 ──
  function updateIcon(session) {
    if (session) {
      iconLogin.style.display  = 'none';
      iconLogout.style.display = 'block';
      userBtn.setAttribute('aria-label', '로그아웃');
    } else {
      iconLogin.style.display  = 'block';
      iconLogout.style.display = 'none';
      userBtn.setAttribute('aria-label', '로그인');
    }
  }

  // ── 관리자 모드 버튼 표시/상태 업데이트 ──
  function updateAdminBtn(session) {
    if (!adminModeBtn) return;
    if (isAdmin(session)) {
      // 관리자 로그인 시 자동으로 관리자 모드 활성화
      if (sessionStorage.getItem('adminMode') === null) {
        sessionStorage.setItem('adminMode', 'true');
      }
      adminModeBtn.style.display = 'flex';
      const active = isAdminMode();
      adminModeBtn.classList.toggle('is-active', active);
      adminModeBtn.textContent = active ? '관리자 모드 ON' : '관리자 모드';
    } else {
      adminModeBtn.style.display = 'none';
    }
  }

  // ── 관리자 모드 토글 ──
  if (adminModeBtn) {
    adminModeBtn.addEventListener('click', async () => {
      const { data: { session } } = await _supabase.auth.getSession();
      if (!isAdmin(session)) return;
      sessionStorage.setItem('adminMode', !isAdminMode());
      location.reload();
    });
  }

  // ── 유저 버튼 클릭 ──
  userBtn.addEventListener('click', async () => {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
      // 로그인 상태 → 로그아웃
      await _supabase.auth.signOut();
    } else {
      // 로그아웃 상태 → 모달 오픈
      openModal();
    }
  });

  // ── 모달 열기/닫기 ──
  function openModal() {
    modalOverlay.classList.add('is-open');
  }

  function closeModal() {
    modalOverlay.classList.remove('is-open');
    document.getElementById('loginError').textContent  = '';
    document.getElementById('signupError').textContent = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });

  // ── 탭 전환 ──
  document.querySelectorAll('.modal__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.modal__tab').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      const isLogin = tab.dataset.tab === 'login';
      document.getElementById('loginForm').style.display  = isLogin ? 'flex' : 'none';
      document.getElementById('signupForm').style.display = isLogin ? 'none' : 'flex';
    });
  });

  // ── 로그인 ──
  document.getElementById('loginSubmit').addEventListener('click', async () => {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl  = document.getElementById('loginError');
    errorEl.textContent = '';

    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) {
      errorEl.textContent = '이메일 또는 비밀번호를 확인해주세요.';
    } else {
      closeModal();
    }
  });

  // ── 회원가입 ──
  document.getElementById('signupSubmit').addEventListener('click', async () => {
    const email    = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const errorEl  = document.getElementById('signupError');
    errorEl.textContent = '';

    const { data, error } = await _supabase.auth.signUp({ email, password });
    if (error) {
      errorEl.textContent = '회원가입에 실패했습니다. 다시 시도해주세요.';
    } else if (data.session) {
      // 이메일 인증 불필요 → 즉시 로그인 처리
      closeModal();
    } else {
      // 이메일 인증 필요
      errorEl.style.color = '#38a169';
      errorEl.textContent = '이메일을 확인하여 가입을 완료해주세요.';
    }
  });
});
