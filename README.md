# pctmt

> Plataforma SaaS para entrenadores de pádel — calendario, sesiones, contenido de entrenamiento, desarrollo de jugadores y seguimiento de competencias

**Live:** https://pctmt-azure.vercel.app  
**Repo:** https://github.com/faugub/pctmt

## ¿Qué es esto?

**pctmt** es una plataforma web para entrenadores de pádel que quieren digitalizar su trabajo. Reemplaza cuadernos, planillas y hilos de WhatsApp con una herramienta construida para el propósito: calendario de clases recurrentes, biblioteca de bloques de entrenamiento reutilizables, planes de trabajo multi-sesión, pizarra táctica, seguimiento longitudinal de jugadores, gestión de parejas/sociedades, y un perfil compartible del jugador que el entrenador puede mostrar en medio de la clase desde el teléfono.

El producto está construido mobile/tablet-first — los entrenadores lo usan en la cancha, durante o entre clases.

---

## Módulos

| Módulo | Descripción |
|---|---|
| **Calendario** | Vista semanal y mensual, series recurrentes con edición/borrado con alcance (esta ocurrencia / futuras / toda la serie) |
| **Sesiones** | Planificar clases, adjuntar bloques de entrenamiento como checklist en vivo, registrar asistencia, ver contexto del plan |
| **Bloques de entrenamiento** | Biblioteca reutilizable (calentamiento, técnica, físico, táctico, partido, enfriamiento), con enlace opcional a una estrategia |
| **Planes de trabajo** | Planes multi-sesión con fases, para un grupo (serie recurrente) o jugador individual; enlace bidireccional con sesiones reales |
| **Estrategias** | Biblioteca de jugadas con zonas de cancha, etiquetas de concepto táctico y de decisión, enlazable a pizarras |
| **Pizarra táctica** | Diagrama de cancha drag-and-drop — jugadores, pelota, líneas de tiro, guardado automático |
| **Jugadores** | Perfiles completos con snapshots físicos/rendimiento, gráfico de progreso, historial de sesiones |
| **Trayectoria del jugador** | Timeline longitudinal por jugador — sesiones asistidas, conceptos trabajados, snapshots, % de asistencia |
| **Sociedades (Pairs)** | Pareja como entidad de primera clase — historial de sesiones compartidas, conceptos top, notas por dupla |
| **Perfil compartido** | Link público read-only que el entrenador comparte con el jugador — gráfico de progreso, asistencia, competencias; sin login requerido |
| **Competencias** | Registra dónde compitió un jugador externamente y qué logró (no organizador de torneos — el entrenador solo hace seguimiento) |
| **Dashboard** | Utilización del entrenador (horas/mes), sesiones recientes, próximas competencias |
| **Tema** | Toggle claro/oscuro en el topbar, persistido en `localStorage`, sin flash al cargar |
| **Idioma** | Selector ES/EN en el topbar, persistido en cookie, aplicado a navegación/chrome y settings |
| **Branding** | Cada entrenador configura nombre, URL de logo y color primario en `/settings` — visible en su sidebar y en los perfiles públicos de sus jugadores |

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + React 19 |
| Estilos | Tailwind CSS v4 — tokens semánticos CSS (`bg-card`, `text-foreground`, etc.) para modo claro/oscuro vía clase `.dark` en `<html>` |
| Charts | Recharts |
| Internacionalización | Diccionario propio basado en cookies (`src/lib/i18n/`) — sin dependencia externa de i18n |
| Backend / DB | Supabase (PostgreSQL + Auth, RLS enforced) |
| Tests | Vitest — funciones puras de lógica de series recurrentes |
| Deploy | Vercel (auto-deploy en push a `main`) |

Sin integración de pagos por ahora — ver [`docs/product.md`](./docs/product.md) para el roadmap.

---

## Estructura del proyecto

```
pctmt/
├── docs/                     # Arquitectura, producto, runbook, QA — leer primero
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login, registro
│   │   ├── (dashboard)/      # App principal — rutas protegidas
│   │   │   ├── layout.tsx    # Chrome compartido: sidebar + topbar (tema/idioma/branding)
│   │   │   ├── players/      # Perfiles + snapshots + trayectoria
│   │   │   ├── sessions/
│   │   │   ├── calendar/
│   │   │   ├── series/       # Series recurrentes
│   │   │   ├── blocks/       # Biblioteca de bloques
│   │   │   ├── plans/
│   │   │   ├── strategies/
│   │   │   ├── boards/       # Pizarra táctica
│   │   │   ├── pairs/        # Sociedades — pareja como entidad
│   │   │   ├── tournaments/  # "Competencias" — UI reframed, rutas sin cambios
│   │   │   └── settings/     # Branding (nombre/logo/color)
│   │   ├── share/player/[token]/  # Perfil público, sin auth
│   │   └── actions/          # Server Actions, un archivo por dominio
│   ├── components/
│   │   ├── ui/               # Formularios, toggles, pizarra, chips de taxonomía, etc.
│   │   └── layout/           # Sidebar, TopBar, MobileNav
│   └── lib/
│       ├── supabase/         # Helpers cliente/servidor + middleware
│       ├── i18n/             # Diccionarios (es/en) + lector de locale por cookie
│       ├── series-utils.ts   # Lógica pura de fechas para series recurrentes (testeable)
│       ├── taxonomy.ts       # Etiquetas tácticas — fuente única de verdad
│       └── __tests__/        # Tests Vitest
├── supabase/
│   └── migrations/           # SQL, aplicadas manualmente en orden — ver docs/runbook.md
├── vitest.config.ts
└── public/
```

Ver [`docs/architecture.md`](./docs/architecture.md) para el schema completo y decisiones de diseño.

---

## Desarrollo local

> Requisitos: Node.js 20+, proyecto Supabase

```bash
git clone https://github.com/faugub/pctmt.git
cd pctmt
npm install

cp .env.example .env.local
# Completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

```bash
npm test        # correr tests unitarios (Vitest)
```

### Base de datos

Las migraciones viven en `supabase/migrations/` y **no se aplican automáticamente** — ejecutar cada una en orden desde el SQL editor de Supabase o con `npx supabase db push`. Ver [`docs/runbook.md`](./docs/runbook.md) para el listado actual y cuáles están aplicadas en producción.

---

## Estado actual: Chapter 2

Las Fases 1–6.5 están completas. Cada módulo principal de coaching existe y funciona. El trabajo activo es **Chapter 2 — The Coach Experience**: onboarding guiado, navegación mobile con bottom nav, dashboard rediseñado como "Hoy", mejoras a la pizarra táctica, PWA y reporte PDF por jugador.

Stripe y Playtomic permanecen congelados hasta que el producto sea algo que los entrenadores genuinamente quieran usar.

Ver [`docs/product.md`](./docs/product.md) para el roadmap completo.

---

## Documentación

| Doc | Contenido |
|---|---|
| [`docs/product.md`](./docs/product.md) | Visión, cliente objetivo, roadmap por fase |
| [`docs/architecture.md`](./docs/architecture.md) | Schema, RLS, patrones de componentes, decisiones de diseño |
| [`docs/runbook.md`](./docs/runbook.md) | Deploy, env vars, estructura, gaps conocidos |
| [`docs/qa-runbook.md`](./docs/qa-runbook.md) | Script de tests end-to-end manual |
| [`docs/voz-del-entrenador.md`](./docs/voz-del-entrenador.md) | Principios de entrenamiento élite de pádel traducidos a decisiones de producto |

---

## Licencia

MIT — ver [LICENSE](./LICENSE).
