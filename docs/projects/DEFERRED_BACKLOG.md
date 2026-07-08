## Sovereign Sync Deferred Items

- [ ] 0.2 [total-recall] `npx vitest run` baseline recorded — DEFERRED to when work crosses into total-recall repo (Phase 3/4); does not block portfolio Phase 1
- [ ] 0.6 [total-recall] API smoke green (`/api/memory`, `/api/brains`); PAT scopes recorded
- [ ] T1 Live-site smoke: no fossil URLs anywhere; flipper swaps themes; all super-mario assets 200; designs index shows exactly Nostalgia + HSFD
- [ ] T2 Restart durability scenario: seed proposal → full deploy (incl. pm2 restart) → proposal + visitor profiles + sessions intact → deferred notification fires
- [ ] T3 Portability proof re-run on droplet-exported bundle (sale drops runtime docs; backup carries them)
- [ ] T4 Sync round-trip: droplet → TR import → brain listed; second run is a no-op; status JSON correct
- [ ] T5 Approval end-to-end: approve in TR UI → client receives proposal email from droplet → status `sent` in droplet doc AND in TR after next sync
- [ ] T6 Security: no secret in any vault doc / bundle / git diff (grep for token+SMTP patterns); traversal attempts on /api/docs rejected; wrong bearer → 403
