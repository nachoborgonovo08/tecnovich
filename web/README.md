# Sistema de Reservas · Tecnovich (web)

App de gestión de materiales y talleres — **Next.js 14 · TypeScript · Tailwind · shadcn · Supabase**.

Componentes destacados:
- `components/ui/dot-border-button.tsx` — botón animado con puntos y líneas (efecto Neuform / MengTo).
- `components/ui/area-chart-1.tsx` — reporte semanal con `reaviz` + `framer-motion`.

## Setup rápido (3 pasos)

### 1. Instalar dependencias

```bash
cd web
npm install
```

### 2. Crear el esquema en Supabase

Entrar a **SQL Editor** en https://supabase.com/dashboard/project/tcasgcopcfdqlijxdkbl y pegar el contenido de [`supabase/schema.sql`](supabase/schema.sql). Correrlo una vez.

Esto crea: tablas `profiles`, `materiales`, `reservas`; el trigger que auto-genera el perfil al registrarse; las políticas de RLS; y siembra los 5 materiales iniciales.

### 3. Correr la app

```bash
npm run dev
```

Abrir http://localhost:3000. Registrarse con email/password (rol Docente por defecto). Para hacer a alguien Coordinador, en Supabase → Table Editor → `profiles` cambiar `rol` a `Coordinador`.

## Estructura

```
web/
├── app/
│   ├── (app)/                  ← rutas protegidas (usa layout con Nav)
│   │   ├── layout.tsx          verifica sesión, carga perfil, monta Nav
│   │   ├── panel/page.tsx      dashboard: KPIs + WeeklyReportCard + categorías
│   │   ├── reservas/page.tsx   items disponibles (rings) + form + mis reservas
│   │   └── stock/page.tsx      inventario + panel de Coordinador (si corresponde)
│   ├── login/page.tsx          login/registro con DotBorderButton en el hero
│   ├── layout.tsx              root layout con fuentes Inter/JetBrains Mono
│   ├── page.tsx                redirect a /login o /panel
│   └── globals.css             tokens Tailwind + tema oscuro/claro
├── components/
│   ├── ui/                     ← shadcn primitives + los dos del prompt
│   │   ├── dot-border-button.tsx    (iframe con srcDoc, verbatim del prompt)
│   │   ├── area-chart-1.tsx         WeeklyReportCard adaptado a reservas
│   │   ├── button.tsx, card.tsx, input.tsx, label.tsx, badge.tsx
│   ├── nav.tsx                 navbar + tabs (Panel / Reservas / Stock)
│   ├── kpi-card.tsx            tarjeta KPI reutilizable
│   ├── ring-card.tsx           anillo SVG de disponibilidad
│   ├── alert-banner.tsx        banner de bajo stock
│   ├── reservation-form.tsx    form + validaciones + insert en Supabase
│   ├── reservations-list.tsx   lista con cancelar (delete)
│   └── admin-panel.tsx         edición de totales (solo Coordinador)
├── lib/
│   ├── supabase-client.ts      cliente browser
│   ├── supabase-server.ts      cliente server (RSC) con cookies
│   ├── types.ts                Material · Reserva · Profile · Rol
│   └── utils.ts                cn(), fmtDate(), todayISO()
├── supabase/schema.sql
├── middleware.ts               refresh de auth cookies
├── package.json
├── tsconfig.json / next.config.mjs / tailwind.config.ts / postcss.config.js
└── .env.local                  credenciales Supabase (no subir a git)
```

## Feature checklist

| Feature | Implementación |
|---|---|
| Auth email/password + roles | Supabase Auth + tabla `profiles` con trigger |
| Panel del Coordinador | Verificación server-side + política RLS `materiales_update_adm` |
| Alertas de bajo stock | `AlertBanner` — se muestra si algún item < 40% (naranja) o 0 (rojo) |
| Persistencia | Supabase Postgres (no más localStorage) |
| Validación de fechas | Cliente (min=today) + verificación de disponibilidad server-side |
| Estadísticas semanales | `WeeklyReportCard` (reaviz + framer-motion) |
| Responsive mobile | Tailwind con breakpoints sm/lg |
| Botón animado del prompt | `DotBorderButton` en el hero del login |

## Notas técnicas

- El botón `DotBorderButton` usa un `<iframe>` con `srcDoc` y `sandbox="allow-scripts"` — la lógica del efecto vive dentro del iframe, aislada del resto. La técnica es la del prompt original (Neuform / MengTo).
- El `WeeklyReportCard` usa `reaviz` (composable charts) y `framer-motion` para las métricas.
- El estado se resuelve en Server Components y las mutaciones son con Client Components que llaman a `router.refresh()` para revalidar.
- RLS activa protege los datos: cualquiera puede leer materiales/reservas, pero solo el dueño puede insertar/borrar sus reservas, y solo Coordinador puede editar materiales.
