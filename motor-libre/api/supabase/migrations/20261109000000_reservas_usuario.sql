-- =====================================================================
-- MotoLibre · Reservas asociadas a una cuenta (Supabase Auth)
--
-- Añade reservas.user_id, que enlaza cada reserva con el usuario que la hizo
-- estando autenticado. Las reservas de invitados siguen funcionando (user_id
-- queda en null) y se consultan por número de documento.
--
-- Cómo aplicarla: copiar y ejecutar completa en Supabase -> SQL Editor.
-- Es idempotente.
-- =====================================================================

alter table public.reservas
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists reservas_user_id_idx
  on public.reservas (user_id, id_reserva desc);
