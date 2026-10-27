# API de productos

API REST en Node.js para consultar la tabla `productos` de Supabase y consumirla desde una aplicación React.

## Requisitos

- Node.js 18 o superior
- Una tabla de Supabase llamada `productos` con las columnas `id_producto`, `nombre`, `descripcion`, `imagen`, `precio`, `existencias`, `marca` y `modelo`
- Políticas RLS de Supabase que permitan al rol `anon` leer los productos

## Configuración y ejecución

```powershell
npm install
Copy-Item .env.example .env
```

Completa `SUPABASE_ANON_KEY` en `.env` con la clave `anon` del proyecto. No compartas ni subas `.env`; el archivo está excluido por `.gitignore`. No uses una clave `service_role` en una aplicación web.

```powershell
npm run dev
```

La API estará disponible en `http://localhost:3000`. Cambia `WEB_ORIGINS` si tu aplicación React se ejecuta en otro origen; se aceptan varios orígenes separados por comas.

## Endpoints

| Método | Ruta | Respuesta |
|---|---|---|
| `GET` | `/api/products` | Lista de productos |
| `GET` | `/api/products?marca=Acme` | Productos de esa marca |
| `GET` | `/api/products?modelo=A1` | Productos de ese modelo |
| `GET` | `/api/products?marca=Acme&modelo=A1` | Productos que coinciden con ambos filtros |
| `GET` | `/api/products/:id` | Producto por `id_producto` |
| `GET` | `/health` | Estado de la API |

Las búsquedas por filtros devuelven una lista, también cuando no hay coincidencias. Una búsqueda por ID devuelve `404` si el producto no existe y `400` si el ID no es un entero positivo. Los errores de Supabase producen `502` sin exponer detalles internos.

## Pruebas

```powershell
npm test
```
