# API de productos

API REST en Node.js (Express) que **consulta el catálogo** de la tabla `productos` de Supabase. El frontend la usa para el catálogo y el detalle de producto. Es de **solo lectura**: no crea ni modifica productos.

Forma parte de [MotoLibre](../../README.md). Escucha por defecto en el puerto **3000**.

## Requisitos

- Node.js 18 o superior
- Una tabla `productos` en Supabase con las columnas `id_producto`, `nombre`, `descripcion`, `imagen`, `precio`, `existencias`, `marca` y `modelo`
- Una política RLS que permita al rol `anon` **leer** `productos`. Sin ella, la API responde bien pero con lista vacía
- La clave **anon** del proyecto de Supabase

## Configuración y ejecución

```powershell
npm install
Copy-Item .env.example .env
```

Abre `.env` y reemplaza `SUPABASE_ANON_KEY` por la clave anon real (*Project Settings → API* en Supabase). Después:

```powershell
npm run dev     # desarrollo, se reinicia al guardar cambios
npm start       # ejecución normal
```

La API queda en `http://localhost:3000`. Comprueba que funciona abriendo `http://localhost:3000/health`.

### Variables de entorno

| Variable | Obligatoria | Por defecto | Descripción |
|---|---|---|---|
| `SUPABASE_URL` | Sí | — | Dirección del proyecto de Supabase |
| `SUPABASE_ANON_KEY` | Sí | — | Clave pública **anon** |
| `PORT` | No | `3000` | Puerto donde escucha la API |
| `WEB_ORIGINS` | No | `http://localhost:5173` | Orígenes del frontend permitidos por CORS, separados por comas |
| `SUPABASE_PRODUCTS_TABLE` | No | `productos` | Nombre de la tabla, si fuera distinto |

> El archivo `.env` está excluido por `.gitignore`: no lo subas. **Nunca uses la clave `service_role` aquí.** Esta API es de solo lectura y debe funcionar con la clave anon.

## Endpoints

| Método | Ruta | Respuesta |
|---|---|---|
| `GET` | `/health` | `{ "status": "ok" }` |
| `GET` | `/api/products` | Lista de todos los productos |
| `GET` | `/api/products?marca=Honda` | Productos de esa marca |
| `GET` | `/api/products?modelo=XR150` | Productos de ese modelo |
| `GET` | `/api/products?marca=Honda&modelo=XR150` | Productos que cumplen **ambos** filtros |
| `GET` | `/api/products/:id` | Un producto por su `id_producto` |

Los filtros comparan el texto **exacto** (distingue mayúsculas de minúsculas).

### Ejemplo de respuesta

```json
{
  "id_producto": 8,
  "nombre": "Casco integral",
  "descripcion": "Casco integral certificado",
  "imagen": "/images/productos/casco.jpg",
  "precio": 450000,
  "existencias": 12,
  "marca": "HJC",
  "modelo": "CS-15"
}
```

### Códigos de respuesta

| Código | Cuándo ocurre |
|---|---|
| `200` | Consulta correcta. Con filtros sin coincidencias devuelve `[]`, no un error |
| `400` | Un filtro vacío, o un `:id` que no es un entero positivo |
| `404` | El `:id` no corresponde a ningún producto |
| `502` | Supabase no respondió o rechazó la solicitud (por ejemplo, clave inválida). El detalle se escribe en la consola de la API, no se devuelve al cliente |

## Cómo funciona por dentro

```
src/
├── server.js     Carga el .env y levanta el servidor
├── app.js        Define las rutas, valida los filtros y configura CORS
└── supabase.js   Consulta la API REST de Supabase con la clave anon
```

`app.js` no sabe nada de Supabase: recibe un "repositorio" con los métodos `list` y `findById`. Eso permite probar las rutas con datos de mentira, sin conexión.

## Pruebas

```powershell
npm test
```

Usan el ejecutor integrado de Node (`node --test`) con un repositorio simulado, así que **no necesitan Supabase ni claves**.

## Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| `502` y en consola "Supabase respondió con estado 401" | La clave anon es inválida, está sin pegar o tiene comillas o espacios |
| Lista vacía `[]` sin filtros | Falta la política RLS de lectura sobre `productos`, o la tabla está vacía |
| "Faltan SUPABASE_URL o SUPABASE_ANON_KEY" | No existe el archivo `.env` o le faltan variables |
| `EADDRINUSE` | El puerto 3000 ya está en uso |
| Error de CORS en el navegador | El origen del frontend no está en `WEB_ORIGINS` |
