// migrate-images.js — 기존 gallery_photos 원본 이미지를 2000px(display)/400px(thumb) 두 사이즈로
// 리사이즈해 Supabase Storage(gallery-images 버킷)에 업로드하고, DB의 path/thumb_path를 새 URL로 갱신한다.
//
// 실행 전 준비물:
//   1. Supabase 대시보드에서 gallery-images 버킷 생성 (Public) + 정책 설정 (docs/image-migration-setup.md 참고)
//   2. gallery_photos 테이블에 thumb_path 컬럼 추가 (ALTER TABLE, 위 문서 참고)
//   3. 이 저장소 루트에 .env 파일 생성 (.env.example 참고), SUPABASE_URL / SUPABASE_SERVICE_KEY 채우기
//   4. npm install
//
// 실행:
//   node scripts/migrate-images.js --limit=3      # 3장만 시험 실행 (권장, 먼저 실행)
//   node scripts/migrate-images.js --dry-run       # 실제 업로드/DB변경 없이 대상만 확인
//   node scripts/migrate-images.js                 # 전체 실행

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const REPO_ROOT = path.resolve(__dirname, '..');
const BUCKET = 'gallery-images';
const DISPLAY_WIDTH = 2000;
const THUMB_WIDTH = 400;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_KEY 환경변수가 없습니다. .env 파일을 확인하세요.');
  process.exitCode = 1;
  return;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function resizeToBuffer(inputPath, width, quality) {
  return sharp(inputPath)
    .rotate() // EXIF 방향 정보 반영
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();
}

function isAlreadyMigrated(row) {
  return typeof row.path === 'string' && row.path.includes('/storage/v1/object/public/');
}

async function main() {
  console.log(`설정: bucket=${BUCKET}, display=${DISPLAY_WIDTH}px, thumb=${THUMB_WIDTH}px, limit=${limit === Infinity ? '전체' : limit}, dryRun=${dryRun}`);

  const { data: rows, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('gallery_photos 조회 실패:', error.message);
    process.exit(1);
  }

  const targets = rows.filter(r => !isAlreadyMigrated(r)).slice(0, limit);
  console.log(`전체 ${rows.length}건 중 마이그레이션 대상 ${targets.length}건 (이미 완료된 건 제외)`);

  if (!targets.length) {
    console.log('마이그레이션할 항목이 없습니다.');
    return;
  }

  // 되돌릴 때 참고할 수 있도록 변경 전 값 백업
  const backupPath = path.join(__dirname, `migration-backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(targets.map(r => ({ id: r.id, path: r.path, thumb_path: r.thumb_path })), null, 2));
  console.log(`백업 저장: ${backupPath}`);

  let success = 0;
  const failed = [];

  for (const [i, row] of targets.entries()) {
    const label = `[${i + 1}/${targets.length}] id=${row.id} (${row.path})`;

    if (row.path.startsWith('http')) {
      console.warn(`${label} — 이미 외부 URL이라 건너뜀`);
      continue;
    }

    const localPath = path.join(REPO_ROOT, row.path);
    if (!fs.existsSync(localPath)) {
      console.warn(`${label} — 로컬 파일을 찾을 수 없어 건너뜀: ${localPath}`);
      failed.push({ id: row.id, reason: 'file-not-found' });
      continue;
    }

    if (dryRun) {
      console.log(`${label} — dry-run, 처리 예정만 확인`);
      continue;
    }

    try {
      const [displayBuf, thumbBuf] = await Promise.all([
        resizeToBuffer(localPath, DISPLAY_WIDTH, 82),
        resizeToBuffer(localPath, THUMB_WIDTH, 75),
      ]);

      const displayKey = `display/${row.id}.jpg`;
      const thumbKey = `thumb/${row.id}.jpg`;

      const { error: dErr } = await supabase.storage.from(BUCKET).upload(displayKey, displayBuf, { contentType: 'image/jpeg', upsert: true });
      if (dErr) throw new Error(`display 업로드 실패: ${dErr.message}`);

      const { error: tErr } = await supabase.storage.from(BUCKET).upload(thumbKey, thumbBuf, { contentType: 'image/jpeg', upsert: true });
      if (tErr) throw new Error(`thumb 업로드 실패: ${tErr.message}`);

      const { data: displayUrlData } = supabase.storage.from(BUCKET).getPublicUrl(displayKey);
      const { data: thumbUrlData } = supabase.storage.from(BUCKET).getPublicUrl(thumbKey);

      const { error: updateErr } = await supabase
        .from('gallery_photos')
        .update({ path: displayUrlData.publicUrl, thumb_path: thumbUrlData.publicUrl })
        .eq('id', row.id);
      if (updateErr) throw new Error(`DB 업데이트 실패: ${updateErr.message}`);

      console.log(`${label} — 완료`);
      success++;
    } catch (err) {
      console.error(`${label} — 실패: ${err.message}`);
      failed.push({ id: row.id, reason: err.message });
    }
  }

  console.log('\n=== 요약 ===');
  console.log(`성공: ${success}건`);
  console.log(`실패: ${failed.length}건`);
  if (failed.length) {
    console.log('실패 목록:', failed);
  }
}

main();
