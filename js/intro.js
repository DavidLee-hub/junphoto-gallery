// intro.js - 인트로 페이지 배경 이미지 설정

// gallery_photos 테이블에서 sort_order가 가장 높은 사진을 배경으로 설정
async function initIntro() {
  const { data, error } = await _supabase
    .from('gallery_photos')
    .select('path')
    .order('sort_order', { ascending: false })
    .limit(1);

  if (error || !data || !data.length) {
    console.error('배경 이미지 로드 실패:', error);
    return;
  }

  const bg = document.getElementById('introBg');
  bg.style.backgroundImage = `url('${data[0].path}')`;
}

initIntro();
