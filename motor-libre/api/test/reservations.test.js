import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../src/app.js";

const validPayload = {
  nombre: "Juana Pérez",
  documento: "123456789",
  tipoDocumento: "CC",
  correo: "juana@example.com",
  celular: "3001234567",
  idProducto: 7,
  cantidad: 2,
};

const createdReservation = { id_reserva: 1, ...validPayload, estado: "pendiente" };

let server;
let baseUrl;
const calls = [];

const listedReservations = [
  { id_reserva: 1, ...validPayload, estado: "activo", productos: { nombre: "Casco", precio: 100000 } },
];
const listCalls = [];

before(async () => {
  const repository = {
    async create(reservation) {
      calls.push(reservation);
      return createdReservation;
    },
    async list(filters) {
      listCalls.push(filters);
      return listedReservations;
    },
  };

  server = createApp(repository).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("POST /api/reservas crea una reserva con datos válidos", async () => {
  const response = await fetch(`${baseUrl}/api/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  });

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), createdReservation);
  assert.deepEqual(calls.at(-1), validPayload);
});

test("POST /api/reservas rechaza campos obligatorios faltantes", async () => {
  const { nombre, ...incomplete } = validPayload;
  void nombre;

  const response = await fetch(`${baseUrl}/api/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(incomplete),
  });

  assert.equal(response.status, 400);
});

test("POST /api/reservas rechaza un correo inválido", async () => {
  const response = await fetch(`${baseUrl}/api/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validPayload, correo: "no-es-un-correo" }),
  });

  assert.equal(response.status, 400);
});

test("POST /api/reservas rechaza cantidad no entera o no positiva", async () => {
  const response = await fetch(`${baseUrl}/api/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...validPayload, cantidad: 0 }),
  });

  assert.equal(response.status, 400);
});

test("POST /api/reservas propaga producto no encontrado como 404", async () => {
  const repository = {
    async create() {
      const error = new Error("Producto no encontrado.");
      error.code = "PRODUCT_NOT_FOUND";
      throw error;
    },
  };

  const notFoundServer = createApp(repository).listen(0);
  await new Promise((resolve) => notFoundServer.once("listening", resolve));
  const notFoundBaseUrl = `http://127.0.0.1:${notFoundServer.address().port}`;

  const response = await fetch(`${notFoundBaseUrl}/api/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  });

  assert.equal(response.status, 404);

  await new Promise((resolve, reject) => {
    notFoundServer.close((error) => (error ? reject(error) : resolve()));
  });
});

test("POST /api/reservas propaga existencias insuficientes como 409", async () => {
  const repository = {
    async create() {
      const error = new Error("No hay existencias suficientes para la cantidad solicitada.");
      error.code = "INSUFFICIENT_STOCK";
      throw error;
    },
  };

  const conflictServer = createApp(repository).listen(0);
  await new Promise((resolve) => conflictServer.once("listening", resolve));
  const conflictBaseUrl = `http://127.0.0.1:${conflictServer.address().port}`;

  const response = await fetch(`${conflictBaseUrl}/api/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  });

  assert.equal(response.status, 409);

  await new Promise((resolve, reject) => {
    conflictServer.close((error) => (error ? reject(error) : resolve()));
  });
});

test("GET /api/reservas exige el parámetro documento", async () => {
  const response = await fetch(`${baseUrl}/api/reservas`);
  assert.equal(response.status, 400);
});

test("GET /api/reservas rechaza un estado inválido", async () => {
  const response = await fetch(`${baseUrl}/api/reservas?documento=123&estado=pagado`);
  assert.equal(response.status, 400);
});

test("GET /api/reservas devuelve las reservas del documento", async () => {
  const response = await fetch(`${baseUrl}/api/reservas?documento=123456789&estado=activo`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), listedReservations);
  assert.deepEqual(listCalls.at(-1), { documento: "123456789", estado: "activo" });
});

async function withServer(repository, run) {
  const instance = createApp(repository).listen(0);
  await new Promise((resolve) => instance.once("listening", resolve));
  try {
    await run(`http://127.0.0.1:${instance.address().port}`);
  } finally {
    await new Promise((resolve, reject) => {
      instance.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

const activeReservation = {
  id_reserva: 5,
  ...validPayload,
  tipo_documento: "CC",
  id_producto: 7,
  estado: "activo",
  productos: { nombre: "Casco", precio: 100000, existencias: 3 },
};

test("DELETE /api/reservas/:id cancela una reserva activa y notifica", async () => {
  const updates = [];
  const repository = {
    async findById() { return activeReservation; },
    async update(id, fields) {
      updates.push({ id, fields });
      return { ...activeReservation, ...fields };
    },
  };

  await withServer(repository, async (url) => {
    const response = await fetch(`${url}/api/reservas/5?documento=123456789`, { method: "DELETE" });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).estado, "eliminado");
  });

  assert.deepEqual(updates, [{ id: 5, fields: { estado: "eliminado" } }]);
});

test("DELETE /api/reservas/:id no revela reservas de otro documento", async () => {
  const repository = { async findById() { return activeReservation; } };

  await withServer(repository, async (url) => {
    const response = await fetch(`${url}/api/reservas/5?documento=999`, { method: "DELETE" });
    assert.equal(response.status, 404);
  });
});

test("DELETE /api/reservas/:id rechaza reservas que ya no están activas", async () => {
  const repository = { async findById() { return { ...activeReservation, estado: "exitoso" }; } };

  await withServer(repository, async (url) => {
    const response = await fetch(`${url}/api/reservas/5?documento=123456789`, { method: "DELETE" });
    assert.equal(response.status, 409);
  });
});

test("PATCH /api/reservas/:id actualiza cantidad y contacto", async () => {
  const updates = [];
  const repository = {
    async findById() { return activeReservation; },
    async update(id, fields) {
      updates.push(fields);
      return { ...activeReservation, ...fields };
    },
  };

  await withServer(repository, async (url) => {
    const response = await fetch(`${url}/api/reservas/5`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documento: "123456789", cantidad: 3, celular: " 3109999999 " }),
    });
    assert.equal(response.status, 200);
  });

  assert.deepEqual(updates, [{ cantidad: 3, celular: "3109999999" }]);
});

test("PATCH /api/reservas/:id valida existencias y datos", async () => {
  const repository = { async findById() { return activeReservation; } };

  await withServer(repository, async (url) => {
    const send = (body) =>
      fetch(`${url}/api/reservas/5`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documento: "123456789", ...body }),
      });

    assert.equal((await send({ cantidad: 10 })).status, 409);
    assert.equal((await send({ cantidad: 0 })).status, 400);
    assert.equal((await send({ correo: "malo" })).status, 400);
    assert.equal((await send({})).status, 400);
  });
});
