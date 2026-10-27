import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../src/app.js";

const sampleProduct = {
  id_producto: 7,
  nombre: "Producto de prueba",
  marca: "Acme",
  modelo: "A1",
};

let server;
let baseUrl;
const calls = [];

before(async () => {
  const repository = {
    async list(filters) {
      calls.push({ operation: "list", filters });
      return [sampleProduct];
    },
    async findById(id) {
      calls.push({ operation: "findById", id });
      return id === sampleProduct.id_producto ? sampleProduct : null;
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

test("GET /api/products devuelve la lista", async () => {
  const response = await fetch(`${baseUrl}/api/products`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), [sampleProduct]);
  assert.deepEqual(calls.at(-1), { operation: "list", filters: {} });
});

test("GET /api/products filtra por marca y modelo", async () => {
  const response = await fetch(`${baseUrl}/api/products?marca=Acme&modelo=A1`);
  assert.equal(response.status, 200);
  assert.deepEqual(calls.at(-1), {
    operation: "list",
    filters: { marca: "Acme", modelo: "A1" },
  });
});

test("GET /api/products/:id devuelve el producto", async () => {
  const response = await fetch(`${baseUrl}/api/products/7`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), sampleProduct);
});

test("GET /api/products/:id valida id y devuelve 404 si no existe", async () => {
  const invalidResponse = await fetch(`${baseUrl}/api/products/0`);
  assert.equal(invalidResponse.status, 400);

  const missingResponse = await fetch(`${baseUrl}/api/products/8`);
  assert.equal(missingResponse.status, 404);
});

test("GET /api/products rechaza filtros vacíos", async () => {
  const response = await fetch(`${baseUrl}/api/products?marca=%20`);
  assert.equal(response.status, 400);
});
