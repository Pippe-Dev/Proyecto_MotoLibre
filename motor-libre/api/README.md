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

### Antes de usarla: aplicar la migración (una sola vez)

El descuento de existencias y la caducidad dependen de un *trigger* en la base de datos. Ejecuta el contenido de [`supabase/migrations/20261104000000_stock_y_caducidad_reservas.sql`](supabase/migrations/20261104000000_stock_y_caducidad_reservas.sql) en Supabase → **SQL Editor**. Es idempotente: puedes repetirlo sin riesgo. Ver [qué hace](#existencias-y-caducidad).

### Variables de entorno

| Variable | Obligatoria | Por defecto | Descripción |
|---|---|---|---|
| `SUPABASE_URL` | Sí | — | Dirección del proyecto de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | — | Clave secreta **service_role** |
| `PORT` | No | `3001` | Puerto donde escucha la API |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Orígenes del frontend permitidos, separados por comas |
| `RESERVATION_TTL_HOURS` | No | — | Horas tras las cuales una reserva **activa** caduca automáticamente (por ejemplo `48`). Si no se define, la caducidad queda desactivada |

> ⚠️ **La clave `service_role` se salta todas las políticas de seguridad de Supabase.** Solo debe estar en este servidor: nunca en el frontend, en capturas, en el chat ni en Git. El archivo `.env` ya está excluido por `.gitignore`.

## Endpoints

Todos los datos viajan en JSON. Todas las rutas de `/api/reservas` exigen sesión de Supabase: se envía `Authorization: Bearer <access_token>`. Sin token, o con un token inválido o vencido, la API responde `401`. Cada usuario solo puede ver, editar y cancelar **sus** reservas; si la reserva es de otra cuenta responde `404` (no confirma que exista).

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/health` | Estado de la API |
| `GET` | `/api/reservas/mias?estado=…` | Lista las reservas de la cuenta con sesión. `estado` es opcional |
| `GET` | `/api/reservas/:id` | Devuelve una reserva propia |
| `POST` | `/api/reservas` | Crea una reserva |
| `POST` | `/api/reservas/lote` | Crea varias reservas "todo o nada" (el carrito) |
| `PATCH` | `/api/reservas/:id` | Edita cantidad, correo o celular de una reserva activa |
| `DELETE` | `/api/reservas/:id` | Cancela una reserva activa (no la borra: cambia su estado a `eliminado`) |

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

### Crear varias reservas a la vez (carrito)

`POST /api/reservas/lote`

```json
{
  "nombre": "Juana Pérez",
  "documento": "123456789",
  "tipoDocumento": "CC",
  "correo": "juana@example.com",
  "celular": "3001234567",
  "items": [
    { "idProducto": 8, "cantidad": 1 },
    { "idProducto": 3, "cantidad": 2 }
  ]
}
```

Los datos del cliente son comunes y `items` lleva los productos (entre 1 y 20). Responde `201` con la lista de reservas creadas.

Es **"todo o nada"**: si un producto no existe o no tiene stock, la API borra las reservas que ya había creado en ese pedido (el trigger devuelve las unidades) y responde `404` o `409` con el mensaje y el `idProducto` que falló. El cliente nunca queda con reservas a medias.

### Listar reservas

```
GET /api/reservas/mias
GET /api/reservas/mias?estado=activo
```

`estado` puede ser `activo`, `exitoso` o `eliminado`. Cada reserva trae el producto asociado (`productos`: nombre, precio, imagen). Las más recientes van primero. Si no hay resultados, devuelve `[]`.

### Editar una reserva

`PATCH /api/reservas/5`

```json
{
  "cantidad": 3,
  "celular": "3109999999"
}
```

Se puede enviar cualquier combinación de `cantidad`, `correo` y `celular` (al menos uno). La cantidad no puede superar las existencias del producto.

### Cancelar una reserva

```
DELETE /api/reservas/5
```

La reserva pasa a estado `eliminado`. Los datos se conservan en la base.

### Códigos de respuesta

| Código | Cuándo ocurre |
|---|---|
| `200` | Consulta, edición o cancelación correcta |
| `201` | Reserva creada |
| `400` | Faltan campos, datos con formato inválido, `estado` no permitido o `:id` que no es un entero positivo |
| `404` | Producto o reserva no encontrados, o la reserva pertenece a otra cuenta |
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

## Existencias y caducidad

Un *trigger* de Postgres sobre la tabla `reservas` mantiene `productos.existencias` coherente. Lo hace la base de datos y no la API, así que funciona igual aunque alguien cambie una reserva desde el panel de Supabase:

| Qué pasa con la reserva | Efecto en `existencias` |
|---|---|
| Se crea una reserva activa | Se descuentan las unidades |
| Se cambia la cantidad | Se descuenta o devuelve la diferencia |
| Pasa de `activo` a `eliminado` (cancelada o caducada) | Se devuelven las unidades |
| Pasa de `eliminado` a `activo` | Se vuelven a descontar |
| Se borra una reserva activa | Se devuelven las unidades |

El trigger bloquea la fila del producto mientras actúa, así que **dos personas que reserven la última unidad al mismo tiempo no pueden pasar las dos**: una recibe `409`.

**Caducidad.** Si `RESERVATION_TTL_HOURS` está definida, al arrancar la API y luego cada 15 minutos se cancelan las reservas `activo` con más de esas horas desde `creado_en`. Al pasar a `eliminado`, el trigger devuelve las unidades. Solo corre mientras la API está encendida.

## Cómo funciona por dentro

```
src/
├── server.js                   Carga el .env, levanta el servidor y arranca la caducidad
├── app.js                      Rutas, validación de datos y reglas (propiedad por usuario, solo reservas activas)
├── supabase.js                 Acceso a Supabase con la clave service_role
└── jobs/expireReservations.js  Caducidad periódica de reservas
supabase/migrations/            SQL que se ejecuta en Supabase (trigger de existencias)
```

Igual que en la API de productos, `app.js` recibe un "repositorio" con los métodos `create`, `list`, `findById`, `update`, `remove` y `expireOlderThan`. Así las pruebas usan datos simulados sin tocar Supabase.

Al crear una reserva, `supabase.js` primero consulta el producto para dar un error claro si no existe o no alcanza el stock, y después inserta la reserva. La comprobación definitiva (la que evita el doble reservado) la hace el trigger de la base.

## Pruebas

```powershell
npm test
```

Usan `node --test` con un repositorio simulado: **no necesitan Supabase ni claves**. Cubren la validación de datos, los errores 404 y 409, las reglas de edición y cancelación, el pedido "todo o nada" y la caducidad. El trigger SQL **no** está cubierto por estas pruebas; se verifica ejecutándolo en Supabase.

## Limitaciones conocidas

- **Hay que aplicar la migración SQL** en cada base de datos. Sin ella la API funciona, pero no descuenta stock ni caduca reservas.
- **Las reservas anteriores a la migración no descontaron stock.** Hay un bloque opcional al final del `.sql` para corregirlo una vez.
- **La caducidad solo corre mientras la API está encendida.** Al volver a arrancar se ponen al día.
- **Reservas anteriores a las cuentas** no tienen `user_id`, así que no se pueden consultar desde la API.
- No envía correos de confirmación.

## Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| `502` y en consola "Supabase respondió con estado 401" | La clave service_role es inválida, está sin pegar, es la clave anon, o tiene comillas o espacios |
| `502` al crear una reserva (en consola, un estado 400 de Supabase) | Falta alguna columna en `reservas` (por ejemplo `tipo_documento`) |
| `502` solo al **listar** reservas | Falta la llave foránea `reservas.id_producto → productos` |
| En consola: "No se pudo caducar reservas ... 400" | Falta la columna `creado_en`: no se aplicó la migración SQL |
| El stock no baja al reservar | No se aplicó la migración SQL (falta el trigger) |
| "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY" | No existe el `.env` o le faltan variables |
| `EADDRINUSE` | El puerto 3001 ya está en uso |
| Error de CORS en el navegador | El origen del frontend no está en `CORS_ORIGIN` |
