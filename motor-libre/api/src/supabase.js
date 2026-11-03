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

function buildEndpoint(baseUrl, table) {
  return new URL(`rest/v1/${encodeURIComponent(table)}`, baseUrl);
}

async function findProductById(id) {
  const { baseUrl, supabaseKey } = getSupabaseConfig();
  const endpoint = buildEndpoint(baseUrl, PRODUCTS_TABLE);
  endpoint.searchParams.set("select", "id_producto,existencias");
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

async function listReservations({ documento, estado }) {
  const { baseUrl, supabaseKey } = getSupabaseConfig();
  const endpoint = buildEndpoint(baseUrl, RESERVATIONS_TABLE);
  endpoint.searchParams.set("select", "*,productos(nombre,precio,imagen)");
  endpoint.searchParams.set("documento", `eq.${documento}`);
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
    throw new Error(
      `Supabase respondió con estado ${response.status} al crear la reserva.`,
    );
  }

  const created = await response.json();
  return created[0];
}

export const reservationsRepository = {
  async create({ nombre, documento, tipoDocumento, correo, celular, idProducto, cantidad }) {
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

    return insertReservation({
      nombre,
      documento,
      tipo_documento: tipoDocumento,
      correo,
      celular,
      id_producto: idProducto,
      cantidad,
      estado: "activo",
    });
  },

  list(filters) {
    return listReservations(filters);
  },
};
