-- TANFIP · esquema base. NO se aplica automáticamente: revisar y ejecutar a mano en el proyecto elegido.
-- Convenciones: nombres en español, fechas `date`, horas `time`, auditoría en cada tabla (creado_*/actualizado_*).

create extension if not exists btree_gist;

-- ---------- usuarios del panel ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  rol text not null check (rol in ('profesional', 'recepcion')),
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

-- ---------- catálogo y agenda ----------
create table public.servicios (
  id text primary key check (id ~ '^[a-z0-9_-]{2,40}$'),
  nombre text not null,
  descripcion text not null default '',
  duracion_min integer not null check (duracion_min between 10 and 480),
  activo boolean not null default true
);

create table public.horarios (
  dia smallint primary key check (dia between 0 and 6), -- 0 = domingo
  activo boolean not null default true,
  inicio time not null default '08:00',
  fin time not null default '18:00',
  pausa_inicio time,
  pausa_fin time,
  check (fin > inicio)
);

create table public.bloqueos (
  id uuid primary key default gen_random_uuid(),
  desde date not null,
  hasta date not null,
  motivo text not null default '',
  check (hasta >= desde)
);

-- ---------- solicitudes (entrada desde la landing) ----------
create table public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  creada_en timestamptz not null default now(),
  estado text not null default 'nueva' check (estado in ('nueva', 'aceptada', 'reprogramada', 'rechazada')),
  servicio text not null references public.servicios (id),
  paciente text not null default 'nuevo' check (paciente in ('nuevo', 'paciente')),
  fecha date not null,
  hora time not null,
  nombre text not null check (char_length(nombre) between 3 and 120),
  edad integer not null check (edad between 1 and 110),
  telefono text not null,
  correo text not null default '',
  motivo_consulta text not null,
  patologia text not null default '',
  zonas text[] not null default '{}',
  desde text not null default '',
  antecedentes text not null default '',
  medicamentos text not null default '',
  direccion text not null default '',
  adicional text not null default '',
  consentimiento boolean not null check (consentimiento),
  consentimiento_at timestamptz,
  propuesta_fecha date,
  propuesta_hora time,
  motivo_rechazo text not null default '',
  paciente_id uuid,
  cita_id uuid
);
create index on public.solicitudes (estado, creada_en desc);

-- ---------- pacientes (datos administrativos) y ficha clínica (separada para RLS) ----------
create table public.pacientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 3 and 120),
  edad integer check (edad between 0 and 120),
  telefono text not null default '',
  correo text not null default '',
  direccion text not null default '',
  servicio text references public.servicios (id),
  estado text not null default 'activo' check (estado in ('activo', 'alta', 'inactivo')),
  consentimiento boolean not null default false,
  consentimiento_at timestamptz,
  creado_en timestamptz not null default now(),
  creado_por text not null default '',
  actualizado_en timestamptz not null default now(),
  actualizado_por text not null default ''
);
create index on public.pacientes (nombre);

create table public.fichas_clinicas (
  paciente_id uuid primary key references public.pacientes (id) on delete cascade,
  motivo_consulta text not null default '',
  patologia text not null default '',
  zonas text[] not null default '{}',
  desde text not null default '',
  antecedentes text not null default '',
  medicamentos text not null default ''
);

alter table public.solicitudes
  add constraint solicitudes_paciente_fk foreign key (paciente_id) references public.pacientes (id) on delete set null;

-- ---------- citas (sin solapes) ----------
create table public.citas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes (id) on delete cascade,
  servicio text not null references public.servicios (id),
  fecha date not null,
  hora time not null,
  duracion_min integer not null check (duracion_min between 10 and 480),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'confirmada', 'atendida', 'cancelada', 'no_asistio')),
  notas text not null default '',
  rango tsrange generated always as (tsrange(fecha + hora, fecha + hora + make_interval(mins => duracion_min))) stored,
  creado_en timestamptz not null default now(),
  creado_por text not null default '',
  actualizado_en timestamptz not null default now(),
  actualizado_por text not null default '',
  -- una sola profesional: ninguna cita activa puede cruzarse con otra
  constraint citas_sin_solape exclude using gist (rango with &&) where (estado in ('pendiente', 'confirmada', 'atendida'))
);
create index on public.citas (fecha, hora);
create index on public.citas (paciente_id);

alter table public.solicitudes
  add constraint solicitudes_cita_fk foreign key (cita_id) references public.citas (id) on delete set null;

-- ---------- clínico ----------
create table public.notas_seguimiento (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes (id) on delete cascade,
  cita_id uuid references public.citas (id) on delete set null,
  fecha date not null,
  eva smallint not null check (eva between 0 and 10),
  subjetivo text not null default '',
  objetivo text not null default '',
  tratamiento text not null default '',
  observaciones text not null default '',
  proxima_indicacion text not null default '',
  fijada boolean not null default false,
  creado_en timestamptz not null default now(),
  creado_por text not null default '',
  actualizado_en timestamptz not null default now(),
  actualizado_por text not null default ''
);
create index on public.notas_seguimiento (paciente_id, fecha desc);

create table public.plan_tratamiento (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes (id) on delete cascade,
  titulo text not null,
  objetivo text not null default '',
  frecuencia text not null default '',
  sesiones_totales integer not null default 0 check (sesiones_totales >= 0),
  sesiones_hechas integer not null default 0 check (sesiones_hechas >= 0),
  inicio date not null default current_date,
  estado text not null default 'activo' check (estado in ('activo', 'completado', 'pausado')),
  notas text not null default '',
  creado_en timestamptz not null default now(),
  creado_por text not null default '',
  actualizado_en timestamptz not null default now(),
  actualizado_por text not null default ''
);
create index on public.plan_tratamiento (paciente_id);

-- ---------- web y auditoría ----------
create table public.site_settings (
  clave text primary key,
  valor jsonb not null,
  actualizado_en timestamptz not null default now(),
  actualizado_por text not null default ''
);

-- Auditoría: quién hizo qué. NO guardar contenido clínico aquí.
create table public.audit_log (
  id bigserial primary key,
  en timestamptz not null default now(),
  actor text not null,
  accion text not null,
  entidad text not null,
  entidad_id text not null default ''
);
