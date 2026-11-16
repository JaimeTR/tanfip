-- TANFIP · cédula / DNI opcional en solicitudes y pacientes. Idempotente.
alter table public.solicitudes add column if not exists dni text not null default '';
alter table public.pacientes add column if not exists dni text not null default '';
