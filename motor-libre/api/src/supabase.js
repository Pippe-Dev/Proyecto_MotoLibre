const PRODUCTS_TABLE = "productos";
const RESERVATIONS_TABLE = "reservas";

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en la configuración.",
    );
  }

  return { baseUrl: `${supabaseUrl.replace(/\/+$/, "")}/`, supabaseKey };
}

const DB_ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: "Producto no encontrado.",
  INSUFFICIENT_STOCK: "No hay existencias suficientes para la cantidad solicitada.",
};

// El trigger de la base rechaza operaciones con raise exception 'CODIGO'.
// PostgREST lo devuelve como { message: "CODIGO" }; aquí se convierte en un
// error con `code`, que app.js traduce a 404 o 409.
async function buildSupabaseError(response, fallbackMessage) {
  let dbCode = null;

  try {
    const body = await response.json();
    if (typeof body?.message === "string" && DB_ERROR_MESSAGES[body.message]) {
      dbCode = body.message;
    }
  } catch {
    // La respuesta no era JSON: se usa el mensaje genérico.
  }

  if (dbCode) {
    const error = new Error(DB_ERROR_MESSAGES[dbCode]);
    error.code = dbCode;
    return error;
  }

  return new Error(`Supabase respondió con estado ${response.status} ${fallbackMessage}`);
}

function buildEndpoint(baseUrl, table) {
  return new URL(`rest/v1/${encodeURIComponent(table)}`, baseUrl);
}

async function findProductById(id) {
  const { baseUrl, supabaseKey } = getSupabaseConfig();
  const endpoint = buildEndpoint(baseUrl, PRODUCTS_TABLE);
  endpoint.searchParams.set("select", "id_producto,nombre,precio,imagen,existencias");
  endpoint.searchParams.set("id_producto", `eq.${id}`);

  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Supabase respondió con estado ${response.status} al consultar el producto.`,
    );
  }

  const products = await response.json();
  return products[0] ?? null;
}

// Valida un access token de Supabase Auth y devuelve { id, email }, o null si no es válido.
export async function verifyAccessToken(token) {
  const { baseUrl, supabaseKey } = getSupabaseConfig();
  const response = await fetch(new URL("auth/v1/user", baseUrl), {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${token}` },
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Supabase Auth respondió con estado ${response.status}.`);
  }

  const user = await response.json();
  return user?.id ? { id: user.id, email: user.email ?? null } : null;
}

async function listReservations({ userId, estado }) {
  const { baseUrl, supabaseKey } = getSupabaseConfig();
  const endpoint = buildEndpoint(baseUrl, RESERVATIONS_TABLE);
  endpoint.searchParams.set("select", "*,productos(nombre,precio,imagen)");
  endpoint.searchParams.set("user_id", `eq.${userId}`);
  endpoint.searchParams.set("order", "id_reserva.desc");

  if (estado) {
    endpoint.searchParams.set("estado", `eq.${estado}`);
  }

  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Supabase respondió con estado ${response.status} al consultar las reservas.`,
    );
  }

  return response.json();
}

async function insertReservation(reservation) {
  const { baseUrl, supabaseKey } = getSupabaseConfig();
  const endpoint = buildEndpoint(baseUrl, RESERVATIONS_TABLE);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(reservation),
  });

  if (!response.ok) {
    throw await buildSupabaseError(response, "al crear la reserva.");
  }

  const created = await response.json();
  return created[0];
}

export const reservationsRepository = {
  async create({ nombre, documento, tipoDocumento, correo, celular, idProducto, cantidad, userId }) {
    const product = await findProductById(idProducto);

    if (!product) {
      const error = new Error("Producto no encontrado.");
      error.code = "PRODUCT_NOT_FOUND";
      throw error;
    }

    if (cantidad > product.existencias) {
      const error = new Error(
        "No hay existencias suficientes para la cantidad solicitada.",
      );
      error.code = "INSUFFICIENT_STOCK";
      throw error;
    }

    const created = await insertReservation({
      nombre,
      documento,
      tipo_documento: tipoDocumento,
      correo,
      celular,
      id_producto: idProducto,
      cantidad,
      estado: "activo",
      ...(userId ? { user_id: userId } : {}),
    });

    return {
      ...created,
      productos: { nombre: product.nombre, precio: product.precio, imagen: product.imagen },
    };
  },

  list(filters) {
    return listReservations(filters);
  },

  async findById(id) {
    const { baseUrl, supabaseKey } = getSupabaseConfig();
    const endpoint = buildEndpoint(baseUrl, RESERVATIONS_TABLE);
    endpoint.searchParams.set("select", "*,productos(nombre,precio,imagen,existencias)");
    endpoint.searchParams.set("id_reserva", `eq.${id}`);

    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase respondió con estado ${response.status} al consultar la reserva.`);
    }

    const reservations = await response.json();
    return reservations[0] ?? null;
  },

  async update(id, fields) {
    const { baseUrl, supabaseKey } = getSupabaseConfig();
    const endpoint = buildEndpoint(baseUrl, RESERVATIONS_TABLE);
    endpoint.searchParams.set("id_reserva", `eq.${id}`);
    endpoint.searchParams.set("select", "*,productos(nombre,precio,imagen)");

    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(fields),
    });

    if (!response.ok) {
      throw await buildSupabaseError(response, "al actualizar la reserva.");
    }

    const updated = await response.json();
    return updated[0] ?? null;
  },

  // Borrado físico. Se usa para deshacer reservas de un lote que falló a medias;
  // el trigger de la base devuelve las existencias.
  async remove(id) {
    const { baseUrl, supabaseKey } = getSupabaseConfig();
    const endpoint = buildEndpoint(baseUrl, RESERVATIONS_TABLE);
    endpoint.searchParams.set("id_reserva", `eq.${id}`);

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });

    if (!response.ok) {
      throw await buildSupabaseError(response, "al eliminar la reserva.");
    }
  },

  // Cancela las reservas activas creadas hace más de `hours` horas.
  // Devuelve cuántas se cancelaron; el trigger devuelve las existencias.
  async expireOlderThan(hours) {
    const { baseUrl, supabaseKey } = getSupabaseConfig();
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const endpoint = buildEndpoint(baseUrl, RESERVATIONS_TABLE);
    endpoint.searchParams.set("estado", "eq.activo");
    endpoint.searchParams.set("creado_en", `lt.${cutoff}`);
    endpoint.searchParams.set("select", "id_reserva");

    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ estado: "eliminado" }),
    });

    if (!response.ok) {
      throw await buildSupabaseError(response, "al caducar reservas.");
    }

    const expired = await response.json();
    return expired.length;
  },
};
