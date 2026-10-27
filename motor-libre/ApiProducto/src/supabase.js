const DEFAULT_TABLE = "productos";

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan SUPABASE_URL o SUPABASE_ANON_KEY en la configuración.");
  }

  const table = process.env.SUPABASE_PRODUCTS_TABLE || DEFAULT_TABLE;
  const endpoint = new URL(
    `rest/v1/${encodeURIComponent(table)}`,
    `${supabaseUrl.replace(/\/+$/, "")}/`,
  );

  return { endpoint, supabaseKey };
}

async function queryProducts(filters = {}) {
  const { endpoint, supabaseKey } = getSupabaseConfig();
  endpoint.searchParams.set("select", "*");

  for (const [field, value] of Object.entries(filters)) {
    if (value !== undefined) {
      endpoint.searchParams.set(field, `eq.${value}`);
    }
  }

  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase respondió con estado ${response.status}.`);
  }

  return response.json();
}

export const productsRepository = {
  list(filters) {
    return queryProducts(filters);
  },

  async findById(id) {
    const products = await queryProducts({ id_producto: id });
    return products[0] ?? null;
  },
};
