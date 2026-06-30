// gallery.js - 갤러리 메인 로직

let allPhotos = [];
let currentPhotos = []; // 현재 카테고리 사진 목록
let currentIndex = 0;   // 현재 히어로에 표시 중인 사진 인덱스
const aspectCache = new Map(); // 사진 비율 캐시 (path → {w, h})

// ── 초기 실행 ──
async function initGallery() {
  const { data, error } = await _supabase
    .from('gallery_photos')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data || !data.length) {
    console.error('갤러리 사진 로드 실패:', error);
    return;
  }

  allPhotos = data;

  const defaultPhotos = allPhotos.filter(p => p.category !== 'recent');
  currentPhotos = defaultPhotos;
  currentIndex = defaultPhotos.length - 2;

  // renderHero → renderThumbnails → positionArrows → 카운터 순서 보장
  await renderHero(currentIndex);
  renderThumbnails(currentPhotos, currentIndex);
  positionArrows();
  updateCounter();

  // 로딩 표시 숨김
  document.getElementById('heroLoading')?.classList.add('is-hidden');

  initGnb();
  initArrows();
  initFooterGrid();
  initSwipe();
}

initGallery();

// ── GNB 클릭 이벤트 초기화 ──
function initGnb() {
  const gnbLinks = document.querySelectorAll('[data-category]');

  gnbLinks.forEach(link => {
    link.addEventListener('click', async e => {
      e.preventDefault();

      const category = link.dataset.category;
      const subcategory = link.dataset.subcategory || null;

      // 활성 클래스 초기화
      gnbLinks.forEach(l => l.classList.remove('is-active'));
      link.classList.add('is-active');

      // 서브카테고리 클릭 시 부모 GNB 링크도 활성화
      const parentItem = link.closest('.gnb__item--has-sub');
      if (parentItem) {
        const parentLink = parentItem.querySelector('.gnb__link');
        if (parentLink) parentLink.classList.add('is-active');
      }

      currentPhotos = filterPhotos(category, subcategory);
      currentIndex = 0;

      await renderHero(currentIndex);
      renderThumbnails(currentPhotos, currentIndex);
      positionArrows();
      updateCounter();
    });
  });
}

// ── 화살표 클릭 이벤트 초기화 ──
function initArrows() {
  const prevBtn = document.querySelector('.hero__arrow--prev');
  const nextBtn = document.querySelector('.hero__arrow--next');

  prevBtn.addEventListener('click', async () => {
    if (!currentPhotos.length) return;
    currentIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
    await renderHero(currentIndex);
    renderThumbnails(currentPhotos, currentIndex);
    positionArrows();
    updateCounter();
  });

  nextBtn.addEventListener('click', async () => {
    if (!currentPhotos.length) return;
    currentIndex = (currentIndex + 1) % currentPhotos.length;
    await renderHero(currentIndex);
    renderThumbnails(currentPhotos, currentIndex);
    positionArrows();
    updateCounter();
  });
}

// ── 모바일 스와이프 탐색 ──
function initSwipe() {
  const hero = document.querySelector('.hero');
  let touchStartX = 0;

  hero.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  hero.addEventListener('touchend', async e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 50 || !currentPhotos.length) return; // 50px 미만은 무시

    if (dx < 0) { // 왼쪽 스와이프 → 다음
      currentIndex = (currentIndex + 1) % currentPhotos.length;
    } else {      // 오른쪽 스와이프 → 이전
      currentIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
    }
    await renderHero(currentIndex);
    renderThumbnails(currentPhotos, currentIndex);
    positionArrows();
    updateCounter();
  }, { passive: true });
}

// ── 카테고리 필터링 ──
function filterPhotos(category, subcategory) {
  return allPhotos.filter(p => {
    if (p.category !== category) return false;
    if (subcategory && p.subcategory !== subcategory) return false;
    return true;
  });
}

// ── 히어로 이미지 렌더링 (페이드 전환 + 비율 캐시) ──
function renderHero(index) {
  const slide = document.querySelector('.hero__slide');
  if (!currentPhotos.length) return Promise.resolve();

  const photo = currentPhotos[index];

  // 페이드 아웃 후 이미지 교체, 페이드 인
  const applyImage = () => {
    slide.style.backgroundImage = `url('${photo.path}')`;
    requestAnimationFrame(() => { slide.style.opacity = '1'; });
  };

  slide.style.opacity = '0';

  return new Promise(resolve => {
    if (aspectCache.has(photo.path)) {
      // 캐시 있음 → 페이드 아웃(250ms) 후 교체
      setTimeout(() => { applyImage(); resolve(); }, 250);
    } else {
      // 처음 보는 사진 → 로드 완료 후 교체 + 캐시 저장
      const img = new Image();
      img.onload = () => {
        aspectCache.set(photo.path, { w: img.naturalWidth, h: img.naturalHeight });
        applyImage();
        resolve();
      };
      img.onerror = () => { applyImage(); resolve(); };
      img.src = photo.path;
    }
  });
}

// ── 사진 카운터 업데이트 ──
function updateCounter() {
  const counter = document.getElementById('heroCounter');
  if (!counter || !currentPhotos.length) return;
  counter.textContent = `${currentIndex + 1} / ${currentPhotos.length}`;
}

// ── 화살표를 썸네일↔이미지, 이미지↔공유버튼 중간에 동적 배치 ──
function positionArrows() {
  const hero    = document.querySelector('.hero');
  const prevBtn = document.querySelector('.hero__arrow--prev');
  const nextBtn = document.querySelector('.hero__arrow--next');
  const thumbEl = document.querySelector('.hero__thumbnails');
  const shareEl = document.querySelector('.hero__share');

  const heroW = hero.clientWidth;
  const heroH = hero.clientHeight;

  // 태블릿/모바일: JS 인라인 스타일 제거 → CSS 미디어쿼리가 동작하도록 위임
  if (heroW <= 768) {
    prevBtn.style.left  = '';
    prevBtn.style.right = '';
    nextBtn.style.left  = '';
    nextBtn.style.right = '';
    return;
  }

  if (!currentPhotos.length) return;
  const cached = aspectCache.get(currentPhotos[currentIndex].path);
  if (!cached) return;

  const heroRect = hero.getBoundingClientRect();

  // contain 기준 실제 렌더링된 이미지 너비 계산
  const imgAspect  = cached.w / cached.h;
  const heroAspect = heroW / heroH;
  const renderedW  = imgAspect > heroAspect ? heroW : heroH * imgAspect;
  const imageLeft  = (heroW - renderedW) / 2;
  const imageRight = heroW - imageLeft;

  // 썸네일 우측 끝, 공유버튼 좌측 끝 (히어로 기준 좌표)
  const thumbRight = thumbEl.getBoundingClientRect().right - heroRect.left;
  const shareLeft  = shareEl.getBoundingClientRect().left  - heroRect.left;

  // 각 빈 공간의 중간 지점에 화살표 배치
  const prevCenter = (thumbRight + imageLeft) / 2;
  const nextCenter = (imageRight + shareLeft) / 2;

  prevBtn.style.left  = (prevCenter - prevBtn.offsetWidth / 2) + 'px';
  prevBtn.style.right = 'auto';
  nextBtn.style.left  = (nextCenter - nextBtn.offsetWidth / 2) + 'px';
  nextBtn.style.right = 'auto';
}

// 창 크기 변경 시 화살표 재배치 (debounce 300ms)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(positionArrows, 300);
});

// ── 키보드 ← → 탐색 ──
document.addEventListener('keydown', async e => {
  if (!currentPhotos.length) return;
  if (e.key === 'ArrowLeft') {
    currentIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
    await renderHero(currentIndex);
    renderThumbnails(currentPhotos, currentIndex);
    positionArrows();
    updateCounter();
  } else if (e.key === 'ArrowRight') {
    currentIndex = (currentIndex + 1) % currentPhotos.length;
    await renderHero(currentIndex);
    renderThumbnails(currentPhotos, currentIndex);
    positionArrows();
    updateCounter();
  }
});

// ── 푸터 전체 그리드 초기화 ──
function initFooterGrid() {
  const toggleBtn = document.getElementById('toggleGridBtn');
  const grid = document.getElementById('footerGrid');
  const gridList = document.getElementById('footerGridList');

  const allVisible = allPhotos.filter(p => p.category !== 'recent');
  allVisible.forEach(photo => {
    const li = document.createElement('li');
    li.style.backgroundImage = `url('${photo.path}')`;

    li.addEventListener('click', async () => {
      currentPhotos = allVisible;
      currentIndex = allVisible.findIndex(p => p.id === photo.id);
      await renderHero(currentIndex);
      renderThumbnails(currentPhotos, currentIndex);
      positionArrows();
      updateCounter();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    gridList.appendChild(li);
  });

  toggleBtn.addEventListener('click', () => {
    const isOpen = grid.classList.toggle('is-open');
    toggleBtn.classList.toggle('is-open', isOpen);
  });
}

// ── 썸네일 strip 렌더링 ──
function renderThumbnails(photos, activeIndex) {
  const list = document.querySelector('.hero__thumb-list');
  list.innerHTML = '';

  // 컨테이너 높이 기반으로 표시 개수 동적 계산 (썸네일 48px + 간격 8px = 56px)
  const container = document.querySelector('.hero__thumbnails');
  const itemHeight = 48 + 8;
  const maxByHeight = Math.floor((container.clientHeight + 8) / itemHeight);
  const total = photos.length;
  const maxThumb = Math.min(Math.max(maxByHeight, 1), total);

  // 시작 인덱스 계산: 활성 사진이 가능한 한 가운데 오도록
  let startIdx = Math.max(0, activeIndex - Math.floor(maxThumb / 2));
  if (startIdx + maxThumb > total) startIdx = Math.max(0, total - maxThumb);

  for (let i = startIdx; i < startIdx + maxThumb; i++) {
    const photo = photos[i];
    const li = document.createElement('li');

    li.style.backgroundImage = `url('${photo.path}')`;
    li.style.backgroundSize = 'cover';
    li.style.backgroundPosition = 'center';

    if (i === activeIndex) li.classList.add('is-active');

    li.addEventListener('click', async () => {
      currentIndex = i;
      await renderHero(currentIndex);
      renderThumbnails(currentPhotos, currentIndex);
      positionArrows();
      updateCounter();
    });

    list.appendChild(li);
  }
}
