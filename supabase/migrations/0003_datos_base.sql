-- TANFIP · datos iniciales no sensibles (servicios y horario por defecto). Idempotente.
insert into public.servicios (id, nombre, descripcion, duracion_min) values
  ('fisioterapia', 'Fisioterapia', 'Valoración, terapia manual y ejercicio terapéutico.', 60),
  ('pilates', 'Pilates en Mat', 'Clases guiadas de fortalecimiento, postura y flexibilidad.', 50),
  ('personalizado', 'Plan personalizado', 'Programa a medida que combina fisioterapia y Pilates.', 60)
on conflict (id) do nothing;

insert into public.horarios (dia, activo, inicio, fin, pausa_inicio, pausa_fin) values
  (0, false, '08:00', '18:00', null, null),
  (1, true, '08:00', '18:00', '13:00', '14:00'),
  (2, true, '08:00', '18:00', '13:00', '14:00'),
  (3, true, '08:00', '18:00', '13:00', '14:00'),
  (4, true, '08:00', '18:00', '13:00', '14:00'),
  (5, true, '08:00', '18:00', '13:00', '14:00'),
  (6, true, '08:00', '12:00', null, null)
on conflict (dia) do nothing;

-- Primer usuario: crear la cuenta en Authentication > Users y luego ejecutar (cambiando el UUID):
-- insert into public.profiles (id, nombre, rol) values ('00000000-0000-0000-0000-000000000000', 'Tania Castro', 'profesional');
