import cors from "cors";
import express from "express";
import { reservationsRepository } from "./supabase.js";

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

export function createApp(repository = reservationsRepository) {
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

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  // Carga la reserva y valida que pertenezca al documento indicado.
  // Responde con el error HTTP correspondiente y devuelve null si no es válida.
  async function loadOwnedReservation(request, response, documento, { requireActive }) {
    if (!/^[1-9]\d*$/.test(request.params.id)) {
      response.status(400).json({ error: "El id debe ser un entero positivo." });
      return null;
    }

    if (typeof documento !== "string" || documento.trim() === "") {
      response.status(400).json({ error: "El parámetro 'documento' es obligatorio." });
      return null;
    }

    const reservation = await repository.findById(Number(request.params.id));
    if (!reservation || reservation.documento !== documento.trim()) {
      response.status(404).json({ error: "Reserva no encontrada." });
      return null;
    }

    if (requireActive && reservation.estado !== "activo") {
      response.status(409).json({ error: "Solo se pueden modificar reservas activas." });
      return null;
    }

    return reservation;
  }

  app.get("/api/reservas/:id", async (request, response, next) => {
    try {
      const reservation = await loadOwnedReservation(request, response, request.query.documento, {
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
      const reservation = await loadOwnedReservation(request, response, body.documento, {
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

      if (
        fields.cantidad !== undefined &&
        reservation.productos?.existencias !== undefined &&
        fields.cantidad > reservation.productos.existencias
      ) {
        response
          .status(409)
          .json({ error: "No hay existencias suficientes para la cantidad solicitada." });
        return;
      }

      const updated = await repository.update(reservation.id_reserva, fields);
      response.json(updated);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/reservas/:id", async (request, response, next) => {
    try {
      const reservation = await loadOwnedReservation(request, response, request.query.documento, {
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

  app.get("/api/reservas", async (request, response, next) => {
    const documento =
      typeof request.query.documento === "string" ? request.query.documento.trim() : "";

    if (documento === "") {
      response.status(400).json({ error: "El parámetro 'documento' es obligatorio." });
      return;
    }

    const estado = request.query.estado;
    if (estado !== undefined && !VALID_ESTADOS.includes(estado)) {
      response.status(400).json({
        error: `El parámetro 'estado' debe ser uno de: ${VALID_ESTADOS.join(", ")}.`,
      });
      return;
    }

    try {
      const reservations = await repository.list({ documento, estado });
      response.json(reservations);
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
      const created = await repository.create(reservation);
      response.status(201).json(created);
    } catch (error) {
      if (error.code === "PRODUCT_NOT_FOUND") {
        response.status(404).json({ error: error.message });
        return;
      }

      if (error.code === "INSUFFICIENT_STOCK") {
        response.status(409).json({ error: error.message });
        return;
      }

      next(error);
    }
  });

  app.use((error, _request, response, _next) => {
    console.error("Error al procesar la solicitud de reservas:", error.message);
    response.status(502).json({ error: "No fue posible procesar la solicitud de reservas." });
  });

  return app;
}
