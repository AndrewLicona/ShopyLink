# ShopyLink 🛍️

**ShopyLink** es una plataforma SaaS moderna que permite a emprendedores y negocios crear y gestionar tiendas en línea de manera rápida y sencilla. Con un enfoque en la simplicidad y la experiencia del usuario, ShopyLink facilita la venta de productos a través de un enlace único, integrando WhatsApp como canal principal de pedidos.

## 🌟 Características Principales

- **🏪 Gestión de Tiendas**: Crea y personaliza tu tienda con nombre, slug único y branding personalizado
- **📦 Catálogo de Productos**: Administra productos con imágenes, variantes (tallas, colores), precios y stock
- **🔄 Sistema de Variantes Inteligente**: 
  - Control de precio por variante (Global, Propio, o Consultar precio)
  - Gestión de stock independiente (Global, Propio, o Sin límite)
  - Soporte para productos sin seguimiento de inventario
- **💬 Integración con WhatsApp**: Los pedidos se envían directamente a WhatsApp con información detallada
- **📊 Dashboard Completo**: Panel de control con estadísticas, gestión de pedidos y configuración
- **🎨 Diseño Premium**: Interfaz moderna con glassmorphism, animaciones y temas optimizados
- **📱 100% Responsive**: Experiencia optimizada para móvil, tablet y escritorio
- **🔒 Autenticación Segura**: Sistema de autenticación con Supabase
- **🏷️ Sistema de Categorías**: Organiza tus productos por categorías personalizadas
- **🔍 Búsqueda y Filtros**: Encuentra productos rápidamente con búsqueda en tiempo real
- **💰 Ofertas y Descuentos**: Sistema de precios promocionales con badges visuales

## 🛠️ Stack Tecnológico

### Frontend
- **[Next.js 15](https://nextjs.org/)** - Framework React con App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling con variables CSS personalizadas
- **[Lucide Icons](https://lucide.dev/)** - Iconos modernos
- **[React Hooks Custom](https://react.dev/)** - Estado y lógica reutilizable

### Backend
- **[NestJS](https://nestjs.com/)** - Framework Node.js escalable y modular
- **[Prisma](https://www.prisma.io/)** - ORM type-safe para PostgreSQL
- **[PostgreSQL](https://www.postgresql.org/)** - Base de datos relacional
- **[Supabase](https://supabase.com/)** - Backend as a Service (Auth, Storage, DB)
- **[JWT](https://jwt.io/)** - Autenticación basada en tokens
- **[Class Validator](https://github.com/typestack/class-validator)** - Validación de DTOs

### Infraestructura
- **[Turborepo](https://turbo.build/repo)** - Monorepo con caché inteligente
- **[Docker](https://www.docker.com/)** - Containerización
- **[Vercel](https://vercel.com/)** - Deployment del frontend
- **[Railway/Render](https://railway.app/)** - Deployment del backend

## 📁 Estructura del Proyecto

```
ShopyLink/
├── apps/
│   ├── web/                    # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── features/      # Componentes por feature
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── services/      # API clients
│   │   │   ├── types/         # TypeScript types
│   │   │   └── lib/           # Utilidades
│   │   └── public/            # Assets estáticos
│   │
│   └── api/                    # Backend NestJS
│       ├── src/
│       │   ├── core/          # Auth, Prisma, Common
│       │   ├── features/      # Módulos por feature
│       │   │   ├── stores/
│       │   │   ├── products/
│       │   │   ├── orders/
│       │   │   └── categories/
│       │   └── all-exceptions.filter.ts
│       └── prisma/            # Schema y migraciones
│
└── packages/
    ├── database/              # Paquete compartido de Prisma
    │   └── prisma/
    │       └── schema.prisma  # Definición del schema
    ├── eslint-config/         # Configuración ESLint
    └── typescript-config/     # Configuración TypeScript
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js 18+** y **npm 9+**
- **PostgreSQL 14+** (o cuenta de Supabase)
- **Git**

### 1. Clonar el repositorio

```bash
git clone https://github.com/AndrewLicona/ShopyLink.git
cd ShopyLink
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shopylink?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# API
API_URL="http://localhost:4000"
NEXT_PUBLIC_API_URL="http://localhost:4000"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Encryption (para datos sensibles)
ENCRYPTION_KEY="your-32-char-encryption-key"
```

### 4. Ejecutar migraciones de Prisma

```bash
cd packages/database
npx prisma generate
npx prisma migrate dev
```

### 5. Iniciar el proyecto en desarrollo

```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará:
- **Frontend** en [http://localhost:3000](http://localhost:3000)
- **Backend** en [http://localhost:4000](http://localhost:4000)

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev                    # Inicia frontend y backend
npm run dev --filter=web       # Solo frontend
npm run dev --filter=api       # Solo backend

# Build
npm run build                  # Build de todos los proyectos
npm run build --filter=web     # Build solo del frontend

# Lint
npm run lint                   # Ejecuta ESLint en todo el monorepo

# Database
cd packages/database
npx prisma studio              # Abre Prisma Studio
npx prisma migrate dev         # Crea y aplica migraciones
npx prisma generate            # Genera el cliente de Prisma
```

## 🐳 Deployment con Docker

### Desarrollo local con Docker Compose

```bash
docker compose up -d
```

### Rebuild completo

```bash
docker compose down
docker compose build --no-cache
docker compose --env-file .env up -d
```

### Actualizar desde main

```bash
git pull origin main
docker compose down
docker compose build --no-cache
docker compose --env-file .env up -d
```

## 🗄️ Modelo de Datos

### Entidades Principales

- **User**: Usuarios del sistema
- **Store**: Tiendas de los usuarios
- **Product**: Productos con precio base y stock global
- **ProductVariant**: Variantes con precio/stock independiente o heredado
- **Category**: Categorías para organizar productos
- **Order**: Pedidos generados desde la tienda pública
- **OrderItem**: Items individuales de cada pedido

### Características del Modelo

- **Stock a nivel de variante**: Cada variante puede tener control independiente
- **Precios flexibles**: Global, propio, o "consultar precio"
- **Soft deletes**: Los registros no se eliminan físicamente
- **Timestamps automáticos**: `createdAt` y `updatedAt` en todas las tablas
- **Relaciones en cascada**: Eliminación de datos relacionados

## 🎨 Características de UX/UI

- **Tema Dinámico**: Variables CSS para fácil personalización
- **Glassmorphism**: Efectos de vidrio moderno en componentes clave
- **Animaciones Suaves**: Transiciones y micro-interacciones
- **Modal Full-Screen**: Modal de productos adaptable (95vw × 90vh en PC)
- **Segmented Buttons**: Controles intuitivos para variantes
- **Responsive Design**: Grid adaptativo y mobile-first
- **Loading States**: Indicadores de carga en todas las operaciones async

## 🔐 Seguridad

- ✅ Autenticación con JWT y Supabase
- ✅ Validación de DTOs con class-validator
- ✅ Guards de NestJS para rutas protegidas
- ✅ Sanitización de datos de entrada
- ✅ CORS configurado
- ✅ Rate limiting (configurar según necesidad)
- ✅ Encriptación de datos sensibles

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 👨‍💻 Autor

**Andrew Licona**
- GitHub: [@AndrewLicona](https://github.com/AndrewLicona)

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub!