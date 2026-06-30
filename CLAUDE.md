# webgallery

---

## 1. 작업 규칙

- 내가 "시작" 또는 "진행"이라고 명시적으로 말하기 전까지는 어떤 작업도 시작하지 말것
- 작업 전 항상 계획을 먼저 설명하고 승인을 받을것
- 파일 수정 시 변경 내용을 먼저 요약할 것
- 각 작업 완료 후 CLAUDE.md 체크리스트를 반드시 업데이트하세요.
- [x] 처리 시 완료 날짜를 괄호로 표기하세요. 예: - [x] 로그인 UI (2025-03-26)

---

## 2. 프로젝트 개요

- **목적**: 사진 작품을 온라인 갤러리 형태의 사이트 구현
- **주요기능**: 사진 작품을 유형별로 감상할 수 있고 커뮤니티 역할도 함
- **타겟사용자**: 사진 애호가 및 동료 사진 작가

---

## 3. 기술 스택 & 코딩 규칙

### 기술 스택
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend/Database**: Supabase
- **배포**: Vercel
- **버전관리**: GitHub

### 코딩 규칙

#### HTML
- 시맨틱 태그 우선 사용 (header, nav, main, article, section, footer)
- 주석은 한국어로 작성
- 들여쓰기는 2칸

#### CSS
- 클래스명은 명확한 의미 전달
- Vanilla CSS 사용 (프레임워크 사용 금지)
- 주석으로 섹션 구분

#### JavaScript
- ES6+ 문법 사용
- 가독성을 위해 함수는 작게 분리
- 주석은 한국어로 작성

### 설명 방식
- 코드 작성 후 핵심 로직을 한국어로 간단히 설명할 것
- 처음 등장하는 개념(RLS, Storage 등)은 1~2줄로 개념 설명 먼저
- 에러 발생 시 원인 → 해결책 순서로 설명

---

## 4. UI/UX 디자인 가이드

### 디자인 컨셉
- 따뜻하고 감성적인 느낌을 살려서 전달한다.

### 색상

### 폰트
- 제목: Pretendard Bold
- 본문: Pretendard / 18px

---

## 5. UI 구현 체크리스트

### 초기 설정
- [x] GitHub 저장소 생성 (수동 작업) (2026-03-27)
- [x] Git 초기화 및 GitHub 연결 (2026-03-27)
- [x] 폴더구조 및 기본 파일 생성 (img/css/js, index/gallery/board.html) (2026-03-27)
- [x] CSS 변수 설정 (색상, 폰트, 간격) (2026-03-27)
- [x] reset.css / base.css 작성 (2026-03-27)
- [x] Pretendard 폰트 import (2026-03-27)
- [x] 공통 컴포넌트 클래스 정의 (버튼, 뱃지, 섹션타이틀) (2026-03-27)

### 섹션별 구현

#### 1.인트로 페이지
- [x] photos.json에 등록된 마지막 사진을 배경 이미지로 (2026-03-27)
- [x] 중앙에 "현준의 사진 세상" / "Photography by HyunJun" (2026-03-27)
- [x] 갤러리 입장 버튼 추가 (2026-03-27)
- [x] 갤러리 입장 버튼 click시 다음 페이지로 이동 (2026-03-27)
#### 2. 헤더
- [x] 로고 (현준의 사진세상 파란색) (2026-03-27)
- [x] 검색바 (중앙, 돋보기 아이콘) (2026-03-27)
- [x] 오른쪽에 Board 아이콘 (2026-03-27)
- [x] GNB: 카테고리/longexposure/series/sunrise-sunset/trajectory/travel/typological (2026-03-27)
      하위 카테고리 : . series/goyang-ilsan,  jeju
                            . travel/chungcheong, gangwon, gyengsang, incheon, jeolla, jeju, seoul-gyenggi
- [x] position: sticky 고정 (2026-03-27)
- [x] 스크롤 시 하단 border/shadow 추가 (2026-03-27)
- [x] 카테고리 Click시 해당 카테고리로 확대 화면 및 하단 썸네일 로 전환 (2026-03-27)

#### 3. 히어로 슬라이더
- [x] 전체 너비 photos.json의 마지막에서 2번째 이미지 (2026-03-27)
- [x] 좌/우 화살표 버튼 (배경 없는 흰색 chevron, 96px) (2026-03-27)
- [x] 좌하단 카테고리별 썸네일 사진 배치 (2026-03-27)
- [x] 썸네일 Click시 화면 확대 (2026-03-27)

#### 4. 푸터
- [x] 전체 목록 보기 탭 중앙 배치 (2026-03-27)
- [x] 전체 보기 Click시 하단에 전체 사진 축소판 배치 (2026-03-27)
- [x] 스크롤 기능 (2026-03-27)

#### 5. 반응형
- [x] PC (1600px~) (2026-03-27)
- [x] 태블릿 (768px 이하) — GNB 햄버거, 그리드 2열, 배너 세로스택 (2026-03-27)
- [x] 모바일 (480px 이하) — 검색바 숨김, 커뮤니티 1열, 폰트 축소 (2026-03-27)

---

## 6. 게시판 구현 체크리스트

### 요구사항
- 글 번호 자동 생성, 제목/내용/작성자/작성일 표시
- 이미지 1개 업로드, 댓글 작성/삭제
- 제목 검색, 로그인한 사람만 글쓰기, 본인 글만 수정/삭제

### posts 테이블 스키마
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | bigint generated always as identity | 자동 증가 PK |
| title | text not null | 제목 |
| content | text not null | 내용 |
| author_name | text not null | 작성자 (이메일 아이디) |
| user_id | uuid references auth.users(id) | 작성자 auth ID |
| image_url | text | 첨부 이미지 URL |
| views | integer default 0 | 조회수 |
| likes | integer default 0 | 좋아요 |
| created_at | timestamp with time zone default now() | 작성일 |

### comments 테이블 스키마
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | bigint generated always as identity | 자동 증가 PK |
| post_id | bigint references posts(id) | 게시글 FK (삭제 시 cascade) |
| user_id | uuid references auth.users(id) | 작성자 auth ID |
| author_name | text not null | 작성자 (이메일 아이디) |
| content | text not null | 댓글 내용 |
| created_at | timestamp with time zone default now() | 작성일 |

### 단계별 진행

#### 1단계: 게시판 UI
- [x] board.html 구조 + board.css 스타일 (2026-03-27)
- [x] gallery.html GNB 커뮤니티 링크 연결 (2026-03-27)
- [x] 디자인 수정·보완 — 목업 데이터로 UI 완성 (2026-03-27)

#### 2단계: Supabase 기본 설정
- [x] 계정/프로젝트 생성, API Key 설정 (2026-03-27)
- [x] .env.local 파일 생성 및 .gitignore 등록 (2026-03-27)

#### 3단계: 로그인 기능
- [x] Supabase 클라이언트 초기화 (js/supabase.js) (2026-03-27)
- [x] 이메일 로그인/회원가입 구현 (2026-03-27)
- [x] 헤더 프로필 아이콘 로그인 상태 연동 (2026-03-27)
- [x] 브라우저 닫으면 자동 로그아웃 (sessionStorage) (2026-03-27)
- [x] 회원가입 닉네임 필드 제거 (2026-03-27)
- [x] 작성자 이메일 아이디(@앞)로 표시 (2026-03-27)

#### 4단계: 데이터베이스 설정
- [x] posts 테이블 생성 + RLS 정책 설정 (2026-03-27)
- [x] post-images Storage 버킷 생성 (Public) (2026-03-27)

#### 5단계: 게시판 CRUD
- [x] 목록 조회 (board.js) (2026-03-27)
- [x] 글 작성 (write.html + write.js) (2026-03-27)
- [x] 상세보기 (post.html + post.js) (2026-03-27)
- [x] 수정 / 삭제 (본인 글만) (2026-03-27)

#### 6단계: 이미지 업로드
- [x] 이미지 업로드 / 미리보기 / 삭제 (2026-03-27)

#### 7단계: 추가 기능
- [x] 제목 검색 (2026-03-27)
- [x] 페이지네이션 (2026-03-27)
- [x] 조회수 카운트 (2026-03-27)

#### 8단계: 댓글 기능
- [x] comments 테이블 생성 (수동 - Supabase) (2026-03-27)
- [x] 댓글 CRUD 구현 (클로드코드) (2026-03-27)

#### 9단계: Vercel 배포 (수동 작업)
- [x] Vercel 계정 생성 (vercel.com) (2026-03-27)
- [x] GitHub 저장소 연결 (2026-03-27)
- [x] 환경변수 등록 (SUPABASE_URL, SUPABASE_ANON_KEY) — Vanilla JS 구조상 생략, supabase.js에 직접 작성 (2026-03-27)
- [x] 배포 실행 및 배포 URL 확인 — https://webgallery-ashy.vercel.app (2026-03-27)
- [x] 커스텀 도메인 연결 — https://junphoto.co.kr (2026-03-27)
- [x] Supabase 인증 허용 URL에 배포 URL 추가 (Authentication → URL Configuration) (2026-03-27)

#### 10단계: 관리자 기능
- [x] 관리자 계정 설정 (cslee835@gmail.com) (2026-03-27)
- [x] 관리자 로그인 시 관리자 모드 자동 활성화 (2026-03-27)
- [x] 관리자 모드 토글 버튼 (헤더, 주황색 활성 표시) (2026-03-27)
- [x] 관리자 모드 ON: 게시판 전체 행 삭제 버튼 (2026-03-27)
- [x] 관리자 모드 ON: 모든 게시글 수정 버튼 표시 (2026-03-27)
- [x] 게시글 삭제: 본인 글 또는 관리자 가능으로 변경 (2026-03-29)
- [x] 관리자 모드 ON: 모든 댓글 삭제 버튼 표시 (2026-03-27)
- [x] Supabase RLS 정책 수정 (posts UPDATE/DELETE, comments DELETE) (2026-03-27)
- [x] 로그아웃 시 관리자 모드 자동 해제 (2026-03-27)

#### 11단계: 버그 수정 및 개선
- [x] post.js rpc().catch() → try/catch 수정 (Supabase JS v2 호환) (2026-03-27)
- [x] 회원가입 후 이메일 인증 불필요 시 모달 자동 닫힘 (2026-03-27)
- [x] 헤더 검색창 제거 (전체 페이지) (2026-03-27)
- [x] 이미지 다운로드 방지 (우클릭·드래그 차단, no-download.js) (2026-03-28)
- [x] SEO meta 태그 추가 (전체 페이지 — description/keywords/OG/트위터카드) (2026-03-29)
- [x] About 페이지 제작 (about.html + about.css — 프로필/작업/작가노트 3섹션) (2026-03-29)
- [x] 전체 페이지 GNB에 About 링크 추가 (2026-03-29)
- [x] 카카오톡 공유 버튼 추가 (갤러리 히어로, About 페이지) + 링크 복사 기능 (2026-03-29)
- [x] 비회원 글쓰기/댓글 허용 — 닉네임 입력 방식, Supabase RLS INSERT anon 허용 (2026-03-29)
- [x] 조회수 bfcache 버그 수정 — pageshow 이벤트 추가 + fetch cache: no-store (2026-03-29)
- [x] vercel.json 추가 — HTML/JS/CSS 캐시 정책(max-age=0) 설정 (2026-03-29)
- [x] Edge Tracking Prevention sessionStorage 폴백 처리 (supabase.js) (2026-03-29)
- [x] JS 캐시 버스팅 ?v=3 업데이트 — Vercel CDN 캐시 강제 무효화 (2026-03-29)
- [x] 일반 회원 본인 게시글 삭제 권한 추가 (board.js, post.js, Supabase RLS) (2026-03-29)
- [x] 관리자 작성자명 "관리자"로 표시 (auth.js getAuthorName + Supabase DB UPDATE) (2026-03-30)
- [x] 좋아요 기능 구현 (post.js + post.css, localStorage 중복 방지) (2026-03-30)
- [x] 댓글 수 목록 표시 (board.js comments(count) 조인 + board.css) (2026-03-30)
- [x] 게시글 수정 시 이미지 교체·삭제 Storage 파일 정리 (write.js) (2026-03-30)
- [x] 갤러리 사진 관리 UI — admin.html/admin.js/admin.css, gallery.js Supabase 전환 (2026-03-30)
- [x] 인트로 배경 이미지 gallery_photos 테이블 전환 (intro.js, index.html) (2026-03-30)