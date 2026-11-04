# MotoLibre

Tienda en línea de repuestos y accesorios para motocicletas. El cliente explora el catálogo, ve el detalle de cada producto, arma un carrito y **reserva** los productos para pagarlos y recogerlos en tienda. Después puede consultar, editar o cancelar sus reservas usando su número de documento.

> Estado: proyecto académico en desarrollo.

---

## Cómo está organizado

El proyecto tiene **tres aplicaciones** que se ejecutan al mismo tiempo y una base de datos en la nube:

```
┌──────────────────┐        ┌────────────────────┐
│    Frontend      │ ─────► │  ApiProducto       │ ──┐
│  React + Vite    │        │  (puerto 3000)     │   │      ┌───────────────┐
│  (puerto 5173)   │        │  Lee productos     │   ├────► │   Supabase    │
│                  │ ─────► ├────────────────────┤   │      │  (PostgreSQL) │
│                  │        │  api (reservas)    │ ──┘      │ productos     │
│                  │        │  (puerto 3001)     │          │ reservas      │
└──────────────────┘        │  Crea y gestiona   │          └───────────────┘
                            └────────────────────┘
```

| Carpeta | Qué es | Puerto | Documentación |
|---|---|---|---|
| [`motor-libre/`](motor-libre/) | Frontend en React + TypeScript + Vite | 5173 | [README](motor-libre/README.md) |
| [`motor-libre/ApiProducto/`](motor-libre/ApiProducto/) | API que consulta el catálogo de productos | 3000 | [README](motor-libre/ApiProducto/README.md) |
| [`motor-libre/api/`](motor-libre/api/) | API que gestiona las reservas | 3001 | [README](motor-libre/api/README.md) |

Las dos APIs son servidores Node.js con Express. Hablan con Supabase a través de su API REST. **El navegador nunca habla directo con Supabase**: pasa siempre por una de las dos APIs, de modo que las claves secretas no llegan al cliente.

---

## Qué necesitas antes de empezar

1. **Node.js 18 o superior** (incluye `npm`). Compruébalo con `node -v`.
2. **Git**.
3. **Las claves de Supabase**, que te entrega quien administra el proyecto por un canal privado. No están en el repositorio:
   - clave **anon** (pública, solo lectura de productos),
   - clave **service_role** (secreta, para crear y modificar reservas).

La base de datos de Supabase ya está creada y tiene las tablas `productos` y `reservas`. No tienes que crear nada ahí para ejecutar el proyecto.

---

## Puesta en marcha paso a paso

### 1. Clonar el repositorio

```powershell
git clone https://github.com/Pippe-Dev/Proyecto_MotoLibre.git
cd Proyecto_MotoLibre\motor-libre
```

### 2. Instalar dependencias

Cada aplicación tiene sus propias dependencias, así que hay que instalar tres veces:

```powershell
npm install                          # frontend
cd ApiProducto; npm install; cd ..   # API de productos
cd api; npm install; cd ..           # API de reservas
```

### 3. Crear los archivos `.env`

Los archivos `.env` contienen claves y **no se suben a GitHub** (están en `.gitignore`). Cada aplicación incluye un `.env.example` que sirve de plantilla:

```powershell
Copy-Item .env.example .env
Copy-Item ApiProducto\.env.example ApiProducto\.env
Copy-Item api\.env.example api\.env
```

Después abre estos dos archivos y reemplaza el texto de ejemplo por las claves reales:

| Archivo | Variable | Valor |
|---|---|---|
| `ApiProducto/.env` | `SUPABASE_ANON_KEY` | clave **anon** |
| `api/.env` | `SUPABASE_SERVICE_ROLE_KEY` | clave **service_role** |

Escríbelas sin comillas ni espacios y guarda el archivo. El `.env` del frontend no necesita cambios.

### 4. Aplicar la migración de la base de datos (una sola vez)

El control de existencias y la caducidad de reservas dependen de un *trigger* en Supabase. Está en [`motor-libre/api/supabase/migrations/`](motor-libre/api/supabase/migrations/20261104000000_stock_y_caducidad_reservas.sql).

1. Abre Supabase → **SQL Editor** → *New query*.
2. Pega el contenido completo del archivo `.sql` y pulsa **Run**.

Es seguro ejecutarlo más de una vez. Hay que hacerlo **una vez por base de datos**: si ya lo ejecutó otra persona sobre el mismo proyecto de Supabase, no tienes que repetirlo.

> Si no se ejecuta, la API sigue funcionando pero el stock no se descuenta y la caducidad de reservas falla (verás el error en la consola de la API).

### 5. Arrancar las tres aplicaciones

Abre **tres terminales**, todas dentro de `motor-libre`, y ejecuta una orden en cada una:

```powershell
# Terminal 1 - API de productos
cd ApiProducto
npm run dev

# Terminal 2 - API de reservas
cd api
npm run dev

# Terminal 3 - Frontend
npm run dev
```

Abre **http://localhost:5173** en el navegador.

### 6. Comprobar que todo responde

| Dirección | Respuesta esperada |
|---|---|
| http://localhost:3000/health | `{"status":"ok"}` |
| http://localhost:3000/api/products | lista de productos en JSON |
| http://localhost:3001/health | `{"status":"ok"}` |

---

## Páginas del sitio

| Ruta | Qué muestra |
|---|---|
| `/` | Inicio con carrusel |
| `/catalogo` | Catálogo de productos con filtros por marca y modelo |
| `/producto/:id` | Detalle de un producto, con opción de añadir al carrito o reservar |
| `/carrito` | Carrito de compras, con opción de reservar todos los productos |
| `/reservas` | **Mis reservas**: consulta por documento, edición y cancelación |
| `/contacto` | Datos de contacto, horario y pasos para reservar |

---

## Cómo funciona una reserva

1. El cliente elige un producto (o varios desde el carrito) y llena el formulario con nombre, tipo y número de documento, correo, celular y cantidad.
2. La API de reservas comprueba que el producto exista y que haya existencias suficientes. Si el carrito tiene varios productos, la reserva es **"todo o nada"**: si uno falla (por ejemplo, se agotó), no se crea ninguna y el cliente ve el motivo.
3. Se guarda la reserva con estado **activo** (se muestra como "Pagado") y **se descuentan las unidades** del stock del producto.
4. Más tarde, en `/reservas`, el cliente escribe su documento y ve sus reservas. Mientras estén activas, puede **editarlas** (cantidad, correo, celular) o **cancelarlas**. Al cancelar o reducir la cantidad, las unidades **vuelven al stock**.
5. Si una reserva activa supera `RESERVATION_TTL_HOURS` (48 h en el ejemplo) sin completarse, la API la **caduca** sola y devuelve las unidades al stock.

Estados de una reserva:

| Valor en la base | Se muestra como | Significado |
|---|---|---|
| `activo` | Pagado | Reserva vigente, editable y cancelable |
| `exitoso` | Entregado | Ya se entregó; no se puede modificar |
| `eliminado` | Cancelado | Cancelada; no se puede modificar |

---

## Base de datos (Supabase)

Las APIs esperan estas dos tablas.

**`productos`**

| Columna | Descripción |
|---|---|
| `id_producto` | Identificador (clave primaria) |
| `nombre`, `descripcion` | Datos del producto |
| `marca`, `modelo` | Se usan en los filtros del catálogo |
| `precio` | Precio unitario en pesos colombianos |
| `existencias` | Unidades disponibles |
| `imagen` | Ruta o URL de la imagen (ver más abajo) |

**`reservas`**

| Columna | Descripción |
|---|---|
| `id_reserva` | Identificador (clave primaria) |
| `nombre`, `documento`, `tipo_documento`, `correo`, `celular` | Datos del cliente |
| `id_producto` | Llave foránea hacia `productos.id_producto` |
| `cantidad` | Unidades reservadas |
| `estado` | `activo`, `exitoso` o `eliminado` |
| `creado_en` | Fecha de creación (la añade la migración); se usa para caducar reservas |

La llave foránea de `reservas.id_producto` es obligatoria: la consulta de reservas la usa para traer el nombre, el precio y la imagen del producto.

### Seguridad de las claves

- La API de productos usa la clave **anon** y necesita una política RLS de lectura sobre `productos`.
- La API de reservas usa la clave **service_role**, que se salta RLS. Por eso **nunca** debe ir en el frontend ni subirse a Git.
- Si una clave se filtra, genera una nueva en Supabase (*Project Settings → API*).

### Imágenes de productos

La columna `imagen` acepta dos formas:

- **Ruta local**, por ejemplo `/images/productos/casco.jpg`. El archivo debe estar en `motor-libre/public/images/productos/`. Es la opción recomendada.
- **URL externa**. Funciona, pero depende de que el sitio de origen siga disponible.

Si una imagen no carga, el sitio muestra `public/images/sin-imagen.svg` en su lugar.

---

## Problemas frecuentes

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| El catálogo sale vacío o con error | La API de productos no corre, o la clave anon falta o es incorrecta | Abre `http://localhost:3000/api/products` y revisa `ApiProducto/.env` |
| Reservar da error | La API de reservas no corre, o la clave service_role es incorrecta | Abre `http://localhost:3001/health` y revisa `api/.env` |
| Supabase responde 401 en la consola de la API | Clave inválida o con comillas o espacios | Vuelve a copiarla y guarda el archivo |
| `EADDRINUSE` al arrancar | El puerto ya está ocupado | Cierra el otro programa o cambia `PORT` en el `.env` |
| Error de CORS en el navegador | El frontend corre en un puerto distinto de 5173 | Añade ese origen en `WEB_ORIGINS` (productos) y `CORS_ORIGIN` (reservas) |
| Cambié un `.env` y no pasa nada | Las APIs leen el archivo solo al arrancar | Detén y vuelve a iniciar esa API |

---

## Pruebas

Cada API tiene sus pruebas automáticas, que no necesitan conexión a Supabase:

```powershell
cd ApiProducto; npm test
cd api; npm test
```

Para el frontend:

```powershell
npm run lint    # revisa el estilo del código
npm run build   # comprueba los tipos y genera la versión de producción
```

---

## Limitaciones conocidas

- **La caducidad solo corre mientras la API de reservas está encendida.** Si estuvo apagada, caducará las reservas vencidas en cuanto vuelva a arrancar (y luego cada 15 minutos).
- Las reservas que ya existían **antes de aplicar la migración** no descontaron stock. Hay un bloque opcional al final del archivo `.sql` para corregirlo una sola vez.
- Marcar una reserva como **Entregada** (`exitoso`) se hace a mano en Supabase; la API no tiene esa ruta.
- **No hay inicio de sesión.** Quien conozca un número de documento puede ver y cancelar sus reservas. Es suficiente para una demostración, pero no para producción.
- No se envían correos de confirmación.

---

## Tecnologías

- **Frontend:** React 19, TypeScript, Vite, React Router, Bootstrap 5 y Bootstrap Icons.
- **APIs:** Node.js, Express, CORS, dotenv, pruebas con el ejecutor integrado de Node (`node --test`).
- **Base de datos:** Supabase (PostgreSQL con API REST).
