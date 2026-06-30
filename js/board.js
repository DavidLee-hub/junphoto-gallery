// board.js - 게시판 목록 (Supabase 연동)

const PAGE_SIZE = 10;
let currentPage = 1;
let currentKeyword = '';
let totalCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
  initSearch();
  initWriteBtn();
});

// bfcache 복원 시 목록 새로고침 (게시글 보고 뒤로가기 시 조회수 갱신)
window.addEventListener('pageshow', (e) => {
  if (e.persisted) loadPosts();
});

// ── 게시글 목록 로드 ──
async function loadPosts() {
  const tbody = document.getElementById('boardTbody');
  tbody.innerHTML = '<tr><td colspan="5" class="board__empty">불러오는 중...</td></tr>';

  const { data: { session } } = await _supabase.auth.getSession();

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = _supabase
    .from('posts')
    .select('id, title, author_name, created_at, views, user_id, comments(count)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (currentKeyword) {
    query = query.ilike('title', `%${currentKeyword}%`);
  }

  const { data: posts, error, count } = await query;

  if (error) {
    tbody.innerHTML = '<tr><td colspan="5" class="board__empty">데이터를 불러오지 못했습니다.</td></tr>';
    return;
  }

  totalCount = count || 0;
  renderTable(posts, session);
  renderPagination();
}

// ── 테이블 렌더링 ──
function renderTable(posts, session) {
  const tbody = document.getElementById('boardTbody');
  tbody.innerHTML = '';

  if (!posts || !posts.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="board__empty">게시글이 없습니다.</td></tr>';
    return;
  }

  const adminActive = isAdmin(session) && isAdminMode();

  posts.forEach((post, idx) => {
    const num = totalCount - ((currentPage - 1) * PAGE_SIZE) - idx;
    const date = post.created_at.slice(0, 10);
    const isPostOwner = session && post.user_id && session.user.id === post.user_id;
    const showDel = adminActive || isPostOwner;
    const commentCount = post.comments?.[0]?.count || 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="board__col-num">${num}</td>
      <td class="board__col-title">
        <a href="post.html?id=${post.id}" class="board__post-link">${post.title}</a>
        ${commentCount > 0 ? `<span class="board__comment-count">[${commentCount}]</span>` : ''}
        ${showDel ? `<button class="board__admin-del" data-id="${post.id}">삭제</button>` : ''}
      </td>
      <td class="board__col-author">${post.author_name}</td>
      <td class="board__col-date">${date}</td>
      <td class="board__col-views">${post.views}</td>
    `;
    tbody.appendChild(tr);
  });

  // 삭제 이벤트 (본인 글 또는 관리자)
  tbody.querySelectorAll('.board__admin-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('이 게시글을 삭제하시겠습니까?')) return;
      const { error } = await _supabase.from('posts').delete().eq('id', btn.dataset.id);
      if (error) { alert('삭제에 실패했습니다.'); return; }
      loadPosts();
    });
  });
}

// ── 페이지네이션 렌더링 ──
function renderPagination() {
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const pageList = document.getElementById('pageList');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  pageList.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.textContent = i;
    if (i === currentPage) li.classList.add('is-active');
    li.addEventListener('click', () => {
      currentPage = i;
      loadPosts();
    });
    pageList.appendChild(li);
  }

  prevBtn.onclick = () => {
    if (currentPage > 1) { currentPage--; loadPosts(); }
  };
  nextBtn.onclick = () => {
    if (currentPage < totalPages) { currentPage++; loadPosts(); }
  };
}

// ── 검색 ──
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  const doSearch = () => {
    currentKeyword = searchInput.value.trim();
    currentPage = 1;
    loadPosts();
  };

  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
}

// ── 글쓰기 버튼: 항상 표시 (비회원도 글쓰기 가능) ──
function initWriteBtn() {
  // 별도 처리 없이 버튼은 항상 표시
}
