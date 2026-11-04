-- =====================================================================
-- MotoLibre · Control de existencias y caducidad de reservas
--
-- Qué hace:
--   1. Añade la columna reservas.creado_en (fecha de creación), que usa la
--      API para caducar reservas antiguas.
--   2. Crea un trigger sobre `reservas` que mantiene productos.existencias
--      al día de forma atómica:
--        · crear una reserva activa      -> descuenta existencias
--        · cambiar la cantidad           -> descuenta o devuelve la diferencia
--        · activo -> eliminado (cancelar o caducar) -> devuelve existencias
--        · eliminado -> activo           -> vuelve a descontar
--        · borrar una reserva activa     -> devuelve existencias
--      Si no hay stock suficiente o el producto no existe, la operación se
--      rechaza con los mensajes INSUFFICIENT_STOCK o PRODUCT_NOT_FOUND, que la
--      API traduce a 409 y 404.
--
-- Cómo aplicarla: copiar y ejecutar completa en Supabase -> SQL Editor.
-- Es idempotente: se puede ejecutar más de una vez sin duplicar nada.
--
-- Importante: esta migración NO recalcula el stock de reservas que ya existían.
-- Las reservas activas anteriores ya "ocupaban" unidades en el mundo real pero
-- nunca se descontaron. Si quieres reflejarlo, ajusta productos.existencias a
-- mano una sola vez (ver el bloque opcional al final).
-- =====================================================================

-- 1. Fecha de creación ------------------------------------------------
alter table public.reservas
  add column if not exists creado_en timestamptz not null default now();

create index if not exists reservas_estado_creado_en_idx
  on public.reservas (estado, creado_en);

-- 2. Función del trigger ---------------------------------------------
create or replace function public.reservas_ajustar_stock()
returns trigger
language plpgsql
as $$
declare
  v_existencias integer;
  v_diferencia  integer;
begin
  -- Alta de una reserva activa: descontar existencias.
  if tg_op = 'INSERT' then
    if new.estado = 'activo' then
      select existencias into v_existencias
        from public.productos
       where id_producto = new.id_producto
         for update;                       -- bloquea la fila: evita doble reserva simultánea

      if not found then
        raise exception 'PRODUCT_NOT_FOUND';
      end if;
      if v_existencias < new.cantidad then
        raise exception 'INSUFFICIENT_STOCK';
      end if;

      update public.productos
         set existencias = existencias - new.cantidad
       where id_producto = new.id_producto;
    end if;
    return new;
  end if;

  -- Modificación de una reserva.
  if tg_op = 'UPDATE' then
    if new.id_producto is distinct from old.id_producto then
      raise exception 'No se puede cambiar el producto de una reserva existente.';
    end if;

    -- Sigue activa: ajustar solo si cambió la cantidad.
    if old.estado = 'activo' and new.estado = 'activo'
       and new.cantidad <> old.cantidad then
      v_diferencia := new.cantidad - old.cantidad;

      select existencias into v_existencias
        from public.productos
       where id_producto = new.id_producto
         for update;

      if v_diferencia > 0 and v_existencias < v_diferencia then
        raise exception 'INSUFFICIENT_STOCK';
      end if;

      update public.productos
         set existencias = existencias - v_diferencia
       where id_producto = new.id_producto;

    -- Pasa a eliminado (cancelada o caducada): devolver existencias.
    elsif old.estado = 'activo' and new.estado = 'eliminado' then
      update public.productos
         set existencias = existencias + old.cantidad
       where id_producto = new.id_producto;

    -- Se reactiva una reserva eliminada: volver a descontar.
    elsif old.estado = 'eliminado' and new.estado = 'activo' then
      select existencias into v_existencias
        from public.productos
       where id_producto = new.id_producto
         for update;

      if v_existencias < new.cantidad then
        raise exception 'INSUFFICIENT_STOCK';
      end if;

      update public.productos
         set existencias = existencias - new.cantidad
       where id_producto = new.id_producto;
    end if;

    return new;
  end if;

  -- Borrado físico de una reserva activa: devolver existencias.
  if tg_op = 'DELETE' then
    if old.estado = 'activo' then
      update public.productos
         set existencias = existencias + old.cantidad
       where id_producto = old.id_producto;
    end if;
    return old;
  end if;

  return null;
end;
$$;

-- 3. Trigger ------------------------------------------------------------
drop trigger if exists reservas_ajustar_stock_trg on public.reservas;

create trigger reservas_ajustar_stock_trg
  before insert or update or delete on public.reservas
  for each row execute function public.reservas_ajustar_stock();

-- =====================================================================
-- OPCIONAL (ejecutar UNA sola vez, solo si ya hay reservas activas
-- antiguas y quieres que descuenten stock ahora):
--
--   update public.productos p
--      set existencias = greatest(p.existencias - r.total, 0)
--     from (select id_producto, sum(cantidad) as total
--             from public.reservas
--            where estado = 'activo'
--            group by id_producto) r
--    where p.id_producto = r.id_producto;
-- =====================================================================
