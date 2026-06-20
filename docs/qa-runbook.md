# pctmt — QA Runbook

Manual end-to-end test script, written from the coach's point of view. Run this top to bottom after any significant deploy, or whenever you want a confidence check that nothing broke.

**How to use this:** Each step has an action and an expected result. Check off as you go. If a step fails, stop, note it, and either fix it or log it in `runbook.md` under "Known Gaps" before continuing — don't skip ahead, since later steps usually depend on earlier ones (you can't test attendance without a session, can't test a session without a player, etc).

**Environment:** Run this against https://pctmt-azure.vercel.app for a real pre-launch check, or `localhost:3000` during development. Use a throwaway test account — this script creates real data.

---

## 0. Setup

- [ ] Open the app in an incognito/private window (clean state, no cached session)
- [ ] Have a second browser or incognito tab ready for later (used in Section 9 to test the public share link with no session)

---

## 1. Auth

- [ ] Go to `/register`. Create an account with a throwaway email and password.
  - **Expected:** Redirected to `/dashboard` after successful registration.
- [ ] Click "Salir" (logout) in the dashboard header.
  - **Expected:** Redirected to `/login`.
- [ ] Try visiting `/dashboard` directly while logged out.
  - **Expected:** Redirected to `/login` (middleware blocks the route).
- [ ] Log back in with the same credentials at `/login`.
  - **Expected:** Redirected to `/dashboard`, greeting shows your name or email.

---

## 2. Players

- [ ] Dashboard → click the **Jugadores** card.
- [ ] Click **+ Nuevo**. Create a player:
  - Full name: `Test Player One`
  - Birth date: any date that makes them ~16 years old
  - Dominant hand: right
  - Level: intermediate
  - Weight: 65, Height: 170
  - **Expected:** Redirected to the new player's detail page. Age calculates correctly from birth date.
- [ ] Create a second player: `Test Player Two` (any values) — you'll need this one later for series rosters and plan testing.
- [ ] On Test Player One's page, click **Editar**, change the level, save.
  - **Expected:** Change reflected immediately on the detail page.
- [ ] Go back to `/players`. Confirm both players appear in the list.

---

## 3. Player Snapshots + Progress Chart

- [ ] On Test Player One's detail page, click **+ Nuevo** under "Historial de snapshots".
- [ ] Add a snapshot dated ~2 months ago: weight 65, endurance 5, speed 5, strength 5, technique 5.
- [ ] Add a second snapshot dated today: weight 64, endurance 7, speed 6, strength 6, technique 7.
  - **Expected:** After the second snapshot, a **Progreso** chart appears above the snapshot list, showing both points as a line for each metric.
- [ ] Delete one snapshot using its delete button (confirm dialog should appear).
  - **Expected:** Snapshot removed from the list; chart disappears if fewer than 2 snapshots remain (this is correct — chart needs ≥2 points).
- [ ] Re-add the deleted snapshot so you have 2+ again before continuing (needed for Section 9).

---

## 4. Strategies

- [ ] Dashboard → **Estrategias** → **+ Nueva**.
- [ ] Create: title "Bajada de bandeja por el centro", zone "Red", tags "bandeja, smash".
  - **Expected:** Redirected to detail page, tags render as pills.
- [ ] Go back to the list, use the zone filter pills. Click "Red".
  - **Expected:** Only strategies tagged with that zone show.
- [ ] Click "Todas" to clear the filter.
  - **Expected:** All strategies show again.

---

## 5. Training Blocks (Phase 4A)

- [ ] Dashboard → **Bloques** card.
- [ ] Click **+ Nuevo**. Create a block:
  - Title: "Calentamiento articular"
  - Type: Calentamiento
  - Duration: 15
  - Link to strategy: leave as "— Ninguna —"
- [ ] Create a second block, this time **linking it to the strategy** you created in Section 4 ("Bajada de bandeja por el centro").
  - **Expected:** On the block's detail page, a "Vinculado a la estrategia" section appears with a working link back to the strategy.
- [ ] Go back to `/blocks`, test the type filter pills the same way as strategies.
  - **Expected:** Filter works, "Todos" clears it.
- [ ] Confirm the dashboard's **Bloques** counter incremented to reflect the 2 blocks created.

---

## 6. Calendar + Recurring Series (Phase 4A)

This is the most complex flow in the app — go slowly.

- [ ] Dashboard → **Calendario** card (the dark one).
  - **Expected:** A 7-column weekly grid (Mon–Sun) for the current week, with "Hoy" highlighted.
- [ ] Click **Siguiente ›** and **‹ Anterior** a few times.
  - **Expected:** The date range in the header updates; "Hoy" returns you to the current week.
- [ ] Click **+ Nueva serie**.
- [ ] Create a series:
  - Title: "Academia Test"
  - Type: Academia
  - Days: check Martes and Jueves
  - Hora: 18:00, Duración: 90
  - Empieza el: today's date
  - Termina el: leave blank (open-ended)
  - Alumnos regulares: check both test players
  - **Expected:** Redirected to `/calendar`. Sessions should now appear on the calendar grid on every upcoming Tuesday and Thursday for the next ~90 days (you'll only see the current week's instances on screen, but they exist).
- [ ] Click on one of the generated session cards on the calendar.
  - **Expected:** Lands on that session's normal detail page (`/sessions/[id]`), showing both test players already added to attendance.
- [ ] Go back to `/calendar`, scroll to "Series recurrentes" at the bottom, click on "Academia Test".
- [ ] On the series edit page, change the duration to 60 minutes.
  - [ ] Click **"Guardar — toda la serie"**.
    - **Expected:** Redirected to `/calendar`. All generated sessions in the series now show 90→60 min duration (spot-check by opening one).
  - **Note:** This regenerates all sessions in the series, which means any attendance you'd marked is reset. That's expected behavior per the design — re-test attendance after this step if you need to (see Section 7).
- [ ] On the same series, test the **"Guardar — solo el molde"** button once (any small change, e.g. add a note).
  - **Expected:** Existing sessions are untouched; only future-generated ones would reflect the change (hard to observe immediately since the next 90 days are already generated — this is a lower-priority check, just confirm it doesn't error).
- [ ] Test **"Eliminar serie"** is available but **don't click it yet** — you'll want the series alive for Section 10 (Plans). Confirm the button shows a confirm dialog if you do test it, then re-create the series if you deleted it.

---

## 7. Sessions + Attendance

- [ ] Dashboard → **Sesiones**. Confirm the sessions generated by the series in Section 6 appear in the list, newest first.
- [ ] Click **+ Nueva sesión** (a manual, non-recurring one this time).
  - Title: "Sesión individual de prueba", date: today, type: Técnica, add both test players.
  - **Expected:** Redirected to detail page, both players listed under attendance.
- [ ] On this session's detail page, toggle one player's attendance off, then back on.
  - **Expected:** Toggle updates immediately without a full page reload (optimistic UI) — no visible flicker or delay.
- [ ] Edit the session (change the title), save.
  - **Expected:** Title updates on the detail page.
- [ ] Go to one of the players' detail pages (Section 2) → scroll to "Sesiones".
  - **Expected:** This session appears in their attendance history with the correct date and attended/faltó badge.

---

## 8. Tournaments

- [ ] Dashboard → **Torneos** → **+ Nuevo**.
- [ ] Create: name "Torneo de Prueba", start date today, category "masculino 3a".
- [ ] On the tournament detail page, add a result for Test Player One: partner name "Sparring", final round "Semifinal", sets won 2, sets lost 1.
  - **Expected:** Result appears on the tournament page.
- [ ] Go to Test Player One's profile.
  - **Expected:** This result does **not** currently show inline on the player profile page (only on the tournament page) — confirm this matches what you see; if a future change adds it there, update this checklist.
- [ ] Edit the tournament (change location), save. Delete the result (confirm dialog), confirm it's removed.

---

## 9. Shared Player Profile (Phase 4B) — the "wow moment"

This is the highest-priority flow to get right — it's the feature the whole pricing story depends on.

- [ ] Go to Test Player One's detail page. Find the **"Perfil compartible"** panel.
  - **Expected:** Toggle is off by default, no link shown.
- [ ] Click the toggle to turn sharing **on**.
  - **Expected:** A read-only URL field and "Copiar" button appear.
- [ ] Click **Copiar**.
  - **Expected:** Button briefly shows "¡Copiado!" feedback.
- [ ] Open a **separate incognito window with no pctmt session** (or just log out in a second tab). Paste the copied URL.
  - **Expected:** Page loads **without redirecting to login**. Shows the player's name, level, progress chart (if ≥2 snapshots exist — they should, from Section 3), an attendance % card (if there's attendance in the last 30 days), and tournament results (from Section 8).
  - **This is the critical check.** If this redirects to `/login`, the middleware public-route exemption broke — stop and fix before doing anything else.
- [ ] Back in your authenticated session, click **"Generar un enlace nuevo"** on the SharePanel, confirm the dialog.
  - **Expected:** Token changes (URL field updates).
- [ ] Try the **old** copied URL from before regenerating.
  - **Expected:** 404 / not found — old token no longer works.
- [ ] Toggle sharing **off**.
  - **Expected:** Link UI disappears. Try visiting the share URL again (even the new valid token) — should now 404, since `share_enabled` is false.

---

## 10. Training Plans (Phase 4B)

- [ ] Dashboard → **Planes** card → **+ Nuevo plan**.
- [ ] Create a **group** plan:
  - Title: "Ciclo de academia"
  - Target: "Un grupo (serie)" → select "Academia Test" (from Section 6)
  - Total sessions: 6
  - Starts on: today
  - Goal: "Mejorar la consistencia de fondo"
  - **Expected:** Redirected to the plan detail page. A progress bar shows "0 de 6 sesiones". A "Sesiones del plan" list shows 6 rows, all status "Planeada", none assigned to a phase.
- [ ] Click **+ Añadir fase**. Add a phase: title "Fase física", sessions 3, pick a color, add an objective.
  - **Expected:** Phase appears in the "Fases" list with its colored dot and objective text.
- [ ] Test deleting that phase (the small "Eliminar" link next to it).
  - **Expected:** Phase removed from the list. (Note: this does NOT currently un-assign sessions that referenced it — if you assigned sessions to the phase first, check they don't break; if no UI exists yet to assign plan_sessions to phases, this is expected per the Known Gaps note in `runbook.md`.)
- [ ] Click **"Saltar"** on one of the planned sessions.
  - **Expected:** That row's status badge changes to "Saltada", and the "Saltar" button disappears for that row (can't skip twice).
- [ ] Go back to `/plans`. Confirm "Ciclo de academia" shows in the list with the correct target label ("Academia Test") and session count.
- [ ] Create a **second** plan, this time **individual**, targeting Test Player Two, 4 sessions.
  - **Expected:** Same flow works with target_type switched; the plan list correctly shows the player's name instead of a series title.
- [ ] On either plan, test **"Eliminar plan"** (confirm dialog appears, mentions that linked sessions aren't deleted). Confirm it actually removes the plan from `/plans`.

---

## 11. Cross-Cutting Checks

Run these after the sections above, since they depend on data created throughout.

- [ ] **Dashboard counts.** Go to `/dashboard`. Confirm the 5 stat cards (Jugadores, Sesiones, Torneos, Estrategias, Bloques) show counts that roughly match what you created (exact numbers depend on what you deleted along the way — just confirm none show 0 if you know you created data, and none show an obviously wrong/stale number).
- [ ] **Navigation completeness.** From `/dashboard`, confirm you can reach every module within 1 click: Jugadores, Sesiones, Torneos, Estrategias, Bloques, Calendario, Planes. (If any module isn't reachable from the dashboard, that's a navigation gap — see the pattern noted in `runbook.md`.)
- [ ] **RLS sanity check (optional, requires a second account).** Register a second throwaway account. Confirm its dashboard shows 0 for everything and it cannot see the first account's players, sessions, or plans by guessing URLs (try visiting a known player ID from account 1 while logged in as account 2 — should 404 or be denied).
- [ ] **Mobile viewport.** Resize the browser to ~375px wide (or use device emulation). Re-check the calendar grid, the dashboard stat cards, and the share panel — confirm nothing overflows or becomes unusable. This app's "wow moment" (Section 9) is specifically meant to be opened on a phone by a player, so this matters more than most apps.

---

## 12. Sign-off

- [ ] All sections above passed, or failures are logged in `docs/runbook.md` under "Known Gaps" with enough detail to act on later.
- [ ] No console errors in the browser dev tools during any of the above (spot-check at least the Calendar, Plans, and Share pages, since they're the newest and most complex).
- [ ] Note the date and commit SHA this run was performed against, below:

```
QA run date:
Commit SHA tested:
Result: PASS / PASS WITH KNOWN GAPS / FAIL
Notes:
```
