# MotoLibre · Frontend

Aplicación web de la tienda MotoLibre, hecha con **React 19 + TypeScript + Vite**. Muestra el catálogo, el detalle de producto, el carrito y la gestión de reservas. No guarda datos por sí sola: los pide a dos APIs.

> Esta carpeta también contiene las dos APIs ([`ApiProducto`](ApiProducto/README.md) y [`api`](api/README.md)). Para ver cómo encaja todo, empieza por el [README principal](../README.md).

## Requisitos

- Node.js 18 o superior
- Las dos APIs en marcha (si no, el catálogo y las reservas no cargan)

## Instalación y ejecución

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Se abre en **http://localhost:5173**.

## Scripts disponibles

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Revisa los tipos con TypeScript y genera la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente la versión generada por `build` |
| `npm run lint` | Revisa el código con ESLint |

## Variables de entorno

Archivo `.env` (se crea copiando `.env.example`). Las variables de Vite deben empezar por `VITE_`.

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `VITE_PRODUCTS_API_URL` | `http://localhost:3000/api` | Dirección de la API de productos |
| `VITE_RESERVATIONS_API_URL` | `http://localhost:3001/api` | Dirección de la API de reservas |

Si no defines una variable, se usa el valor por defecto de la tabla, que corresponde a ejecutar todo en tu equipo. Para desplegar, apunta estas dos variables a las direcciones públicas de las APIs.

Si cambias un `.env`, reinicia `npm run dev`.

## Páginas

Las rutas están definidas en [`src/App.tsx`](src/App.tsx).

| Ruta | Archivo | Descripción |
|---|---|---|
| `/` | `pages/homePage.tsx` | Inicio con carrusel |
| `/catalogo` | `pages/catalogPage.tsx` | Listado con filtros por marca y modelo |
| `/producto/:id` | `pages/productDetailPage.tsx` | Detalle, galería con zoom, selector de cantidad, añadir al carrito y reservar |
| `/carrito` | `pages/cartPage.tsx` | Carrito y reserva de todos los productos |
| `/reservas` | `pages/reservationsLookupPage.tsx` | Consulta, edición y cancelación de reservas |
| `/contacto` | `pages/contactPage.tsx` | Datos de contacto, horario y pasos para reservar |
| `*` | `pages/notFoundPage.tsx` | Página 404 |

## Estructura de `src/`

```
src/
├── components/
│   ├── cart/            Carrito: lista, resumen y modal para reservar desde el carrito
│   ├── home/            Carrusel de la portada
│   ├── layout/          Pie de página
│   ├── product/         Detalle: imagen con zoom, información, selector de cantidad, modal de reserva
│   └── reservations/    "Mis reservas": buscador y tarjeta de cada reserva
├── constants/           Estados de reserva y sus etiquetas
├── context/             cartContext: estado global del carrito
├── pages/               Una página por ruta
├── service/             Llamadas HTTP a las APIs
├── types/               Tipos de TypeScript
├── App.tsx              Barra de navegación y rutas
└── main.tsx             Punto de entrada
```

### Capa de servicios (`src/service/`)

| Archivo | Responsabilidad |
|---|---|
| `productService.ts` | Lista productos (con filtros) y consulta uno por id. Convierte la respuesta de la API al formato que usa la interfaz |
| `reservationService.ts` | Crea (una o varias a la vez), consulta, edita y cancela reservas |

Los componentes nunca llaman a `fetch` directamente: siempre pasan por estos archivos.

## Piezas importantes

### Carrito (`context/cartContext.tsx`)
Es un contexto de React que comparte el carrito con toda la aplicación. Guarda en el navegador **solo el id y la cantidad** de cada producto, no el producto completo, así que al recargar vuelve a pedir los datos actualizados a la API.

### Reservas (`components/reservations/`)
- `reservationsLookup.tsx`: formulario de búsqueda por documento y estado, resumen y lista de resultados.
- `reservationCard.tsx`: tarjeta de cada reserva. Si está activa, permite **editar** (cantidad, celular, correo) y **cancelar** con confirmación. Actualiza la tarjeta en pantalla sin repetir la búsqueda.
- `reservationsLookup.css`: estilos del módulo.

Para reservar hay dos modales con el mismo formulario: `product/reservationModal.tsx` (un producto) y `cart/cartReservationModal.tsx` (todo el carrito). El del carrito envía **un solo pedido** a la API, que lo procesa "todo o nada": si un producto falla, no se crea ninguna reserva y se muestra el motivo.

### Página de contacto
Los datos que se muestran (dirección, teléfono, correo y horario) están en [`src/constants/contactInfo.ts`](src/constants/contactInfo.ts). **Son valores de ejemplo**: edítalos con los datos reales de la tienda.

### Imágenes
Las imágenes de productos están en `public/images/`. Si una imagen no carga, los componentes muestran `public/images/sin-imagen.svg` mediante el evento `onError`. Cuando agregues fotos:

1. Copia el archivo a `public/images/productos/` con un nombre en minúsculas y sin espacios.
2. En Supabase, actualiza la columna `imagen` del producto con la ruta, por ejemplo `/images/productos/casco.jpg`.

### Estilos
- Bootstrap 5 para la base, y Bootstrap Icons para los íconos.
- Los colores y medidas comunes están como variables CSS al inicio de `src/App.css` (`--color-primary`, `--radius`, `--shadow-sm`...). Úsalas en vez de escribir colores a mano.

## Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| Catálogo vacío o mensaje de error | La API de productos no está corriendo, o falta su clave anon |
| Error al reservar o consultar reservas | La API de reservas no está corriendo, o falta su clave service_role |
| Error de CORS en la consola del navegador | El frontend corre en un puerto distinto de 5173 y las APIs no lo permiten |
| El cambio de `.env` no se aplica | Falta reiniciar `npm run dev` |
| `npm run build` falla con errores de tipos | Revisa el archivo que indica TypeScript; el proyecto usa modo estricto |
