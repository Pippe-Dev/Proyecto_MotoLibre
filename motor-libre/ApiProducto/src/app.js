import cors from "cors";
import express from "express";
import { productsRepository } from "./supabase.js";

function parseFilters(query) {
  const filters = {};

  for (const field of ["marca", "modelo"]) {
    const value = query[field];
    if (value === undefined) {
      continue;
    }

    if (typeof value !== "string" || value.trim() === "") {
      return { error: `El parámetro '${field}' debe ser un texto no vacío.` };
    }

    filters[field] = value.trim();
  }

  return { filters };
}

export function createApp(repository = productsRepository) {
  const app = express();
  const allowedOrigins = (process.env.WEB_ORIGINS || "http://localhost:5173")
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

  app.get("/api/products", async (request, response, next) => {
    const { filters, error } = parseFilters(request.query);
    if (error) {
      response.status(400).json({ error });
      return;
    }

    try {
      const products = await repository.list(filters);
      response.json(products);
    } catch (requestError) {
      next(requestError);
    }
  });

  app.get("/api/products/:id", async (request, response, next) => {
    if (!/^[1-9]\d*$/.test(request.params.id)) {
      response.status(400).json({ error: "El id debe ser un entero positivo." });
      return;
    }

    try {
      const product = await repository.findById(Number(request.params.id));
      if (!product) {
        response.status(404).json({ error: "Producto no encontrado." });
        return;
      }

      response.json(product);
    } catch (requestError) {
      next(requestError);
    }
  });

  app.use((error, _request, response, _next) => {
    console.error("Error al consultar productos:", error.message);
    response.status(502).json({ error: "No fue posible consultar los productos." });
  });

  return app;
}
