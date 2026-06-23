# pctmt — QA Runbook

Manual end-to-end test script, written from the coach's point of view. Run this top to bottom after any significant deploy, or whenever you want a confidence check that nothing broke.

**How to use this:** Each step has an action and an expected result. Check off as you go. If a step fails, stop, note it, and either fix it or log it in `runbook.md` under "Known Gaps" before continuing — don't skip ahead, since later steps usually depend on earlier ones (you can't test attendance without a session, can't test a session without a player, etc).

**Environment:** Run this against https://pctmt-azure.vercel.app for a real pre-launch check, or `localhost:3000` during development. Use a throwaway test account — this script creates real data.

**Before running Section 6b, 6c, or 12 (Phase 5 features):** confirm both new migrations are applied — `20260622000005_tactic_boards.sql` and `20260623000006_session_blocks_completed.sql`. See `runbook.md` → Running SQL migrations. Without them, `/boards` and the session blocks panel will error.

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
- [ ] On the strategy detail page, find the **"Pizarras tácticas"** section (Phase 5). Click **+ Nueva pizarra**.
  - **Expected:** Lands on `/boards/new` with this strategy pre-selected in the link dropdown. Leave this for Section 5b below.

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

## 5b. Tactical Whiteboard (Phase 5)

- [ ] From the strategy's "+ Nueva pizarra" link (Section 4) — or go directly to `/boards/new` — create a board: title "Jugada de prueba", leave the strategy link as-is.
  - **Expected:** Redirected to `/boards/[id]`, a padel court renders (teal surface, net, service lines closer to the back wall than the net — see `architecture.md` for the regulation distances if this looks off).
- [ ] Tap **+ Mi jugador** twice, **+ Rival** once, **+ Pelota** once.
  - **Expected:** Tokens appear on the court, auto-numbered (1, 2 for your players), color-coded blue/red/yellow.
- [ ] Drag a token to a new position (mouse drag, or touch on a real device/tablet).
  - **Expected:** Token follows the pointer smoothly; "Guardando…" then "Guardado ✓" appears in the toolbar.
- [ ] Tap **Modo línea**, then drag from one point on the court to another.
  - **Expected:** An arrow line is drawn. Modo línea stays active so you can draw a second line without re-tapping the toggle.
- [ ] Tap a token, then tap **Eliminar seleccionado**.
  - **Expected:** Token is removed.
- [ ] **Reload the page.**
  - **Expected:** All remaining tokens and lines are exactly where you left them — this is the real test of autosave, not just the in-session UI state.
- [ ] Go to `/boards`, confirm the board appears in the list with the strategy link noted (if you created it from the strategy page).
- [ ] Go back to the strategy detail page (Section 4) — confirm the board now appears under "Pizarras tácticas" there too.

---

## 6. Calendar + Recurring Series

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

### 6a. Monthly view (Phase 5)

- [ ] Click **Mes** next to the Semana toggle.
  - **Expected:** Grid switches to a full month, 6 rows × 7 columns, days outside the current month dimmed. Sessions from "Academia Test" show as small colored pills inside their day cell.
- [ ] Click a day cell that has a session pill on it.
  - **Expected:** Jumps to the **weekly** view for the week containing that day (clicking a day always opens the full week detail, not just that day).
- [ ] Click **Siguiente ›** / **‹ Anterior** while in month view.
  - **Expected:** Navigates by whole months, not weeks. "Hoy" returns to the current month.
- [ ] Click **Semana** to switch back.
  - **Expected:** Returns to the current week (today's week), not wherever you'd navigated to in month view.

### 6b. Scoped delete (Phase 5)

- [ ] Open one of the upcoming "Academia Test" sessions. Confirm the delete section now shows **three** buttons instead of one: "Eliminar solo esta sesión", "Eliminar esta y las futuras", "Eliminar toda la serie".
- [ ] Click **"Eliminar esta y las futuras"**, confirm the dialog.
  - **Expected:** Redirected to `/calendar`. That session and every later Tuesday/Thursday instance are gone from the calendar. Sessions **before** that date are untouched.
- [ ] Open an earlier (still-existing) session from the same series and confirm it's still there with its attendance intact.
- [ ] Go to `/calendar` → series list → "Academia Test" → **Eliminar serie** on the edit page.
  - **Expected:** Two buttons: "Eliminar solo el molde (conservar sesiones)" and "Eliminar serie y todas sus sesiones". Test the first one.
  - **Expected after "solo el molde":** The series disappears from the series list, but any remaining generated sessions are still visible in `/sessions` as one-off sessions (not deleted).
- [ ] Re-create the series (you'll want a recurring series again to sanity-check this fully): this time test **"Eliminar serie y todas sus sesiones"** instead.
  - **Expected:** Series and every one of its sessions (past and future) are gone. Check `/sessions` to confirm none remain.

---

## 7. Sessions + Attendance + Blocks

- [ ] Dashboard → **Sesiones**. Confirm sessions appear in the list, newest first.
- [ ] Click **+ Nueva sesión** (a manual, non-recurring one this time).
  - Title: "Sesión individual de prueba", date: today, type: Técnica, add both test players.
  - **Expected:** Redirected to detail page, both players listed under attendance.
- [ ] On this session's detail page, toggle one player's attendance off, then back on.
  - **Expected:** Toggle updates immediately without a full page reload (optimistic UI) — no visible flicker or delay.
- [ ] Edit the session (change the title), save.
  - **Expected:** Title updates on the detail page.
- [ ] Go to one of the players' detail pages (Section 2) → scroll to "Sesiones".
  - **Expected:** This session appears in their attendance history with the correct date and attended/faltó badge.

### 7a. Session blocks checklist (Phase 5)

- [ ] On the same test session, find the **"Bloques de la sesión"** section. Tap **+ Añadir bloque**.
  - **Expected:** A grid of type filter pills + block cards appears, showing the two blocks created in Section 5.
- [ ] Tap one of the block cards.
  - **Expected:** It's added to the list above immediately (no page reload), with its type dot and duration shown. The picker stays open.
- [ ] Tap a second block card, then tap **Listo** to close the picker.
  - **Expected:** Both blocks now show in the checklist, with a header like "0/2 completados · 30 min en total" (durations depend on what you created).
- [ ] Tap directly on one block's text (not the circle).
  - **Expected:** It toggles to completed — circle fills green with a checkmark, title gets a strikethrough, counter updates to "1/2 completados".
- [ ] Use the ↑/↓ buttons to swap the order of the two blocks.
  - **Expected:** Order visibly swaps immediately.
- [ ] Tap ✕ on one block to remove it.
  - **Expected:** It disappears from the list, counter updates.
- [ ] **Reload the page.**
  - **Expected:** The remaining block, its completed state, and the order all persisted — this is the real test, not just the in-session state.

---

## 8. Competencias

- [ ] Dashboard → **Competencias** → **+ Nueva competencia**.
  - **Expected:** Page copy talks about registering where a player competed — not about organizing a tournament. ("Torneos" should not appear anywhere in this flow as of Phase 5.)
- [ ] Create: name "Torneo de Prueba", start date today, category "masculino 3a".
- [ ] On the competition detail page, add a result for Test Player One: partner name "Sparring", final round "Semifinal", sets won 2, sets lost 1.
  - **Expected:** Result appears on the page, under "Resultados de tus alumnos".
- [ ] Go to Test Player One's profile.
  - **Expected:** This result does **not** currently show inline on the player profile page (only on the competition page) — confirm this matches what you see; if a future change adds it there, update this checklist.
- [ ] Edit the competition (change location), save. Delete the result (confirm dialog), confirm it's removed.

---

## 9. Shared Player Profile — the "wow moment"

This is the highest-priority flow to get right — it's the feature the whole pricing story depends on.

- [ ] Go to Test Player One's detail page. Find the **"Perfil compartible"** panel.
  - **Expected:** Toggle is off by default, no link shown.
- [ ] Click the toggle to turn sharing **on**.
  - **Expected:** A read-only URL field and "Copiar" button appear.
- [ ] Click **Copiar**.
  - **Expected:** Button briefly shows "¡Copiado!" feedback.
- [ ] Open a **separate incognito window with no pctmt session** (or just log out in a second tab). Paste the copied URL.
  - **Expected:** Page loads **without redirecting to login**. Shows the player's name, level, progress chart (if ≥2 snapshots exist — they should, from Section 3), an attendance % card (if there's attendance in the last 30 days), and competition results (from Section 8).
  - **This is the critical check.** If this redirects to `/login`, the middleware public-route exemption broke — stop and fix before doing anything else.
- [ ] Back in your authenticated session, click **"Generar un enlace nuevo"** on the SharePanel, confirm the dialog.
  - **Expected:** Token changes (URL field updates).
- [ ] Try the **old** copied URL from before regenerating.
  - **Expected:** 404 / not found — old token no longer works.
- [ ] Toggle sharing **off**.
  - **Expected:** Link UI disappears. Try visiting the share URL again (even the new valid token) — should now 404, since `share_enabled` is false.

---

## 10. Training Plans

- [ ] Dashboard → **Planes** card → **+ Nuevo plan**.
- [ ] Create a **group** plan:
  - Title: "Ciclo de academia"
  - Target: "Un grupo (serie)" → select a series (re-create "Academia Test" first if you deleted it in 6b)
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
- [ ] Go back to `/plans`. Confirm "Ciclo de academia" shows in the list with the correct target label and session count.
- [ ] Create a **second** plan, this time **individual**, targeting Test Player Two, 4 sessions.
  - **Expected:** Same flow works with target_type switched; the plan list correctly shows the player's name instead of a series title.
- [ ] On either plan, test **"Eliminar plan"** (confirm dialog appears, mentions that linked sessions aren't deleted). Confirm it actually removes the plan from `/plans`.

---

## 11. Dashboard — Coach Utilization (Phase 5)

- [ ] Go to `/dashboard`. Find the **"Horas de coaching"** card.
  - **Expected:** A headline number for "this month," a "+N% / -N% vs mes pasado" delta (or no delta if last month had zero hours), and a 6-month bar chart below.
- [ ] Confirm the headline number roughly matches the sum of `duration_min` across the sessions you created today (60 + 90 + whatever test sessions are dated this month, converted to hours).
- [ ] Confirm there is **no** "Progreso de jugadores" chart on the dashboard anymore — that chart now only lives on each player's own detail page (Section 3), which is the intentional Phase 5 change.

---

## 12. Cross-Cutting Checks

Run these after the sections above, since they depend on data created throughout.

- [ ] **Dashboard counts.** Go to `/dashboard`. Confirm the 6 stat cards (Jugadores, Sesiones, Competencias, Estrategias, Bloques, Pizarras) show counts that roughly match what you created (exact numbers depend on what you deleted along the way — just confirm none show 0 if you know you created data, and none show an obviously wrong/stale number).
- [ ] **Navigation completeness.** From `/dashboard`, confirm you can reach every module within 1 click: Jugadores, Sesiones, Competencias, Estrategias, Bloques, Pizarras, Calendario, Planes.
- [ ] **RLS sanity check (optional, requires a second account).** Register a second throwaway account. Confirm its dashboard shows 0 for everything and it cannot see the first account's players, sessions, plans, or boards by guessing URLs (try visiting a known player ID or board ID from account 1 while logged in as account 2 — should 404 or be denied).
- [ ] **Mobile/tablet viewport.** Resize the browser to ~375px wide for mobile and ~768–1024px for tablet (or use device emulation). Re-check the calendar grid (both views), the dashboard stat cards, the tactical whiteboard, the session blocks panel, and the share panel — confirm nothing overflows, no tap target feels too small, and dragging on the whiteboard still works with touch emulation. This app's "wow moment" (Section 9) is specifically meant to be opened on a phone by a player, and the whiteboard/blocks panel are specifically meant for tablet use mid-session, so this matters more than most apps.

---

## 13. Sign-off

- [ ] All sections above passed, or failures are logged in `docs/runbook.md` under "Known Gaps" with enough detail to act on later.
- [ ] No console errors in the browser dev tools during any of the above (spot-check at least the Calendar, Plans, Boards, and Share pages, since they're the newest and most complex).
- [ ] Note the date and commit SHA this run was performed against, below:

```
QA run date:
Commit SHA tested:
Migrations 20260622000005 and 20260623000006 applied: YES / NO
Result: PASS / PASS WITH KNOWN GAPS / FAIL
Notes:
```
