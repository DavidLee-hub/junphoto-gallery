// admin.js - 갤러리 사진 관리 (관리자 전용)

let allAdminPhotos = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await _supabase.auth.getSession();

  // 관리자 아닌 경우 갤러리로 리다이렉트
  if (!isAdmin(session)) {
    alert('관리자만 접근할 수 있습니다.');
    location.href = 'gallery.html';
    return;
  }

  document.getElementById('adminMain').style.display = 'block';

  await loadPhotos();
  initAddForm(session);
  initFilter();
});

// ── 사진 목록 로드 ──
async function loadPhotos() {
  const { data, error } = await _supabase
    .from('gallery_photos')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('사진 로드 실패:', error);
    return;
  }

  allAdminPhotos = data || [];
  document.getElementById('photoCount').textContent = `(${allAdminPhotos.length}장)`;
  renderGrid(currentFilter);
}

// ── 그리드 렌더링 ──
function renderGrid(filter) {
  const grid = document.getElementById('photoGrid');
  const filtered = filter === 'all'
    ? allAdminPhotos
    : allAdminPhotos.filter(p => p.category === filter);

  if (!filtered.length) {
    grid.innerHTML = '<p class="admin__empty">등록된 사진이 없습니다.</p>';
    return;
  }

  grid.innerHTML = filtered.map(photo => `
    <div class="admin__card" data-id="${photo.id}">
      <div class="admin__card-img" style="background-image:url('${photo.path}')"></div>
      <div class="admin__card-info">
        <p class="admin__card-title">${photo.title}</p>
        <p class="admin__card-meta">${photo.category}${photo.subcategory ? ' / ' + photo.subcategory : ''}</p>
        <p class="admin__card-path" title="${photo.path}">${photo.path}</p>
      </div>
      <button class="admin__card-del" data-id="${photo.id}">삭제</button>
    </div>
  `).join('');

  // 삭제 이벤트
  grid.querySelectorAll('.admin__card-del').forEach(btn => {
    btn.addEventListener('click', () => deletePhoto(Number(btn.dataset.id)));
  });
}

// ── 카테고리 필터 ──
function initFilter() {
  document.querySelectorAll('.admin__filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin__filter-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentFilter = btn.dataset.filter;
      renderGrid(currentFilter);
    });
  });
}

// ── 사진 추가 ──
function initAddForm(session) {
  const form    = document.getElementById('addPhotoForm');
  const errorEl = document.getElementById('addPhotoError');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorEl.textContent = '';

    const title       = document.getElementById('photoTitle').value.trim();
    const category    = document.getElementById('photoCategory').value;
    const subcategory = document.getElementById('photoSubcategory').value.trim() || null;
    const path        = document.getElementById('photoPath').value.trim();
    const sort_order  = Number(document.getElementById('photoSort').value) || 0;

    if (!title) { errorEl.textContent = '제목을 입력해주세요.'; return; }
    if (!path)  { errorEl.textContent = '이미지 경로 또는 URL을 입력해주세요.'; return; }

    const { error } = await _supabase.from('gallery_photos').insert({
      title, category, subcategory, path, sort_order
    });

    if (error) { errorEl.textContent = '추가에 실패했습니다: ' + error.message; return; }

    // 폼 초기화
    form.reset();
    document.getElementById('photoSort').value = '0';
    await loadPhotos();
  });
}

// ── 사진 삭제 ──
async function deletePhoto(id) {
  if (!confirm('이 사진을 갤러리에서 삭제하시겠습니까?')) return;

  const { error } = await _supabase.from('gallery_photos').delete().eq('id', id);
  if (error) { alert('삭제에 실패했습니다.'); return; }
  await loadPhotos();
}
