# TANFIP · Plan del dashboard administrativo

Sistema pequeño, claro y rápido para **una profesional (Tania)** y, eventualmente, **recepción**.
Todo en español. Mismo estilo que la landing (teal `#1B7F8E`, verde hoja `#8BB93E`, tarjetas de vidrio, íconos SVG con animación sutil).

## 1. Módulos (MVP)

| Ruta | Módulo | Para qué sirve |
|---|---|---|
| `/admin` | Inicio | Resumen: citas de hoy, próximas, solicitudes pendientes, pacientes nuevos del mes; agenda del día; accesos rápidos; gráfico de citas por semana |
| `/admin/solicitudes` | Solicitudes | Bandeja de la landing. Estados: nueva · aceptada · reprogramada · rechazada. Aceptar (crea paciente + cita), proponer otra hora, rechazar, WhatsApp |
| `/admin/pacientes` | Pacientes | Tabla con búsqueda, filtros (servicio, estado), orden y paginación; alta/edición en modal |
| `/admin/pacientes/[id]` | Ficha / historia clínica | Resumen · Evolución (notas SOAP + EVA) · Citas · Plan de tratamiento · Archivos |
| `/admin/citas` | Citas | Agenda semanal/diaria + tabla; crear/editar/reprogramar en modal; sin solapes |
| `/admin/servicios` | Servicios y horarios | Servicios (duración, activo), horario por día, bloqueos (vacaciones/feriados) |
| `/admin/sitio` | Sitio web | Textos editables de la landing (`site_settings`) |
| `/admin/login` | Acceso | Email + contraseña |

## 2. Roles y permisos

| Capacidad | `profesional` | `recepcion` |
|---|---|---|
| Inicio, solicitudes, pacientes (datos de contacto), citas, servicios y horarios | ✔ | ✔ |
| Historia clínica detallada (motivo, zonas, patología, antecedentes, medicamentos, evolución, plan, archivos) | ✔ | ✘ (no se muestra ni se consulta) |
| Sitio web (textos) | ✔ | ✘ |
| Borrar registros | ✔ | ✘ |

La restricción se aplica **en el servidor** (acciones y consultas) y en la base con RLS; ocultar un botón no es seguridad.

## 3. Modelo de datos (`supabase/migrations/`)

`profiles` (usuario ↔ rol) · `servicios` · `horarios` (por día de la semana) · `bloqueos` · `solicitudes` · `pacientes` (con la ficha clínica y `consentimiento_at`) · `citas` · `notas_seguimiento` (SOAP + EVA 0–10, `fijada`) · `plan_tratamiento` · `site_settings` (clave/valor) · `audit_log`.
Todas con `created_by` / `updated_by` y marcas de tiempo. Citas: restricción `EXCLUDE` contra solapes (índice con rango) además de la validación de la app.

## 4. Seguridad (son datos de salud)

- RLS activa en **todas** las tablas; solo usuarios autenticados con fila en `profiles`. Clínico: solo `profesional`.
- La landing **no** escribe con permisos de usuario: `POST /api/solicitudes` valida/sanea en servidor e inserta con la clave de servicio (solo servidor). `GET /api/disponibilidad` devuelve solo horas libres (sin datos de pacientes).
- Nada de contenido clínico en logs. Honeypot y límites de longitud ya existentes se mantienen.
- Consentimiento: se guarda la fecha en la solicitud y se copia al paciente al aceptarla.
- Auditoría: `audit_log` registra quién hizo qué (sin contenido clínico).
- Sesión: Supabase Auth (cookies httpOnly vía `@supabase/ssr`). Rutas `/admin/**` protegidas por `proxy.ts` (barrera rápida) **y** verificación real en cada página/acción.

## 5. Capa de datos y modo local

`src/lib/db/` define la interfaz `Db`. Dos implementaciones:
- **Memoria** (con datos de ejemplo en español): se activa sola si faltan `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Acceso demo: `tania@tanfip.demo` (profesional) y `recepcion@tanfip.demo` (recepción), contraseña `tanfip-demo`. Los datos se pierden al reiniciar.
- **Supabase**: con las variables definidas. Migraciones solo como SQL; **no se aplican automáticamente**.

## 6. Flujos clave

1. **Paciente reserva en la landing** → `POST /api/solicitudes` → fila `solicitudes` (estado `nueva`).
2. **Aceptar** → crea (o reutiliza por teléfono) el paciente con su ficha, crea la cita confirmada (verifica solapes) y marca la solicitud `aceptada`.
3. **Proponer otra hora** → marca `reprogramada` con la hora propuesta y abre WhatsApp con el mensaje armado.
4. **Rechazar** → pide un motivo opcional; WhatsApp opcional.
5. **Sesión** → desde la ficha, nota SOAP con EVA; el gráfico de dolor se actualiza.
6. **Disponibilidad** → `GET /api/disponibilidad?fecha=YYYY-MM-DD&servicio=...` combina horario del día, bloqueos, citas y duración del servicio.
7. **Web** → `getSiteSettings()` (en `src/lib/db/site-settings.ts`) devuelve los textos con valores por defecto de `src/lib/site.ts`; la landing podrá usarla.

## 7. UX

Barra lateral ícono+texto (cajón en móvil), buscador global (`/` o `Ctrl+K`), modales con foco atrapado y cierre con Esc, confirmación antes de borrar, toasts, estados vacíos con ilustración, chips de color por estado. Accesible (etiquetas, foco visible, contraste, `aria-live`) y responsive (tablas → tarjetas en móvil).

## 8. Fuera del MVP / pendiente

Subida real de archivos (Storage), recordatorios automáticos por WhatsApp/correo, pagos y facturación, instalación del admin como PWA propia (manifest `/admin`), gestión de usuarios desde la UI.
