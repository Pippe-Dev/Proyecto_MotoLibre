import assert from "node:assert/strict";
import { test } from "node:test";
import {
  expireReservations,
  parseTtlHours,
  startReservationExpiry,
} from "../src/jobs/expireReservations.js";

const silentLog = { log() {}, error() {} };

test("parseTtlHours acepta números positivos y descarta el resto", () => {
  assert.equal(parseTtlHours("48"), 48);
  assert.equal(parseTtlHours("0.5"), 0.5);
  assert.equal(parseTtlHours(undefined), null);
  assert.equal(parseTtlHours(""), null);
  assert.equal(parseTtlHours("0"), null);
  assert.equal(parseTtlHours("-3"), null);
  assert.equal(parseTtlHours("abc"), null);
});

test("expireReservations pide caducar con el TTL indicado y devuelve el total", async () => {
  const calls = [];
  const repository = {
    async expireOlderThan(hours) {
      calls.push(hours);
      return 3;
    },
  };

  assert.equal(await expireReservations(repository, 48, silentLog), 3);
  assert.deepEqual(calls, [48]);
});

test("startReservationExpiry no hace nada sin TTL", () => {
  const repository = {
    async expireOlderThan() {
      throw new Error("no debe llamarse");
    },
  };

  assert.equal(startReservationExpiry(repository, { ttlHours: null, log: silentLog }), null);
});

test("startReservationExpiry ejecuta una pasada al arrancar y no se cae si falla", async () => {
  let calls = 0;
  const errors = [];
  const repository = {
    async expireOlderThan() {
      calls += 1;
      throw new Error("Supabase caído");
    },
  };

  const stop = startReservationExpiry(repository, {
    ttlHours: 48,
    intervalMinutes: 60,
    log: { log() {}, error: (...args) => errors.push(args.join(" ")) },
  });

  await new Promise((resolve) => setTimeout(resolve, 20));
  stop();

  assert.equal(calls, 1);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Supabase caído/);
});
