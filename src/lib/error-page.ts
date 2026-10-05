/** Static fallback used when the app itself cannot render; mirrors `ErrorPageShell` without React. */
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="th">
  <head>
    <meta charset="utf-8" />
    <title>WP ALL — ระบบขัดข้องชั่วคราว</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500&display=swap" />
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100svh; display: flex; flex-direction: column; background: #fff; color: #2b2622; font: 15px/1.6 "IBM Plex Sans Thai", system-ui, sans-serif; }
      header, footer { width: 100%; max-width: 80rem; margin: 0 auto; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
      header img { height: 36px; width: auto; display: block; }
      main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 1rem 5rem; }
      .kicker { margin: 0; font-size: 12px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: #188F8B; }
      .code { margin: 0.5rem 0 0; font-size: clamp(7rem, 26vw, 17rem); line-height: 0.9; letter-spacing: -0.06em; font-weight: 400; }
      h1 { margin: 1.5rem 0 0; font-size: 1.5rem; font-weight: 500; }
      p.desc { margin: 0.75rem 0 0; max-width: 24rem; font-size: 14px; color: #776d66; }
      .actions { margin-top: 2.5rem; display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; }
      .btn { display: inline-flex; align-items: center; height: 48px; padding: 0 1.75rem; border-radius: 999px; font: inherit; font-weight: 500; text-decoration: none; cursor: pointer; border: 1px solid #e6e6e6; background: #fff; color: #2b2622; }
      .btn.primary { background: #2b2622; border-color: #2b2622; color: #fff; }
      footer { justify-content: center; font-size: 12px; letter-spacing: 0.12em; color: #776d66; }
    </style>
  </head>
  <body>
    <header><a href="/" aria-label="WP ALL"><img src="/brand/logo-color.png" alt="WP ALL" /></a></header>
    <main>
      <p class="kicker">Server error</p>
      <p class="code" aria-hidden="true">500</p>
      <h1>ระบบขัดข้องชั่วคราว</h1>
      <p class="desc">ขออภัย มีบางอย่างผิดพลาด ลองใหม่อีกครั้งในอีกสักครู่</p>
      <div class="actions">
        <button class="btn primary" onclick="location.reload()">ลองอีกครั้ง</button>
        <a class="btn" href="/">กลับหน้าแรก</a>
      </div>
    </main>
    <footer>WP ALL IN 1 · Center of Curtain</footer>
  </body>
</html>`;
}
