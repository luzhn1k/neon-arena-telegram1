# Deploy v1.5.19 NEON CREW

For an existing GitHub/Railway deployment replace these files:

- `server.js`
- `public/game.js`
- `public/index.html`
- `public/styles.css`
- `public/telegram.js`
- `.env.example` is reference only; do not overwrite production secrets.
- `package.json`

Add the Railway variable:

`BOT_USERNAME=NeonArenaGameBot`

Do not change `BOT_TOKEN`, `BASE_URL`, `WEBAPP_URL`, or the `/data` volume.
The SQLite migration runs automatically on startup and keeps existing users/progress.
