# PRD — ShopyLink

**Venta de catálogo por WhatsApp + marketplace público para el comercio local**
**Versión:** 1.0 · **Fecha:** 6 de noviembre de 2026 · **Estado:** producto en producción (`shopylinks.shop`)
**Autor del documento:** Andrew Licona (producto y ingeniería)

---

## 1. Resumen ejecutivo

ShopyLink es una plataforma SaaS multi-tenant que convierte cualquier comercio pequeño en una tienda online operativa en minutos, sin necesidad de pasarela de pagos, sin app móvil y sin conocimiento técnico. El comerciante publica un catálogo, comparte **un solo enlace** y cierra la venta por WhatsApp, que es donde ya está su cliente.

La plataforma tiene dos caras que se retroalimentan:

1. **La tienda del comercio** (`shopylinks.shop/{slug}`): catálogo con variantes, stock, descuentos, banners, horarios, temas visuales y checkout que termina en un mensaje de WhatsApp preformateado con los productos y el total.
2. **El marketplace público** (`shopylinks.shop/marketplace`): un catálogo agregado de todas las tiendas publicadas, con buscador, categorías, filtro de ofertas y un carrito global capaz de agrupar productos de varias tiendas en un solo checkout (un pedido por tienda, un mensaje de WhatsApp por tienda).

**Estado actual:** en producción, con 3 tiendas (2 PRO y 1 FREE), 91 productos, 4 usuarios y 5 pedidos sobre la base de datos. El marketplace, el checkout multi-tienda, la auditoría del carrito y el panel de administración están operativos y verificados de extremo a extremo.

**Lo que hace que sea vendible:**

- **Cero fricción de arranque:** el comerciante no necesita registrar una pasarela de pagos, dominio ni descargar nada. Abre un enlace, comparte por WhatsApp y empieza a recibir pedidos.
- **El checkout ocurre donde el cliente ya está:** WhatsApp. Se elimina el abandono típico de las tiendas web que piden tarjeta y datos en un formulario largo.
- **Marketplace incluido:** cada tienda nueva es, además de una URL propia, inventario en un punto de venta colectivo. Esto convierte el crecimiento de un comerciante en tráfico para los demás.
- **Margen de infraestructura bajo:** el stack es Next.js + NestJS + Postgres en contenedores, sin servicios gestionados costosos.

---

## 2. Problema de mercado

### 2.1 El problema del comprender independiente

| Síntoma | Consecuencia |
|---|---|
| Montar una tienda web exige registrar hosting, dominio y pasarela de pagos | El comerciante abandona antes de empezar |
| El catálogo se comparte en Instagram/WhatsApp como fotos sueltas | El cliente no puede ordenar sin escribir un mensaje largo |
| Cada pedido llega como texto libre | El comerciante transcribe precios a mano y se equivoca |
| No hay inventario real | Se venden cosas agotadas y se pierde la confianza |
| Las plataformas de e-commerce (Shopify, Tiendanube) están pensadas para volumen | Un comercio de barrio no justifica 30 USD/mes ni la curva de aprendizaje |

### 2.2 El hueco de mercado

Existe un segmento grande y desatendido: **el comercio local que vende por WhatsApp y quiere parecer profesional**. Necesita un catálogo visual y compartible, pero no quiere ni puede procesar pagos online, ni aprender un gestor de contenido, ni pagar una suscripción por transactividad que no tiene.

ShopyLink resuelve exactamente ese tramo: **catálogo profesional + cierre por WhatsApp**, con un panel simple y una suscripción opcional.

### 2.3 Cuándo NO aplica ShopyLink

- Comercio que ya tiene alto volumen online y necesita checkout con tarjeta, PSD2, facturación y devoluciones.
- Negocio digital puro que necesita suscripciones recurrentes o cobros programados.
- Empresa que requiere multi-empleado con roles, permisos y auditoría.

---

## 3. Propuesta de valor

### 3.1 Para el comerciante (comprador de la suscripción)

| Necesidad | Cómo la resuelve ShopyLink |
|---|---|
| "Quiero parecer una tienda de verdad" | Catálogo propio con URL, logo, 14 temas × 6 modos, banners en 3 posiciones, afiche QR descargable |
| "Quiero que me ordenen sin hacerlos escribir todo" | Carrito con variantes y cantidades, checkout que arma el mensaje de WhatsApp con el detalle y el total |
| "Quiero saber qué se está vendiendo" | Panel con inventario, pedidos, ventas de hoy, ventas totales, gráfico de ventas y catálogo en PDF |
| "Quiero actualizar precios rápido" | Variantes con precio propio o heredado, stock propio o heredado, descuento por producto y descuento global |
| "Quiero vender cosas que no son físicamente un producto" | Tipo de ítem "servicio" con modos de precio: Desde / Por hora / A convenir |
| "Quiero que me encuentren clientes que no me conocen" | Publicación en el marketplace con categoría, ciudad, etiquetas y ficha de tienda |
| "No quiero pagar por cobros de más" | Plan gratuito real: 10 productos, sin cobro, y el upgrade es de un clic |

### 3.2 Para el cliente final (comprador del producto)

- Un enlace, un catálogo ordenado, y un carrito que entiende.
- Un checkout de una sola pantalla con nombre, teléfono opcional y dirección opcional.
- La confirmación llega por WhatsApp, con el pedido ya escrito: puede confirmar y pagar como prefiera.

### 3.3 Diferenciadores

1. **Marketplace integrado de fábrica.** La mayoría de los clones de "catálogo por WhatsApp" son catálogos aislados. ShopyLink suma un canal de descubrimiento propio que se llena solo con cada alta de tienda.
2. **Carrito global multi-tienda.** Un carrito persistente (localStorage) que sobrevive a la navegación entre tiendas, agrupa por comercio y genera un pedido por tienda en un solo checkout. Es la diferencia entre "un catálogo" y "un marketplace".
3. **Servicios como producto.** La mayoría de estas herramientas asumen que se vende física. ShopyLink modela servicios con precios "desde", "por hora" y "a convenir".
4. **Cero código y cero app.** No hay PWA, no hay app nativa, no hay emails transaccionales: el flujo termina en la app que el cliente ya tiene abierta 50 veces al día.

---

## 4. Segmentos objetivo

| Segmento | Dolor principal | Ajuste del producto | Prioridad |
|---|---|---|---|
| **Comercio de barrio por WhatsApp** (perfumerías, moda, artículos de hogar, papelerías) | Pedidos que llegan como texto y se transcriben mal | Catálogo + carrito + WhatsApp | **Alta** |
| **Emprendedor con catálogo en Instagram** | Fotos sin carrito, sin stock, sin URL propia | URL propia con su marca | **Alta** |
| **Negocio de servicios** (salones, talleres, clases, diseño) | No puede mostrar precios cerrados | Tipo de ítem servicio con modos de precio | Media |
| **Comerciante con varias tiendas/colecciones** | Un solo catálogo se queda corto | Tiendas por slug + marketplace | Media |
| **Minorista con necesidad de cobro online** | — | Fuera de alcance en v1 | Baja |

### 4.1 Persona principal: "El dueño que vende por WhatsApp"

>Tiene 45 años, tiene un local, 300 clientes que le escriben por WhatsApp todos los días. Publica un afiche con su número y contesta uno por uno. Percibe que pierde ventas porque no puede mostrar el catálogo completo y se le olvida qué había pedido la semana pasada.

**Sus necesidades (Job to be done):** "Cuando un cliente me pregunta qué tengo, quiero mostrarle todo mi catálogo de una vez para que elija, sin escribir 12 mensajes."

**Criterios de compra:** precio, facilidad (que no le pida saber de tecnología), que funcione en el celular, y que el cliente final lo entienda sin instrucciones.

---

## 5. Alcance funcional del producto

### 5.1 Panel del comerciante (`/dashboard`) — 7 módulos

| Módulo | Ruta | Funcionalidades |
|---|---|---|
| **Panel** | `/dashboard` | 4 tarjetas de métricas (inventario, pedidos pendientes, ventas de hoy, ventas totales), gráfico de ventas de los últimos 7 días, descarga del catálogo en PDF, botón de compartir tienda (Web Share API con fallback a portapapeles), selector de tienda activa (multi-tienda por usuario) |
| **Productos** | `/dashboard/products` | CRUD completo, categorías propias, SKU, imágenes múltiples, variantes, stock, descuentos, tipo producto/servicio, activación/desactivación, búsqueda y filtro por categoría y estado, indicador de límite del plan, modal de "Límite Alcanzado" con CTA de upgrade |
| **Pedidos** | `/dashboard/orders` | Listado con filtros por estado, detalle con líneas de pedido, cambio de estado (Pendiente → Confirmado → Completado / Cancelado), totales, datos de contacto del cliente |
| **Banners** | `/dashboard/banners` | CRUD de banners, 3 posiciones (HERO, TOP_BAR, BETWEEN_PRODUCTS), título/subtítulo/enlace, previsualización en tiempo real, activar/desactivar, ventana de fechas, guía de tamaños y peso |
| **Código QR** | `/dashboard/qr` | Generación del afiche 1080×1350 con logo, nombre, ubicación, QR de alta resolución y CTA; descarga PNG; el QR apunta a la URL de la tienda |
| **Ajustes** | `/dashboard/settings` | 5 pestañas: **Información** (nombre, slug, logo, WhatsApp, horarios, ubicación y enlace a Maps, delivery), **Marketplace** (publicar, categoría, ciudad, etiquetas, destacado), **Social** (Instagram, Facebook, TikTok, Twitter, Pinterest, YouTube), **Apariencia** (14 temas × 6 modos, aplicar el tema al panel), **Promociones** (descuento global). Incluye "Zona de peligro" (eliminar tienda) |
| **Comunicados** | `/dashboard/broadcasts` | Envío de avisos a los clientes de la tienda con tipo (INFO/WARNING/PROMOTION/SUCCESS) y caducidad |

**Zona horaria y horarios:** el horario se modela como JSON por día de la semana con apertura/cierre, admite turnos que cruzan la medianoche, y la tienda pública muestra un badge "Abierto ahora / Cerrado" calculado en cliente.

### 5.2 Tienda pública (`/{slug}`)

- Cabecera con logo, nombre, badge de estado abierto/cerrado y enlace a ubicación en Maps.
- Barra superior de anuncios, banner principal (HERO) y banners intercalados entre productos.
- Rejilla responsive de productos con imagen, nombre, precio, precio tachado si hay descuento, badge de disponibilidad y CTA de WhatsApp para productos agotados.
- Modal de producto a pantalla completa con selector de variantes (precio y stock por variante), galería, descripción, cantidad y agregado al carrito.
- Sección de ofertas y descuentos con ahorro calculado.
- Sección de productos agotados ("Por encargo") que deriva a WhatsApp.
- Carrito lateral con stepper de cantidades, línea por línea con total y botón de checkout.
- Pie de tienda con redes sociales y datos de contacto.
- Banner de ShopyLink en tiendas del plan gratuito.

### 5.3 Marketplace (`/marketplace`)

| Pantalla | Ruta | Contenido |
|---|---|---|
| Home | `/marketplace` | Hero, barra de categorías filtrable (Todo, Ofertas, y las categorías con catálogo real), feed paginado de productos |
| Buscador | `/marketplace/search?q=` | Búsqueda en servidor con debounce, paginación |
| Categoría | `/marketplace/{categoria}` | Listado por categoría y por ofertas (misma ruta con parámetro especial) |
| Directorio | `/marketplace/tiendas` | Todas las tiendas publicadas con logo, categoría, ciudad y número de productos, con filtro |
| Ficha de tienda | `/marketplace/tienda/{slug}` | Datos del comercio, botón "Visitar tienda" y "Contactar por WhatsApp", métricas de visitas y pedidos |
| Detalle de producto | `/marketplace/producto/{id}` | Galería, precio, disponibilidad, agregado al carrito o derivación a WhatsApp |
| Checkout | `/marketplace/checkout` | Resumen por tienda, formulario de datos del cliente, creación de **un pedido por tienda** y un botón de WhatsApp por comercio |

**Carrito global:** vive en `localStorage` (`shopylink:cart:v1`), sobrevive a la navegación y a las recargas, se sincroniza entre pestañas abiertas, y se renderiza en un portal a `document.body` para no quedar atrapado por el `backdrop-filter` del header.

### 5.4 Panel de superadministrador (`/admin`)

- Métricas globales: tiendas totales, usuarios, tiendas PRO, productos y pedidos.
- Rejilla de tiendas y rejilla de usuarios con acciones.
- **Impersonación**: el admin puede entrar como cualquier usuario con un token de suplantación, y queda auditado.
- Registro de actividad administrativa (`AdminLog`).
- Comunicados globales de la plataforma (`SystemBroadcast`) con caducidad y tipo.

### 5.5 Lo que NO existe hoy (importante para vender con honestidad)

- **Pasarela de pagos.** El checkout no cobra: entrega el pedido a WhatsApp. Es deliberado (el Plan original lo define así) y es la razón por la que el onboarding es de minutos.
- **Reseñas y calificaciones** de tienda (el campo `rating` existe en el modelo, sin flujo de captura).
- **Cupones y códigos de descuento.**
- **Analytics avanzado**: no hay cohortes, embudos ni attribution. Hay 4 métricas y un gráfico.
- **Multi-empleado por tienda**: una tienda tiene un único dueño (`Store.userId`).
- **App móvil nativa ni PWA.**
- **Dominio o subdominio propio por tienda**: hoy todas las tiendas cuelgan del dominio raíz (`/{slug}`).
- **Automatización de la integración**: no hay botón de "Publicar en Instagram/Facebook".
- **Cobertura de tests automatizados:** hay un único spec de ejemplo (`app.controller.spec.ts`); el resto es QA manual y verificación end-to-end en navegador.

---

## 6. Modelo de datos

Prisma sobre PostgreSQL (Supabase). 11 modelos, 4 enums.

### 6.1 Entidades

| Modelo | Campos clave | Relaciones |
|---|---|---|
| **User** | `id`, `username`, `email`, `role` (USER \| SUPER_ADMIN), `name` | 1:N `Store` |
| **Store** | `name`, `slug` (único), `autoGenerateSlug`, `description`, `logoUrl`, `whatsappNumber` (cifrado), `businessHours` (JSON), `theme`, `mode`, `applyThemeToDashboard`, `deliveryEnabled/Price`, `planType` (FREE \| PRO), `isPublic`, `marketplaceCategory`, `city`, `country`, `tags[]`, `featured`, `viewCount`, `orderCount`, `rating`, `globalDiscountActive/Percentage` | 1:N Category, Product, Order, StoreBanner |
| **Category** | `name`, `slug` | N:1 Store (Cascade). Único por `(storeId, slug)` |
| **Product** | `name`, `sku`, `description`, `price` (Decimal 10,2), `discountPrice`, `images[]`, `isActive`, `trackInventory`, `itemType` (product \| service), `pricingMode` (fixed \| from \| hourly \| quote), `baseVariantName` | N:1 Store (Cascade), N:1 Category (SetNull), 1:1 Inventory, 1:N ProductVariant, 1:N OrderItem |
| **ProductVariant** | `name`, `price?`, `stock`, `useParentPrice`, `useParentStock`, `trackInventory`, `sku`, `images[]` (máx. 2) | N:1 Product (Cascade) |
| **Inventory** | `stock` | 1:1 Product (Cascade) |
| **Order** | `total` (Decimal), `status` (PENDING \| CONFIRMED \| CANCELLED \| COMPLETED), `customerName`, `customerPhone?` (hash SHA-256), `customerAddress?`, `completedAt?` | N:1 Store (Cascade), 1:N OrderItem |
| **OrderItem** | `quantity`, `price` (congelado al pedir), `productName`, `sku?`, `variantName?` | N:1 Order (Cascade), N:1 Product? (SetNull), N:1 ProductVariant? (SetNull) |
| **StoreBanner** | `title`, `subtitle`, `imageUrl`, `linkUrl`, `position` (HERO \| TOP_BAR \| FLOATING \| BETWEEN_PRODUCTS), `isActive`, `startsAt?`, `endsAt?` | N:1 Store (Cascade) |
| **SystemBroadcast** | `title`, `content`, `type`, `isActive`, `expiresAt?` | Global |
| **AdminLog** | `action`, `targetType`, `targetId`, `details` | Global (admin) |
| **counters** | Secuencias | Auxiliar |

**Decisiones de modelado relevantes para el negocio:**

- **El precio se congela en el `OrderItem`.** Si el comercio sube el precio mañana, los pedidos de ayer no cambian. Esto es crítico para la confianza y para la contabilidad.
- **`itemType` + `pricingMode`** permite que un mismo catálogo mezcle productos físicos y servicios sin duplicar el modelo.
- **`useParentPrice` / `useParentStock`** evitan duplicar el precio y el stock en cada variante: una tienda con 6 tallas no tiene que reescribir el precio 6 veces.
- **Multi-tenant por `userId`**, no por subdominio: un usuario puede tener varias tiendas (`StoreSwitcher` en el panel).
- **El stock se descuenta al confirmar**, no al crear el pedido: al pasar a `COMPLETED` se resta del inventario y al cancelar se devuelve (con control de stock insuficiente). Verificado en `orders.service.ts`.

### 6.2 Integridad y migraciones

- Migraciones Prisma versionadas en `packages/database/prisma/migrations`.
- Procedimiento establecido y verificado: `prisma migrate deploy` (nunca `migrate dev` contra producción) y SQL idempotente (`ADD COLUMN IF NOT EXISTS`) aplicado desde la consola de Supabase.
- Checksum de migraciones validado en cada despliegue.

---

## 7. Arquitectura y stack técnico

### 7.1 Stack

| Capa | Tecnología | Versión |
|---|---|---|
| Monorepo | Turborepo + npm workspaces | 2.7 / 11.7 |
| Frontend | Next.js (App Router) + React | 15.1.6 / 19.2 |
| Lenguaje | TypeScript | 5.9 |
| Estilos | Tailwind CSS v4 + variables CSS de tema | 4.1 |
| Animaciones | Framer Motion | 12.25 |
| Iconos | Lucide React | 0.562 |
| Backend | NestJS | 11 |
| ORM | Prisma + `@prisma/adapter-pg` | 7.4 |
| Base de datos | PostgreSQL (Supabase) | — |
| Autenticación | Supabase Auth + JWT (Passport-JWT + JWKS) | — |
| Storage | Supabase Storage (logos, banners, imágenes de producto) | — |
| Email | Resend (solo onboarding interno) | 6.9 |
| Caché | Redis 7 (Alpine) | 7 |
| PDF | jsPDF + jspdf-autotable | 4.2 / 5.0 |
| QR | qrcode | 1.5 |
| Fechas | date-fns | 4.1 |
| Toasts | react-hot-toast | 2.6 |
| Despliegue | Docker + Docker Compose + Nginx (reverse proxy) | — |

### 7.2 Estructura del monorepo

```
shopylink/
├── apps/
│   ├── web/        Next.js 15 — tienda pública, marketplace y panel
│   └── api/        NestJS 11 — API REST
├── packages/
│   ├── database/   Prisma Client + schema + migraciones
│   ├── ui/         Componentes UI compartidos
│   ├── types/      Tipos compartidos
│   ├── eslint-config/
│   └── typescript-config/
├── nginx/          Reverse proxy
├── docker-compose.yml
└── turbo.json
```

### 7.3 Topología de despliegue

```
                    ┌──────────────┐
   Internet ──────▶ │    Nginx     │  :3200
                    └──────┬───────┘
              ┌────────────┴────────────┐
              ▼                         ▼
        ┌───────────┐            ┌───────────┐
        │  web      │  INTERNAL  │   api     │  :3001
        │  Next.js  │───────────▶│  NestJS  │
        └───────────┘            └─────┬─────┘
                                       ▼
                          ┌────────────────────────┐
                          │ Postgres (Supabase)    │
                          │ Redis (caché)          │
                          │ Supabase Auth/Storage  │
                          └────────────────────────┘
```

- 4 servicios en Compose: `web`, `api`, `redis`, `nginx`. Volumen persistente para Redis (`AOF`).
- Despliegue automático desde `main` (push a GitHub → Dokploy).
- Variables de entorno inyectadas en build (`NEXT_PUBLIC_*`) y en runtime (`DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`).

### 7.4 Endpoints REST (API pública en `/api`)

| Módulo | Endpoints |
|---|---|
| **Auth** | `GET /auth/profile`, `GET /auth/resolve-username/:username` |
| **Stores** | `POST /stores`, `GET /stores`, `GET /stores/user/:userId`, `GET /stores/:slug`, `GET /stores/public/:slug`, `GET /stores/favicon.ico`, `PATCH /stores/:id`, `DELETE /stores/:id`, `POST /stores/:id/view` |
| **Marketplace** | `GET /stores/marketplace/public`, `GET /stores/marketplace/categories` |
| **Admin** | `GET /stores/admin/all`, `GET /stores/admin/metrics`, `GET /stores/admin/users`, `PATCH /stores/admin/:id`, `POST /stores/admin/impersonate/:userId`, `GET /admin/logs` |
| **Products** | `POST /products`, `GET /products`, `GET /products/:id`, `GET /products/marketplace/public`, `PATCH /products/:id`, `PATCH /products/:id/inventory`, `DELETE /products/:id` |
| **Categories** | `POST /categories`, `GET /categories`, `DELETE /categories/:id` |
| **Orders** | `POST /orders` (público), `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status` |
| **Banners** | `GET /banners`, `GET /banners/admin`, `POST /banners`, `PATCH /banners/:id`, `DELETE /banners/:id` |
| **Broadcasts** | `GET /broadcasts/active`, `POST /broadcasts`, `PATCH /broadcasts/:id/deactivate` |

### 7.5 Convenciones de ingeniería (consistencia y mantenibilidad)

- **Ninguna lógica de negocio en componentes ni páginas**: los hooks (`useProducts`, `useOrders`, `useStoreSettings`, `useStoreView`, `useBanners`, `useDashboard`, `useProfileSettings`) encapsulan el estado y las acciones.
- **Ninguna llamada a `fetch` en componentes**: todo pasa por el cliente central `services/api.ts`, que inyecta el token de Supabase y el token de suplantación.
- **Todas las consultas Prisma usan `withRetry()`**, que reintenta ante fallos transitorios de conexión.
- **Verificación de propiedad (`ownership`) antes de toda mutación**: un usuario solo puede modificar tiendas, productos y pedidos que le pertenecen.
- **Validación estricta en el borde**: `ValidationPipe` global con `whitelist`, `transform` y `forbidNonWhitelisted`; DTOs con `class-validator`.
- **Componentes de máximo 150 líneas**; estilos con variables CSS del tema (`--bg`, `--text`, `--primary`, `--surface`, `--border`, `--secondary`) y nunca colores hardcodeados en la tienda pública.
- **Cifrado de datos sensibles**: el número de WhatsApp del comercio se cifra con AES-256-GCM (formato `iv:authTag:cifrado`) y se descifra en el servicio para armar los enlaces de WhatsApp.

---

## 8. Flujos clave

### 8.1 Alta de un comercio (objetivo: menos de 10 minutos)

```
Registro (Supabase) → Crear tienda (nombre → slug automático) →
Subir logo + WhatsApp + horarios → Agregar productos (con o sin variantes) →
Publicar en marketplace (categoría, ciudad, etiquetas) → Compartir el enlace o el QR
```

Cada pantalla del panel es independiente y de un solo formulario; no hay wizard, pero los pasos son guiados por la estructura de navegación.

### 8.2 Pedido en la tienda individual

```
Cliente abre /{slug} → Explora catálogo → Abre producto → Elige variante y cantidad →
Agrega al carrito → Abre carrito lateral → Envía pedido por WhatsApp →
Se registra el pedido (PENDING) → Se abre WhatsApp con el mensaje preformateado
(producto, variante, cantidad, precio unitario, total) →
El comerciante confirma el pedido en el panel (CONFIRMED → COMPLETED)
```

**El precio y el stock se recalculan y se validan en el servidor.** El cliente nunca fija el precio.

### 8.3 Pedido en el marketplace (multi-tienda)

```
Cliente navega el marketplace → Agrega productos de varias tiendas al carrito global →
El carrito agrupa por comercio → Checkout: un formulario de datos →
El backend crea N pedidos (uno por tienda) con el reparto de líneas correcto →
La pantalla de confirmación muestra un botón de WhatsApp por comercio,
cada uno con el mensaje preformateado de ese pedido
```

Cada botón abre un chat distinto: el cliente puede elegir a quién enviarle. Si una tienda falla, las demás se confirman y la interfaz lo indica (fallo parcial controlado): los productos fallidos permanecen en el carrito y solo se vacían los que sí se pudieron ordenar.

### 8.4 Servicio (no producto)

```
El comercio publica un ítem con tipo "servicio" y modo de precio:
"Desde" (precio de referencia) | "Por hora" | "A convenir" →
El cliente ve la etiqueta de precio y el botón de WhatsApp con la consulta
→ No entra al carrito (no hay stock ni precio cerrado)
```

---

## 9. Modelo de negocio y monetización

### 9.1 Planes actuales

| | **FREE** | **PRO** |
|---|---|---|
| Precio | 0 | **20.000 COP / mes** |
| Productos | Hasta **10** | Ilimitados |
| Anuncios en la tienda | Sí (banner de ShopyLink) | Sin anuncios |
| Soporte | Estándar | Prioritario por WhatsApp |
| Tienda pública, carrito, WhatsApp, banners, QR, themes | Sí | Sí |
| Publicación en el marketplace | Sí | Sí |
| Variantes, stock, descuentos, servicios | Sí | Sí |

**Gating implementado en dos capas:** en la interfaz (`useProducts.ts` abre el modal de upgrade al llegar a 10 productos) y en el servidor (`products.service.ts:46` rechaza la creación más allá del límite). Es decir, el límite no es solo cosmético.

### 9.2 Modelo de cobro actual

**No hay pasarela de pagos integrada.** El upgrade a PRO se gestiona hoy de forma manual (contacto directo, presumiblemente por WhatsApp o transferencia). Esto es intencionado en el MVP, pero es **el hueco más urgente para cerrar**: sin cobro automático, la conversión a PRO depende de que el comerciante recuerde hacer la llamada.

### 9.3 Ingresos proyectados (modelo)

Con N comercios PRO a 20.000 COP/mes:

| Comercios PRO | MRR | ARR |
|---|---|---|
| 50 | 1.000.000 COP | 12.000.000 COP |
| 250 | 5.000.000 COP | 60.000.000 COP |
| 1.000 | 20.000.000 COP | 240.000.000 COP |
| 3.000 | 60.000.000 COP | 720.000.000 COP |

Margen bruto muy alto: el coste incremental por comercio es un registro en Postgres y una URL.

### 9.4 Fuentes de ingreso futuro

1. **Suscripción PRO** (base) — cobrada por Wompi, Mercado Pago o Stripe.
2. **Marketplace como red** — comisión del 3-8% por venta cerrada a través del marketplace, si en el futuro se incorpora el pago.
3. **Servicios profesionales** — dominio propio, catálogo en PDF con marca de agua, analítica avanzada, equipo con permisos.
4. **Marketplace de servicios B2B** — red de proveedores (imprenta, empaque, fotografía de producto) para los comercios de la plataforma.
5. **Plan por volumen** — marketplace visible para más de una tienda, más remitidos, más pedidos.

---

## 10. Estrategia de go-to-market

### 10.1 Fase 1 — Pruebas de campo (0-3 meses)

**Objetivo:** 30 comercios activos y 10 PRO.

- Venta directa asistida: el fundador crea la tienda con el comercio en 15 minutos por videollamada y deja el primer catálogo cargado.
- Captación por el propio producto: el afiche QR y el enlace se imprimen y se pegan; cada comprador que llega por QR es un cliente potencial.
- Grupos de WhatsApp/Facebook de comerciantes de la ciudad.
- Perfil de Instagram/TikTok con un caso real: "de 0 a tienda en 10 minutos".

### 10.2 Fase 2 — Producto maduro (3-9 meses)

**Objetivo:** 300 comercios, 60 PRO.

- Cobro automático de la suscripción (integrar pasarela).
- Programa de referidos: 1 mes PRO gratis por tienda referida.
- Alianzas con proveedores de material, impresoras de etiquetas y empresas de envíos que ya atienden a comercios pequeños.
- Presencia en el marketplace como argumento de venta: "tu tienda además aparece en el catálogo de la ciudad".

### 10.3 Fase 3 — Escala (9-18 meses)

**Objetivo:** 1.500 comercios, 350 PRO, primer ingreso por comisión.

- Páginas de entrada por vertical (perfumería, moda, hogar) optimizadas para SEO y para captarlos.
- Programa de partner para revendedores de la plataforma (agencias y captadores comerciales).
- Expansión a 2-3 países de la región (el modelo ya soporta país, moneda por tienda y formatos de teléfono internacional).

### 10.4 Motores de adquisición ya incluidos en el producto

- **QR y afiche**: cada tienda tiene un afiche imprimible con su QR; es un bucle de captación viral.
- **WhatsApp como canal viral**: cada pedido es una conversación que puede terminar en el marketplace.
- **Marketplace**: tráfico entrante orgánico a todas las tiendas a la vez.

---

## 11. Métricas y KPIs

### 11.1 North Star Metric

**Tiendas con al menos un pedido confirmado en los últimos 30 días.**

Mide a la vez activación (la tienda se usó) y retención (el comercio vuelve a usarla).

### 11.2 Embudo

Datos verificados directamente contra la base de datos de producción:

| Etapa | Métrica | Referencia actual |
|---|---|---|
| Registro | Cuentas creadas | 4 usuarios |
| Activación | Tiendas creadas | 3 tiendas |
| Publicación | Tiendas publicadas en el marketplace | 3 de 3 |
| Catálogo | Tiendas con ≥ 5 productos | 2 de 3 |
| **Primer pedido** | Tiendas con ≥ 1 pedido | 2 de 3 |
| **Pedidos acumulados** | Total de pedidos | 5 pedidos / 8 líneas |
| Conversión a PRO | % de tiendas PRO | 2 de 3 |
| Ingreso | MRR potencial | 40.000 COP (2 PRO) |

> Nota: la base es aún muy pequeña — 5 pedidos en 3 tiendas, sin una sola venta recurrente. Sirve para demostrar que el flujo funciona de extremo a extremo, no como señal de tracción. El primer objetivo de datos es llegar a 30 comercios activos con al menos un pedido al mes.

### 11.3 Métricas de producto ya instrumentadas

- `Store.viewCount`: visitas a la tienda, incrementadas por `POST /stores/:id/view`.
- `Store.orderCount`: usado para ordenar el ranking del marketplace, **pero hoy no se incrementa al crear pedidos** (ver R11).
- `Order.status`: pedidos pendientes, confirmados, completados y cancelados.
- `Order.total` y `Order.completedAt`: ventas por día (base del gráfico del panel).
- `AdminLog`: trazabilidad de la actividad de los administradores.

### 11.4 Métricas que faltan (a instrumentar)

- Visits al marketplace vs. pedidos generados (embudo del marketplace).
- Conversión checkout→pedido en la tienda.
- Retención mensual de comercios.
- Ticket promedio y tasa de recompra.

---

## 12. Hoja de ruta

### 12.1 Trimestre 1 — Cerrar el círculo comercial

| # | Entregable | Por qué |
|---|---|---|
| 1 | **Pasarela de pagos para la suscripción** (Wompi/Mercado Pago) | Sin cobro automático no hay MRR automático |
| 2 | Checkout del marketplace **con botón de pago online** opcional | Cierra el circuito de la comisión |
| 3 | Límites de plan más explícitos (pedidos, banners, tamaño de catálogo) | Da valor tangible a PRO |
| 4 | Event tracking y embudo | Sin datos no se puede decidir |
| 5 | Onboarding guiado (wizard de 5 pasos) | Reduce el abandono del alta |
| 6 | Mostrar el teléfono del cliente en el panel (ver R10) | Sin él, el comercio no puede cerrar la venta por su cuenta |

### 12.2 Trimestre 2 — Escala del multi-tenant

| # | Entregable | Por qué |
|---|---|---|
| 7 | **Dominio o subdominio propio por tienda** | hoy todas viven en la raíz del dominio; es la primera objeción comercial |
| 8 | Equipo por tienda con roles (propietario, editor, cajero) | Habilita vender a negocios con personal |
| 9 | Cupones y códigos de descuento | Motor de repetición |
| 10 | Exportación del catálogo a CSV/Excel y sincronización | El comerciante ya trabaja en Sheets |
| 11 | Programa de referidos | Crecimiento a costo marginal cero |

### 12.3 Trimestre 3-4 — Diferenciación

| # | Entregable | Por qué |
|---|---|---|
| 12 | Reseñas y calificación de tienda | Señal de confianza en el marketplace |
| 13 | Analítica avanzada (embudo, cohortes, productos estrella) | Retención del comerciante |
| 14 | Integración con Instagram/Facebook Shops | Canal de entrada |
| 15 | App móvil nativa o PWA | Presencia en el móvil |
| 16 | Marketplace de servicios B2B (imprenta, empaque, foto) | Ingreso no recurrente y lock-in |
| 17 | Cobertura de tests automatizados (API + checkout) | Escalabilidad del equipo |

---

## 13. Riesgos y mitigaciones

| # | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| R1 | **Sin pasarela de pagos**: el comerciante tiene que cerrar la venta por WhatsApp y la tasa de conversión se pierde | Alto | Prioridad 1 del roadmap: botón de pago opcional en el checkout |
| R2 | **Dependencia de una sola URL base**: todas las tiendas en la raíz del dominio | Medio | Dominios/subdominios por tienda (trimestre 2) |
| R3 | **Mercado copycat**: el modelo es replicable | Alto | Defenderse con marketplace, la comunidad y los datos de red |
| R4 | **WhatsApp cambia sus políticas o el modelo de deep links** | Alto | El link `wa.me` es estable; a medio plazo, la API oficial de WhatsApp Business |
| R5 | **Cobertura de tests casi nula** | Medio | Test del checkout y de los servicios de pedidos antes de tocar monetización |
| R6 | **CORS permisivo (`origin: '*'`) y sin rate limiting** | Alto (seguridad) | Restringir CORS al dominio del panel; añadir throttle en los endpoints públicos de escritura |
| R7 | **Sin analytics**: no se sabe por qué el comerciante se va | Medio | Instrumentar el embudo (trimestre 1) |
| R8 | **Dependencia del fundador** en la venta y el soporte | Medio | Automatizar onboarding y soporte; documentar (este PRD es el primer paso) |
| R9 | **Mercado pequeño**: los comercios de barrio tienen poco presupuesto | Medio | 20.000 COP/mes es bajo; el costo de cambio es alto si ya usa la tienda |
| R10 | **El teléfono del cliente se guarda hasheado (SHA-256), no cifrado**: el panel no puede mostrarlo ni usarlo para llamar al cliente | Alto (operación) | Cifrado reversible con AES-256-GCM (el mismo patrón ya usado para el WhatsApp del comercio) + botón "Llamar" en el detalle del pedido |
| R11 | **`Store.orderCount` no se incrementa** al crear pedidos: el marketplace muestra "0 pedidos" y el ranking por pedidos no funciona | Medio | Incrementar el contador dentro de la transacción de creación de pedido |
| R12 | **Un solo dueño por tienda** limita el caso de uso de negocio | Medio | Roles de equipo (trimestre 2) |
| R13 | **La clave de cifrado tiene un valor por defecto hardcodeado** en `encryption.util.ts`: si `DATABASE_ENCRYPTION_KEY` no está definida en el entorno, se usa un placeholder conocido | Alto (seguridad) | Bloquear el arranque si falta la variable; definir la clave como secreto en el despliegue y rotar los datos cifrados actuales |

---

## 14. Requisitos no funcionales

| Categoría | Requisito | Estado |
|---|---|---|
| Rendimiento | Tienda pública renderizada en servidor (SSR), cacheada en CDN | Cumple (`revalidate` 300 s en el layout de tienda) |
| Rendimiento | Marketplace con paginación en servidor (no descarga el catálogo completo) | Cumple |
| Escalabilidad | Caché Redis en los endpoints de lectura caliente (productos, tiendas, banners, categorías, pedidos) | Cumple |
| Resiliencia | `withRetry()` en todas las consultas Prisma | Cumple |
| Seguridad | JWT + guards de Nest + verificación de `ownership` en cada mutación | Cumple |
| Seguridad | Validación estricta de DTOs y saneo de entrada | Cumple |
| Seguridad | Número de WhatsApp del comercio cifrado en base de datos (AES-256-GCM) | Cumple |
| Seguridad | **Clave de cifrado gestionada como secreto, sin valor por defecto** | **Pendiente (R13)** |
| Seguridad | **CORS restringido y rate limiting en endpoints públicos** | **Pendiente (R6)** |
| Mantenibilidad | Monorepo con tipos compartidos, ESLint y Prettier configurados, typecheck por app | Cumple |
| Mantenibilidad | **Cobertura de tests automatizados** | **Débil (R5)** |
| Operabilidad | Despliegue continuo desde `main` con Docker Compose y Nginx | Cumple |
| Operabilidad | Migraciones de base de datos idempotentes y verificadas | Cumple |
| Accesibilidad | Navegación por teclado, roles ARIA, foco visible, diseño responsive móvil-first | Parcial |
| i18n | **Multi-idioma** | No existe (actualmente español; el modelo ya soporta país y moneda por tienda) |

---

## 15. Competitive

| Alternativa | Fortaleza | Debilidad frente a ShopyLink |
|---|---|---|
| **WhatsApp directo + fotos** | Cero fricción, cero costo | No hay carrito, ni stock, ni catálogo, ni analítica |
| **Instagram / Facebook Shops** | Audiencia ya existente | No hay panel de pedidos ni inventario; dependencia de la plataforma |
| **Tiendanube / Shopify** | E-commerce completo, pagos, logística | Caro, curva de aprendizaje alta, orientado a volumen; no terminan en WhatsApp |
| **Catálogos de enlaces** (Linktree, Shoplinks) | Muy fácil de montar | Un solo enlace, sin stock, sin pedidos, sin marketplace |
| **Marketplace local propio** | Descubrimiento | Cada tienda tiene que construir su audiencia |
| **ShopyLink** | Catálogo + WhatsApp + marketplace, en un panel, 20k COP/mes | Sin pagos online todavía, sin analítica avanzada, sin multi-empleado |

**El argumento de venta en una frase:** *"ShopyLink es lo que hay entre un Instagram y una tienda de e-commerce: un catálogo de verdad que cierra por WhatsApp, y además te pone en el marketplace de la ciudad."*

---

## 16. Glosario

| Término | Significado |
|---|---|
| **Store** | Tienda de un comerciante (`Store` en Prisma) |
| **Item / Product** | Entrada del catálogo: producto físico o servicio (`Product` con `itemType`) |
| **Variant** | Variante de un producto (talla, color), con precio y stock propios o heredados |
| **Pricing mode** | Semántica del precio de un servicio: `fixed`, `from`, `hourly`, `quote` |
| **Marketplace** | Catálogo público agregado de todas las tiendas publicadas |
| **Carrito global** | Carrito persistente en `localStorage` compartido entre marketplace y tiendas |
| **Pedido** | `Order`: una venta registrada, con estado y líneas (`OrderItem`) |
| **Banner** | Pieza promocional configurable en 3 posiciones activas de la tienda pública |
| **Afiche QR** | Imagen 1080×1350 con el logo, el QR y el CTA, descargable en PNG |
| **Plan FREE / PRO** | Nivel de suscripción del comercio (10 productos / ilimitados) |

---

## 17. Anexos — Evidencia técnica

**Repositorio:** `github.com/AndrewLicona/ShopyLink` · **Producción:** `shopylinks.shop` · **Licencia:** MIT

| Componente | Ubicación |
|---|---|
| Schema y migraciones | `packages/database/prisma/schema.prisma` |
| API NestJS | `apps/api/src/features/{stores,products,orders,categories,banners,broadcasts}` |
| Frontend | `apps/web/src/app/{dashboard,marketplace,[slug],admin}` |
| Carrito global | `apps/web/src/contexts/CartContext.tsx` |
| Cliente HTTP | `apps/web/src/services/api.ts` |
| Lógica de precios y stock | `apps/web/src/lib/pricing.ts` |
| Generación de PDF | `apps/web/src/services/pdf.service.ts` |
| Afiche QR | `apps/web/src/lib/poster.ts` |
| Cifrado AES-256-GCM | `apps/api/src/core/common/encryption.util.ts` |
| Despliegue | `docker-compose.yml`, `nginx/`, `apps/*/Dockerfile` |
| Documentación previa | `Plan.md` (especificación original), `README.md` |
