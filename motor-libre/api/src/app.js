import cors from "cors";
import express from "express";
import { reservationsRepository, verifyAccessToken } from "./supabase.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED_TEXT_FIELDS = ["nombre", "documento", "tipoDocumento", "correo", "celular"];
const VALID_ESTADOS = ["activo", "exitoso", "eliminado"];

function parseReservationBody(body) {
  const errors = [];

  for (const field of REQUIRED_TEXT_FIELDS) {
    if (typeof body[field] !== "string" || body[field].trim() === "") {
      errors.push(`El campo '${field}' es obligatorio.`);
    }
  }

  if (
    typeof body.correo === "string" &&
    body.correo.trim() !== "" &&
    !EMAIL_REGEX.test(body.correo.trim())
  ) {
    errors.push("El campo 'correo' debe ser un correo electrónico válido.");
  }

  const idProducto = Number(body.idProducto);
  if (!Number.isInteger(idProducto) || idProducto <= 0) {
    errors.push("El campo 'idProducto' debe ser un entero positivo.");
  }

  const cantidad = Number(body.cantidad);
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    errors.push("El campo 'cantidad' debe ser un entero positivo.");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    reservation: {
      nombre: body.nombre.trim(),
      documento: body.documento.trim(),
      tipoDocumento: body.tipoDocumento.trim(),
      correo: body.correo.trim(),
      celular: body.celular.trim(),
      idProducto,
      cantidad,
    },
  };
}

const MAX_BATCH_ITEMS = 20;

// Valida un pedido con varios productos: los datos del cliente son comunes
// y cada elemento de `items` aporta idProducto y cantidad.
function parseBatchBody(body) {
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return { errors: ["El campo 'items' debe ser una lista con al menos un producto."] };
  }

  if (body.items.length > MAX_BATCH_ITEMS) {
    return { errors: [`No se pueden reservar más de ${MAX_BATCH_ITEMS} productos a la vez.`] };
  }

  const reservations = [];
  const errors = [];

  body.items.forEach((item, index) => {
    const { reservation, errors: itemErrors } = parseReservationBody({
      ...body,
      idProducto: item?.idProducto,
      cantidad: item?.cantidad,
    });

    if (itemErrors) {
      errors.push(...itemErrors.map((message) => `Producto ${index + 1}: ${message}`));
    } else {
      reservations.push(reservation);
    }
  });

  return errors.length > 0 ? { errors: [...new Set(errors)] } : { reservations };
}

// Traduce los errores de negocio (producto inexistente, sin stock) a respuestas HTTP.
// Devuelve true si respondió; si no, el error debe seguir a next().
function respondDomainError(error, response, extra = {}) {
  if (error.code === "PRODUCT_NOT_FOUND") {
    response.status(404).json({ error: error.message, ...extra });
    return true;
  }

  if (error.code === "INSUFFICIENT_STOCK") {
    response.status(409).json({ error: error.message, ...extra });
    return true;
  }

  return false;
}

function parseReservationUpdate(body) {
  const errors = [];
  const fields = {};

  if (body.cantidad !== undefined) {
    const cantidad = Number(body.cantidad);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      errors.push("El campo 'cantidad' debe ser un entero positivo.");
    } else {
      fields.cantidad = cantidad;
    }
  }

  if (body.correo !== undefined) {
    if (typeof body.correo !== "string" || !EMAIL_REGEX.test(body.correo.trim())) {
      errors.push("El campo 'correo' debe ser un correo electrónico válido.");
    } else {
      fields.correo = body.correo.trim();
    }
  }

  if (body.celular !== undefined) {
    if (typeof body.celular !== "string" || body.celular.trim() === "") {
      errors.push("El campo 'celular' no puede estar vacío.");
    } else {
      fields.celular = body.celular.trim();
    }
  }

  if (errors.length === 0 && Object.keys(fields).length === 0) {
    errors.push("No se envió ningún campo para actualizar (cantidad, correo o celular).");
  }

  return errors.length > 0 ? { errors } : { fields };
}

// Asocia la reserva a la cuenta autenticada.
function withOwner(reservation, user) {
  return { ...reservation, userId: user.id };
}

export function createApp(
  repository = reservationsRepository,
  { verifyToken = verifyAccessToken } = {},
) {
  const app = express();
  const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origen no permitido por la política CORS."));
      },
    }),
  );
  app.use(express.json());

  // Autenticación con Supabase Auth: si llega "Authorization: Bearer <token>" se valida
  // y el usuario queda en request.user. Un token inválido es un 401. Las rutas de
  // /api/reservas exigen usuario (ver más abajo).
  app.use(async (request, response, next) => {
    const header = request.headers.authorization;
    if (!header) {
      next();
      return;
    }

    const match = /^Bearer\s+(.+)$/i.exec(header);
    try {
      const user = match ? await verifyToken(match[1]) : null;
      if (!user) {
        response.status(401).json({ error: "Sesión inválida o expirada. Inicia sesión de nuevo." });
        return;
      }
      request.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  function requireUser(request, response, next) {
    if (!request.user) {
      response.status(401).json({ error: "Debes iniciar sesión para continuar." });
      return;
    }
    next();
  }

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  // Todas las rutas de reservas exigen sesión.
  app.use("/api/reservas", requireUser);

  // Carga la reserva y valida que pertenezca al usuario con sesión.
  // Responde con el error HTTP correspondiente y devuelve null si no es válida.
  async function loadOwnedReservation(request, response, { requireActive }) {
    if (!/^[1-9]\d*$/.test(request.params.id)) {
      response.status(400).json({ error: "El id debe ser un entero positivo." });
      return null;
    }

    const reservation = await repository.findById(Number(request.params.id));
    if (!reservation || reservation.user_id !== request.user.id) {
      response.status(404).json({ error: "Reserva no encontrada." });
      return null;
    }

    if (requireActive && reservation.estado !== "activo") {
      response.status(409).json({ error: "Solo se pueden modificar reservas activas." });
      return null;
    }

    return reservation;
  }

  // Reservas de la cuenta que inició sesión.
  app.get("/api/reservas/mias", async (request, response, next) => {
    const estado = request.query.estado;
    if (estado !== undefined && !VALID_ESTADOS.includes(estado)) {
      response.status(400).json({
        error: `El parámetro 'estado' debe ser uno de: ${VALID_ESTADOS.join(", ")}.`,
      });
      return;
    }

    try {
      response.json(await repository.list({ userId: request.user.id, estado }));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/reservas/:id", async (request, response, next) => {
    try {
      const reservation = await loadOwnedReservation(request, response, {
        requireActive: false,
      });
      if (reservation) {
        response.json(reservation);
      }
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/reservas/:id", async (request, response, next) => {
    const body = request.body ?? {};

    try {
      const reservation = await loadOwnedReservation(request, response, {
        requireActive: true,
      });
      if (!reservation) {
        return;
      }

      const { fields, errors } = parseReservationUpdate(body);
      if (errors) {
        response.status(400).json({ error: errors.join(" ") });
        return;
      }

      // `existencias` ya descuenta lo que esta reserva tiene apartado, así que solo
      // hay que cubrir el aumento respecto a la cantidad actual.
      if (
        fields.cantidad !== undefined &&
        reservation.productos?.existencias !== undefined &&
        fields.cantidad - reservation.cantidad > reservation.productos.existencias
      ) {
        response
          .status(409)
          .json({ error: "No hay existencias suficientes para la cantidad solicitada." });
        return;
      }

      const updated = await repository.update(reservation.id_reserva, fields);
      response.json(updated);
    } catch (error) {
      if (!respondDomainError(error, response)) {
        next(error);
      }
    }
  });

  app.delete("/api/reservas/:id", async (request, response, next) => {
    try {
      const reservation = await loadOwnedReservation(request, response, {
        requireActive: true,
      });
      if (!reservation) {
        return;
      }

      const cancelled = await repository.update(reservation.id_reserva, { estado: "eliminado" });
      response.json(cancelled);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/reservas", async (request, response, next) => {
    const { reservation, errors } = parseReservationBody(request.body ?? {});

    if (errors) {
      response.status(400).json({ error: errors.join(" ") });
      return;
    }

    try {
      const created = await repository.create(withOwner(reservation, request.user));
      response.status(201).json(created);
    } catch (error) {
      if (!respondDomainError(error, response)) {
        next(error);
      }
    }
  });

  // Reserva varios productos en una sola operación "todo o nada": si uno falla,
  // se deshacen los que ya se habían creado y no queda ninguna reserva a medias.
  app.post("/api/reservas/lote", async (request, response, next) => {
    const { reservations, errors } = parseBatchBody(request.body ?? {});

    if (errors) {
      response.status(400).json({ error: errors.join(" ") });
      return;
    }

    const created = [];

    try {
      for (const reservation of reservations) {
        created.push(await repository.create(withOwner(reservation, request.user)));
      }

      response.status(201).json(created);
    } catch (error) {
      const failedItem = reservations[created.length];

      for (const done of created) {
        try {
          await repository.remove(done.id_reserva);
        } catch (rollbackError) {
          console.error(
            `No se pudo deshacer la reserva ${done.id_reserva}:`,
            rollbackError.message,
          );
        }
      }

      if (!respondDomainError(error, response, { idProducto: failedItem?.idProducto })) {
        next(error);
      }
    }
  });

  app.use((error, _request, response, _next) => {
    console.error("Error al procesar la solicitud de reservas:", error.message);
    response.status(502).json({ error: "No fue posible procesar la solicitud de reservas." });
  });

  return app;
}
