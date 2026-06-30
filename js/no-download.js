// 이미지 다운로드 방지 스크립트

(function () {
  // background-image를 가진 요소인지 확인
  function hasBgImage(el) {
    if (!el || el.nodeType !== 1) return false;
    var bg = el.style.backgroundImage || getComputedStyle(el).backgroundImage;
    return bg && bg !== 'none' && bg !== '';
  }

  // 이미지 요소에 다운로드 방지 속성 적용
  function protectImages() {
    document.querySelectorAll('img').forEach(applyProtection);
  }

  // 단일 이미지 요소에 보호 적용
  function applyProtection(img) {
    // 드래그 차단
    img.setAttribute('draggable', 'false');
    // 롱프레스(모바일) 메뉴 차단
    img.style.webkitTouchCallout = 'none';
    img.style.userSelect = 'none';
    img.style.webkitUserSelect = 'none';
  }

  // 우클릭 컨텍스트 메뉴 차단 (img 태그 + background-image 요소)
  document.addEventListener('contextmenu', function (e) {
    if (e.target.tagName === 'IMG' || hasBgImage(e.target)) {
      e.preventDefault();
    }
  });

  // 드래그 시작 차단
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG' || hasBgImage(e.target)) {
      e.preventDefault();
    }
  });

  // 모바일 롱프레스 차단 (background-image 요소)
  document.addEventListener('touchstart', function (e) {
    if (hasBgImage(e.target)) {
      e.target.style.webkitTouchCallout = 'none';
      e.target.style.userSelect = 'none';
      e.target.style.webkitUserSelect = 'none';
    }
  }, { passive: true });

  // DOM 로드 후 현재 이미지에 적용
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', protectImages);
  } else {
    protectImages();
  }

  // 동적으로 추가되는 이미지도 감지하여 적용
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) {
          if (node.tagName === 'IMG') {
            applyProtection(node);
          }
          node.querySelectorAll && node.querySelectorAll('img').forEach(applyProtection);
        }
      });
    });
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });
})();
