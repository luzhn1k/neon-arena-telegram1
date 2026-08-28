# Neon Arena v1.5.19 — NEON CREW referrals

## Added

### Personal referral links
Every Telegram player gets a server-generated referral code and a Mini App deep link:

`https://t.me/<BOT_USERNAME>?startapp=ref_<CODE>`

The client reads Telegram `start_param` and binds the new player to the inviter on the server.

### Anti-abuse qualification
A referral is not rewarded for a click. It qualifies only when the invited player:

- opens the Mini App through the referral link as a new player;
- completes 3 valid runs;
- each qualifying run lasts at least 10 seconds;
- qualifying runs are rate-limited server-side.

Self-referrals, cycles, repeat binding and referral binding after the new-player window are blocked.

### Referral Pass rewards
- 1 active friend — 150 Neon Credits + 15 Neo Crystals
- 3 — 300 Neon Credits + 30 Neo Crystals
- 5 — Epic **Signal Trail**
- 10 — Legendary **Network Pulse** + 50 Neo Crystals
- 25 — Legendary **Network Commander** + 100 Neo Crystals
- 50 — Mythic **Architect** + 200 Neo Crystals

Referral cosmetics are server-locked and do not drop from ordinary capsules or appear as normal shop purchases.

### Invited-player welcome reward
After qualification the invited player receives 200 Neon Credits + 10 Neo Crystals.

### UI
A new **NEON CREW** panel includes:

- invite/share button;
- copy-link button;
- active / pending / weekly counts;
- Referral Pass milestones and claim buttons;
- invited-player progress (`0/3`, `1/3`, etc.);
- weekly recruiter top;
- qualification rules.

### Bot
Added `/invite` command.

## Production environment
Add or confirm:

`BOT_USERNAME=NeonArenaGameBot`

Do not add a leading `@`.

## Files changed
- `server.js`
- `public/telegram.js`
- `public/game.js`
- `public/index.html`
- `public/styles.css`
- `.env.example`
- `package.json`
