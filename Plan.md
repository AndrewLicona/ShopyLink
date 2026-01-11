# 🛒 Proyecto: ShopyLink  
## Plataforma Multi-Tienda con Checkout por WhatsApp (Monorepo)

Actúa como **arquitecto de software y desarrollador full-stack senior**.
Diseña y construye **ShopyLink**, una plataforma **multi-tienda** que permite crear tiendas online simples, compartirlas por link y cerrar ventas vía **WhatsApp**, con control de inventario, pedidos y panel de administración.

El proyecto debe construirse en un **MONOREPO** bien organizado y escalable.

---

## 🎯 Objetivo del Producto

Permitir que cualquier persona:
- Cree su tienda online
- Agregue productos con categorías y descuentos
- Comparta su tienda por link
- Permita a clientes armar un carrito
- Finalice pedidos vía WhatsApp
- Gestione inventario y pedidos desde un panel

Sin pasarela de pagos en el MVP.

---

## 🧱 Stack Obligatorio

### Monorepo
- **Turborepo** o **Nx**
- Gestión de dependencias centralizada

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Diseño **RESPONSIVE** (móvil, tablet, desktop)
- PWA (opcional)
- Zustand (Manejo de estado global/carrito)

### Backend
- NestJS
- TypeScript
- Prisma ORM
- REST API

### Infraestructura
- Supabase
  - PostgreSQL
  - Auth
  - Storage
- Prisma conectado a la DB de Supabase

---

## 📁 Estructura del Monorepo
```
shopylink/
├─ apps/
│ ├─ web/ # Frontend público + dashboard
│ └─ api/ # Backend NestJS
├─ packages/
│ ├─ ui/ # Componentes UI compartidos
│ ├─ database/ # Prisma Client y Schema compartido
│ ├─ config/ # ESLint, TSConfig, Tailwind
│ └─ types/ # Tipos compartidos
├─ turbo.json
└─ package.json
```

---

## 📐 Principios Clave

- Arquitectura limpia
- Modularidad por dominio
- Nada de lógica de negocio en el frontend
- Diseño responsive real
- Código tipado y mantenible

---

## 📦 FASE 1 — Setup del Monorepo

- Configurar Turborepo / Nx
- Configurar TypeScript global
- Configurar ESLint y Prettier
- Configurar Tailwind compartido
- Variables de entorno

---

## 🧩 FASE 2 — Modelo de Datos y Prisma

Definir entidades:
- User
- Store
- Category
- Product
- Inventory
- Order
- OrderItem

Soporte para:
- Multi-tienda
- Categorías por tienda
- Descuentos simples por producto
- Stock reservado
- Historial de precios

---

## ⚙️ FASE 3 — Backend (NestJS)

### Módulos
- Auth
- Stores
- Categories
- Products
- Inventory
- Orders

### Funcionalidades
- Autenticación con Supabase JWT (Passport Strategy)
- Roles (OWNER / CUSTOMER)
- CRUD completo
- Transacciones Prisma
- Validaciones

---

## 🛒 FASE 4 — Pedidos e Inventario

### Flujo
1. Crear pedido (`PENDING`)
2. Reservar stock
3. Generar link WhatsApp
4. Confirmar / cancelar pedido

### Estados
- PENDING
- CONFIRMED
- CANCELLED
- EXPIRED

---

## 📲 FASE 5 — Integración WhatsApp

- Generar mensaje dinámico
- Incluir ID del pedido
- Redirección segura
- No depender de APIs externas

---

## 🔍 FASE 6 — Buscador, Categorías y Descuentos

- Buscador por nombre
- Filtro por categoría
- Descuentos simples (`discount_price`)
- Precios finales persistidos en pedidos

---

## 🎨 FASE 7 — Frontend (Next.js)

### Público
- Página de tienda por slug
- Grid de productos responsive
- Carrito persistente
- Checkout WhatsApp

### Panel
- Dashboard
- Gestión de productos
- Gestión de pedidos
- Gestión de inventario

---

## 🔐 FASE 8 — Seguridad y Calidad

- Validaciones backend
- Rate limiting
- Manejo de errores
- Logs básicos
- CORS

---

## 🚀 FASE 9 — MVP y Roadmap

### MVP
- Multi-tienda
- Carrito
- WhatsApp checkout
- Inventario funcional
- Panel básico

### Futuro
- Promociones avanzadas
- Cupones
- Pagos online
- App móvil
- Dominio personalizado

---

## 📌 Reglas del Proyecto

- Código limpio y documentado
- Monorepo ordenado
- Escalable desde el MVP
- UX clara y directa
- Decisiones justificadas

Entregar documentación mínima y ejemplos claros.