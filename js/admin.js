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
      <div class="admin__card-img" style="background-image:url('${photo.thumb_path || photo.path}')"></div>
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

// ── 이미지 리사이즈 (캔버스 사용, 원본보다 크게 확대하지 않음) ──
function resizeImageToBlob(file, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);

      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        blob ? resolve(blob) : reject(new Error('이미지 변환에 실패했습니다.'));
      }, 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('이미지를 불러올 수 없습니다.')); };
    img.src = url;
  });
}

// ── 사진 추가 (파일 업로드 → 2000px/400px 리사이즈 → Storage 업로드 → DB 저장) ──
function initAddForm(session) {
  const form      = document.getElementById('addPhotoForm');
  const errorEl   = document.getElementById('addPhotoError');
  const submitBtn = form.querySelector('.admin__submit');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorEl.textContent = '';

    const title       = document.getElementById('photoTitle').value.trim();
    const category     = document.getElementById('photoCategory').value;
    const subcategory  = document.getElementById('photoSubcategory').value.trim() || null;
    const sort_order   = Number(document.getElementById('photoSort').value) || 0;
    const file          = document.getElementById('photoFile').files[0];

    if (!title) { errorEl.textContent = '제목을 입력해주세요.'; return; }
    if (!file)  { errorEl.textContent = '사진 파일을 선택해주세요.'; return; }

    submitBtn.disabled = true;
    submitBtn.textContent = '업로드 중...';

    try {
      const uid = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const [displayBlob, thumbBlob] = await Promise.all([
        resizeImageToBlob(file, 2000, 0.82),
        resizeImageToBlob(file, 400, 0.75),
      ]);

      const displayKey = `display/${uid}.jpg`;
      const thumbKey    = `thumb/${uid}.jpg`;

      const { error: displayErr } = await _supabase.storage
        .from('gallery-images')
        .upload(displayKey, displayBlob, { contentType: 'image/jpeg' });
      if (displayErr) throw displayErr;

      const { error: thumbErr } = await _supabase.storage
        .from('gallery-images')
        .upload(thumbKey, thumbBlob, { contentType: 'image/jpeg' });
      if (thumbErr) throw thumbErr;

      const { data: displayUrlData } = _supabase.storage.from('gallery-images').getPublicUrl(displayKey);
      const { data: thumbUrlData }    = _supabase.storage.from('gallery-images').getPublicUrl(thumbKey);

      const { error: insertErr } = await _supabase.from('gallery_photos').insert({
        title, category, subcategory, sort_order,
        path: displayUrlData.publicUrl,
        thumb_path: thumbUrlData.publicUrl,
      });
      if (insertErr) throw insertErr;

      form.reset();
      document.getElementById('photoSort').value = '0';
      await loadPhotos();
    } catch (err) {
      errorEl.textContent = '추가에 실패했습니다: ' + err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '추가';
    }
  });
}

// ── 사진 삭제 ──
async function deletePhoto(id) {
  if (!confirm('이 사진을 갤러리에서 삭제하시겠습니까?')) return;

  const { data, error } = await _supabase.from('gallery_photos').delete().eq('id', id).select();
  if (error) { alert('삭제에 실패했습니다: ' + error.message); return; }
  if (!data || data.length === 0) {
    alert('삭제되지 않았습니다 (권한 문제로 추정, RLS 정책 확인 필요). 삭제된 건수: 0');
    return;
  }
  await loadPhotos();
}
