import "dotenv/config";
import { createApp } from "./app.js";
import { parseTtlHours, startReservationExpiry } from "./jobs/expireReservations.js";
import { reservationsRepository } from "./supabase.js";

const port = Number(process.env.PORT) || 3001;
const app = createApp();

app.listen(port, () => {
  console.log(`API de reservas disponible en http://localhost:${port}`);

  startReservationExpiry(reservationsRepository, {
    ttlHours: parseTtlHours(process.env.RESERVATION_TTL_HOURS),
  });
});
