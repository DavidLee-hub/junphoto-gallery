# 이미지 마이그레이션 준비 가이드

기존 159장 사진(및 앞으로 추가되는 사진)을 Supabase Storage로 옮기고, 2000px(디스플레이)/400px(썸네일) 두 사이즈로 자동 생성하기 위한 준비 단계입니다. 아래 1~3번은 Supabase 대시보드에서 **직접** 진행해주세요 (제가 대신 실행할 수 없는 부분입니다).

## 1. Storage 버킷 생성

1. Supabase 대시보드 → 해당 프로젝트(`jjwhawwbenfqueijojts`) 진입
2. 왼쪽 메뉴 **Storage** → **New bucket**
3. 이름: `gallery-images`
4. **Public bucket** 옵션 켜기 (갤러리 사진은 누구나 볼 수 있어야 하므로)
5. Create

## 2. Storage 권한 정책 (SQL Editor에서 실행)

왼쪽 메뉴 **SQL Editor** → New query에 아래 붙여넣고 실행:

```sql
-- 누구나 gallery-images 버킷의 파일을 읽을 수 있음 (공개 갤러리이므로)
create policy "Public read access for gallery-images"
on storage.objects for select
using (bucket_id = 'gallery-images');

-- 관리자 계정만 업로드 가능
create policy "Admin can upload gallery-images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'gallery-images'
  and auth.jwt()->>'email' = 'cslee835@gmail.com'
);

-- 관리자 계정만 삭제 가능 (사진 교체/정리용, 선택사항이지만 권장)
create policy "Admin can delete gallery-images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'gallery-images'
  and auth.jwt()->>'email' = 'cslee835@gmail.com'
);
```

## 3. gallery_photos 테이블에 썸네일 컬럼 추가

같은 SQL Editor에서:

```sql
alter table gallery_photos add column if not exists thumb_path text;
```

## 4. 로컬 환경변수 설정 (마이그레이션 스크립트용)

1. 저장소 루트의 `.env.example`을 복사해 `.env`로 저장 (`.env`는 `.gitignore`에 이미 등록되어 있어 git에 올라가지 않습니다)
2. `SUPABASE_SERVICE_KEY` 값 채우기 — Supabase 대시보드 → **Settings → API → Project API keys → service_role** 값 복사
   - ⚠️ 이 키는 모든 보안 규칙을 무시하는 최고 권한 키입니다. 절대 커밋하거나 채팅에 붙여넣지 마세요.

## 5. 의존성 설치 및 스크립트 실행

터미널에서 저장소 루트(`f:\SBS Academy\web\junphoto-gallery`)로 이동 후:

```bash
npm install
```

**먼저 3장만 시험 실행 (권장)**:

```bash
npm run migrate-images -- --limit=3
```

문제없이 완료되면 gallery.junphoto.co.kr에서 해당 3장이 정상적으로 보이는지 확인 → 전체 실행:

```bash
npm run migrate-images
```

- 실행 전 변경 대상 목록이 `scripts/migration-backup-<시각>.json`으로 자동 백업됩니다.
- 중간에 실패해도 이미 완료된 항목은 건너뛰고(`path`가 Storage URL로 바뀐 항목은 재처리 안 함) 다시 실행하면 이어서 처리됩니다.
- 실행 중 개별 사진이 실패해도 전체가 멈추지 않고, 마지막에 실패 목록을 보여줍니다.

## 6. 완료 후 확인

- gallery.junphoto.co.kr 전체 카테고리를 훑어보며 사진이 잘 보이는지, 썸네일 로딩이 빨라졌는지 확인
- admin.html에서 새 사진 추가 시 파일 선택 방식으로 잘 동작하는지 확인 (자동으로 2000px/400px 두 개 생성되어 업로드됨)
- 문제없이 확인되면, 기존 `img/` 폴더의 원본 파일은 이제 사용되지 않지만 git 저장소 용량 정리(히스토리 재작성 포함)는 별도로 상의 후 진행하는 게 안전합니다.
