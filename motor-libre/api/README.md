# API de reservas

API REST en Node.js (Express) que **crea, consulta, edita y cancela reservas** guardándolas en la tabla `reservas` de Supabase. El frontend la usa desde los formularios de reserva y desde la página "Mis reservas".

Forma parte de [MotoLibre](../../README.md). Escucha por defecto en el puerto **3001**.

## Requisitos

- Node.js 18 o superior
- En Supabase, las tablas `productos` y `reservas` (columnas en la sección [Base de datos](#base-de-datos))
- La clave **service_role** del proyecto de Supabase

## Configuración y ejecución

```powershell
npm install
Copy-Item .env.example .env
```

Abre `.env` y reemplaza `SUPABASE_SERVICE_ROLE_KEY` por la clave real (*Project Settings → API* en Supabase). Después:

```powershell
npm run dev     # desarrollo, se reinicia al guardar cambios
npm start       # ejecución normal
```

Comprueba que funciona abriendo `http://localhost:3001/health`.

### Variables de entorno

| Variable | Obligatoria | Por defecto | Descripción |
|---|---|---|---|
| `SUPABASE_URL` | Sí | — | Dirección del proyecto de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | — | Clave secreta **service_role** |
| `PORT` | No | `3001` | Puerto donde escucha la API |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Orígenes del frontend permitidos, separados por comas |
| `RESERVATION_TTL_HOURS` | No | — | Reservada para la caducidad de reservas. **Todavía no se usa** |

> ⚠️ **La clave `service_role` se salta todas las políticas de seguridad de Supabase.** Solo debe estar en este servidor: nunca en el frontend, en capturas, en el chat ni en Git. El archivo `.env` ya está excluido por `.gitignore`.

## Endpoints

Todos los datos viajan en JSON. En las rutas que modifican una reserva hay que indicar el **documento del titular**; si no coincide con el de la reserva, la API responde `404` (no confirma que esa reserva exista).

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/health` | Estado de la API |
| `GET` | `/api/reservas?documento=…&estado=…` | Lista las reservas de un documento. `estado` es opcional |
| `GET` | `/api/reservas/:id?documento=…` | Devuelve una reserva |
| `POST` | `/api/reservas` | Crea una reserva |
| `PATCH` | `/api/reservas/:id` | Edita cantidad, correo o celular de una reserva activa |
| `DELETE` | `/api/reservas/:id?documento=…` | Cancela una reserva activa (no la borra: cambia su estado a `eliminado`) |

### Crear una reserva

`POST /api/reservas`

```json
{
  "nombre": "Juana Pérez",
  "documento": "123456789",
  "tipoDocumento": "CC",
  "correo": "juana@example.com",
  "celular": "3001234567",
  "idProducto": 8,
  "cantidad": 2
}
```

Todos los campos son obligatorios. `correo` debe tener formato válido, y `idProducto` y `cantidad` deben ser enteros positivos. Responde `201` con la reserva creada (incluye los datos del producto). La reserva nace con estado `activo`.

### Listar reservas

```
GET /api/reservas?documento=123456789
GET /api/reservas?documento=123456789&estado=activo
```

`estado` puede ser `activo`, `exitoso` o `eliminado`. Cada reserva trae el producto asociado (`productos`: nombre, precio, imagen). Las más recientes van primero. Si no hay resultados, devuelve `[]`.

### Editar una reserva

`PATCH /api/reservas/5`

```json
{
  "documento": "123456789",
  "cantidad": 3,
  "celular": "3109999999"
}
```

Se puede enviar cualquier combinación de `cantidad`, `correo` y `celular` (al menos uno). La cantidad no puede superar las existencias del producto.

### Cancelar una reserva

```
DELETE /api/reservas/5?documento=123456789
```

La reserva pasa a estado `eliminado`. Los datos se conservan en la base.

### Códigos de respuesta

| Código | Cuándo ocurre |
|---|---|
| `200` | Consulta, edición o cancelación correcta |
| `201` | Reserva creada |
| `400` | Faltan campos, datos con formato inválido, `estado` no permitido o `:id` que no es un entero positivo |
| `404` | Producto o reserva no encontrados, o el documento no coincide con el de la reserva |
| `409` | No hay existencias suficientes, o la reserva ya no está activa (entregada o cancelada) |
| `502` | Supabase no respondió o rechazó la solicitud. El detalle se escribe en la consola de la API, no se devuelve al cliente |

### Estados de una reserva

| Valor | En pantalla | ¿Se puede editar o cancelar? |
|---|---|---|
| `activo` | Pagado | Sí |
| `exitoso` | Entregado | No |
| `eliminado` | Cancelado | No |

Esta API **no** tiene una ruta para marcar una reserva como `exitoso`: esa acción corresponde al personal de la tienda y por ahora se hace directamente en Supabase.

## Base de datos

**`productos`** (solo se lee): `id_producto`, `nombre`, `descripcion`, `imagen`, `precio`, `existencias`, `marca`, `modelo`.

**`reservas`**:

| Columna | Descripción |
|---|---|
| `id_reserva` | Identificador (clave primaria, autogenerado) |
| `nombre`, `documento`, `tipo_documento`, `correo`, `celular` | Datos del cliente |
| `id_producto` | **Llave foránea** hacia `productos.id_producto` |
| `cantidad` | Unidades reservadas |
| `estado` | `activo`, `exitoso` o `eliminado` |

Sin la llave foránea, la consulta de reservas falla, porque pide el producto de cada reserva en la misma solicitud.

## Cómo funciona por dentro

```
src/
├── server.js     Carga el .env y levanta el servidor
├── app.js        Rutas, validación de datos y reglas (propiedad por documento, solo reservas activas)
└── supabase.js   Acceso a Supabase con la clave service_role
```

Igual que en la API de productos, `app.js` recibe un "repositorio" con los métodos `create`, `list`, `findById` y `update`. Así las pruebas usan datos simulados sin tocar Supabase.

Al crear una reserva, `supabase.js` primero consulta el producto, valida que existan unidades suficientes y después inserta la reserva.

## Pruebas

```powershell
npm test
```

Usan `node --test` con un repositorio simulado: **no necesitan Supabase ni claves**. Cubren la validación de datos, los errores 404 y 409, y las reglas de edición y cancelación.

## Limitaciones conocidas

- **No descuenta existencias** al reservar; solo valida que haya suficientes en ese momento. Entre la validación y la inserción hay una pequeña ventana en la que dos reservas simultáneas podrían pasar. La solución correcta es una función SQL en Supabase que valide y descuente en una sola transacción.
- **Las reservas no caducan.** `RESERVATION_TTL_HOURS` está reservada pero sin uso; falta una tarea programada.
- **Sin autenticación:** el documento actúa como identificador y no como credencial. Sirve para una demostración, pero no para producción.
- No envía correos de confirmación.

## Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| `502` y en consola "Supabase respondió con estado 401" | La clave service_role es inválida, está sin pegar, es la clave anon, o tiene comillas o espacios |
| `502` al crear una reserva (en consola, un estado 400 de Supabase) | Falta alguna columna en `reservas` (por ejemplo `tipo_documento`) |
| `502` solo al **listar** reservas | Falta la llave foránea `reservas.id_producto → productos` |
| "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY" | No existe el `.env` o le faltan variables |
| `EADDRINUSE` | El puerto 3001 ya está en uso |
| Error de CORS en el navegador | El origen del frontend no está en `CORS_ORIGIN` |
