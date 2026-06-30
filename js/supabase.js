// supabase.js - Supabase 클라이언트 초기화
// anon key는 RLS로 보호되는 공개 키입니다

const SUPABASE_URL = 'https://jjwhawwbenfqueijojts.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqd2hhd3diZW5mcXVlaWpvanRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NTE0MDQsImV4cCI6MjA4OTUyNzQwNH0.D8MjIFXtbKgmDXCaDDIEp4SY7vMYl7jn1EGPuR_jqXM';

const { createClient } = supabase;

// Edge 추적 방지 등으로 sessionStorage 접근이 차단될 경우 메모리 폴백
let _authStorage = sessionStorage;
try {
  sessionStorage.setItem('__sb__', '1');
  sessionStorage.removeItem('__sb__');
} catch(e) {
  _authStorage = undefined;
}

// persistSession: false → 브라우저 닫으면 세션 삭제 (sessionStorage 방식)
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: !!_authStorage,
    storage: _authStorage
  },
  global: {
    // 모든 Supabase 요청의 브라우저 캐시 비활성화 (조회수 SELECT 포함)
    fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' })
  }
});
