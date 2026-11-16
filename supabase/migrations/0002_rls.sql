-- TANFIP · seguridad a nivel de fila. Sin sesión (anon) no hay acceso a nada.
-- La landing escribe solicitudes desde el servidor con la clave de servicio (que ignora RLS).

create or replace function public.rol_actual() returns text
language sql stable security definer set search_path = public as $$
  select rol from public.profiles where id = auth.uid() and activo
$$;
revoke all on function public.rol_actual() from public, anon;
grant execute on function public.rol_actual() to authenticated;

alter table public.profiles enable row level security;
alter table public.servicios enable row level security;
alter table public.horarios enable row level security;
alter table public.bloqueos enable row level security;
alter table public.solicitudes enable row level security;
alter table public.pacientes enable row level security;
alter table public.fichas_clinicas enable row level security;
alter table public.citas enable row level security;
alter table public.notas_seguimiento enable row level security;
alter table public.plan_tratamiento enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_log enable row level security;

-- profiles: cada quien ve el suyo; la profesional ve y gestiona todos
create policy profiles_leer on public.profiles for select to authenticated
  using (id = auth.uid() or public.rol_actual() = 'profesional');
create policy profiles_admin on public.profiles for all to authenticated
  using (public.rol_actual() = 'profesional') with check (public.rol_actual() = 'profesional');

-- agenda y administración: ambos roles (borrar solo la profesional)
do $$
declare t text;
begin
  foreach t in array array['servicios', 'horarios', 'bloqueos', 'solicitudes', 'pacientes', 'citas'] loop
    execute format('create policy %I_leer on public.%I for select to authenticated using (public.rol_actual() is not null)', t, t);
    execute format('create policy %I_crear on public.%I for insert to authenticated with check (public.rol_actual() is not null)', t, t);
    execute format('create policy %I_editar on public.%I for update to authenticated using (public.rol_actual() is not null) with check (public.rol_actual() is not null)', t, t);
    execute format('create policy %I_borrar on public.%I for delete to authenticated using (public.rol_actual() = ''profesional'')', t, t);
  end loop;
end $$;

-- clínico: solo la profesional
do $$
declare t text;
begin
  foreach t in array array['fichas_clinicas', 'notas_seguimiento', 'plan_tratamiento'] loop
    execute format('create policy %I_prof on public.%I for all to authenticated using (public.rol_actual() = ''profesional'') with check (public.rol_actual() = ''profesional'')', t, t);
  end loop;
end $$;

-- textos de la web: leer ambos roles, escribir solo la profesional
create policy site_leer on public.site_settings for select to authenticated using (public.rol_actual() is not null);
create policy site_escribir on public.site_settings for all to authenticated
  using (public.rol_actual() = 'profesional') with check (public.rol_actual() = 'profesional');

-- auditoría: cualquiera registra; solo la profesional consulta
create policy audit_insertar on public.audit_log for insert to authenticated with check (public.rol_actual() is not null);
create policy audit_leer on public.audit_log for select to authenticated using (public.rol_actual() = 'profesional');
