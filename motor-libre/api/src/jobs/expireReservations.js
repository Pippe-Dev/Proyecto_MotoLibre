// Caduca las reservas activas que superan RESERVATION_TTL_HOURS.
// La API pasa la reserva a estado "eliminado" y el trigger de la base de datos
// devuelve las existencias al producto.

const DEFAULT_INTERVAL_MINUTES = 15;

export function parseTtlHours(value) {
  const hours = Number(value);
  return Number.isFinite(hours) && hours > 0 ? hours : null;
}

export async function expireReservations(repository, ttlHours, log = console) {
  const expired = await repository.expireOlderThan(ttlHours);

  if (expired > 0) {
    log.log(`Reservas caducadas: ${expired} (más de ${ttlHours} h sin completarse).`);
  }

  return expired;
}

// Ejecuta la caducidad al arrancar y luego cada `intervalMinutes`.
// Devuelve una función para detenerla, o null si no hay TTL configurado.
export function startReservationExpiry(
  repository,
  { ttlHours, intervalMinutes = DEFAULT_INTERVAL_MINUTES, log = console } = {},
) {
  if (!ttlHours) {
    log.log("Caducidad de reservas desactivada (RESERVATION_TTL_HOURS no está definida).");
    return null;
  }

  const run = () =>
    expireReservations(repository, ttlHours, log).catch((error) => {
      log.error("No se pudo caducar reservas:", error.message);
    });

  run();
  const timer = setInterval(run, intervalMinutes * 60 * 1000);
  timer.unref?.();

  log.log(`Caducidad de reservas activa: ${ttlHours} h (revisión cada ${intervalMinutes} min).`);
  return () => clearInterval(timer);
}
