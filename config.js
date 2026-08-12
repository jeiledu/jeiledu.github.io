/* =====================================================================
   순공 타이머 – 서버 설정
   Supabase 프로젝트를 만든 뒤 아래 두 값을 채워 넣으세요.
   (Supabase 대시보드 > Project Settings > Data API 에서 확인)

   값이 비어 있으면 앱은 '게스트 모드'로 동작합니다.
   기록은 이 브라우저에만 저장되고 랭킹은 잠깁니다.
   ===================================================================== */

window.APP_CONFIG = {
  // 예: "https://abcdefghijk.supabase.co"
  SUPABASE_URL: "",

  // 예: "eyJhbGciOi..." (publishable / anon key — 공개되어도 안전한 키입니다)
  SUPABASE_ANON_KEY: "",

  // 학교 구글 계정 도메인. 로그인 창에서 이 도메인 계정을 먼저 보여줍니다.
  // 예: "wooridae.hs.kr"  /  제한 없으면 ""
  // ※ 실제 차단은 schema.sql 의 allowed_domain() 값이 담당합니다.
  SCHOOL_DOMAIN: ""
};
