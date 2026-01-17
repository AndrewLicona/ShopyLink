Perfecto. Entonces dejamos **FUERA por ahora planes, límites y monetización**.
Primero: **ordenar la casa** para que **sea mantenible y estable**.
Luego, sobre eso, **agregar features sin dolor**.

Voy a darte **un plan de reestructuración puro**, empezando por **FRONTEND → luego BACKEND**, con reglas claras para el agente.

---

# 🧭 PLAN PRINCIPAL – REESTRUCTURACIÓN (SIN FEATURES NUEVAS)

## 🎯 Objetivo

* Eliminar código repetido
* Reducir tamaño de archivos
* Separar responsabilidades
* Evitar errores SSR / digest
* Hacer el proyecto fácil de mantener y de trabajar con agentes

---

# 🧩 PARTE 1 – FRONTEND (PRIORIDAD)

## 🔹 Principios del frontend (REGLAS)

1. **UI ≠ lógica ≠ datos**
2. Ningún componente UI hace `fetch`
3. `fetch` solo vive en `services/`
4. SSR solo para datos mínimos
5. Todo lo que pueda fallar → fallback
6. Componentes pequeños (máx. 150 líneas)
7. Nada de lógica de negocio en `page.tsx`

---

## 🧱 Estructura objetivo (FRONTEND)

```
app/
 ├── (public)/
 │    ├── layout.tsx
 │    └── page.tsx
 ├── (store)/
 │    └── [slug]/
 │         ├── page.tsx
 │         └── loading.tsx
 ├── error.tsx
 └── not-found.tsx

src/
 ├── components/
 │    ├── atoms/
 │    ├── molecules/
 │    └── organisms/
 ├── features/
 │    ├── store/
 │    │    ├── StoreHeader.tsx
 │    │    ├── StoreCategories.tsx
 │    │    └── StoreProducts.tsx
 │    ├── category/
 │    └── product/
 ├── services/
 │    ├── store.service.ts
 │    ├── category.service.ts
 │    └── product.service.ts
 ├── hooks/
 ├── lib/
 └── types/
```

---

## 🧩 FASE F1 – Limpieza inicial (SIN CAMBIAR FUNCIONALIDAD)

### Tareas

* [ ] Identificar componentes >200 líneas
* [ ] Mover `fetch` fuera de componentes
* [ ] Eliminar lógica duplicada
* [ ] Crear `services/` para API calls
* [ ] Tipar respuestas (`types/`)

---

## 🧩 FASE F2 – SSR seguro

### Reglas SSR

* `page.tsx` solo:

  * lee params
  * llama services
  * arma layout
* Nada de loops
* Nada de transformaciones

### Patrón correcto

```ts
let data = null;

try {
  data = await getStore(slug);
} catch {
  return notFound();
}
```

---

## 🧩 FASE F3 – Client vs Server

### Server

* Store info
* SEO
* Metadata

### Client

* Categorías
* Productos
* Listas
* Interacciones

Usar:

```tsx
<Suspense fallback={<Skeleton />}>
  <CategoriesClient storeId={id} />
</Suspense>
```

---

## 🧩 FASE F4 – Manejo de errores

### Obligatorio

* `app/error.tsx`
* `not-found.tsx`
* Fallback UI

Nunca:

* mostrar stack
* mostrar digest
* romper la página

---

## 🧩 FASE F5 – Estandarización

### Naming

* `*.service.ts` → fetch
* `*.client.tsx` → client component
* `*.server.ts` → server helpers

### Convenciones

* 1 archivo = 1 responsabilidad
* Props tipadas
* Nada hardcodeado

---

# 🧩 PARTE 2 – BACKEND (DESPUÉS)

## 🔹 Principios backend

1. Controllers sin lógica
2. Services con reglas de negocio
3. Repositories con Prisma
4. DTOs obligatorios
5. Errores de dominio

---

## 🧱 Estructura objetivo (BACKEND)

```
src/
 ├── modules/
 │    ├── stores/
 │    ├── categories/
 │    ├── products/
 │    ├── inventory/
 │    └── users/
 ├── shared/
 │    ├── prisma/
 │    ├── errors/
 │    ├── filters/
 │    └── utils/
```

---

## 🧩 FASE B1 – Infraestructura

* [ ] Prisma singleton
* [ ] Conexión directa Supabase
* [ ] Logger
* [ ] Exception Filter limpio

---

## 🧩 FASE B2 – Separación real

* [ ] Crear repositories
* [ ] Mover Prisma fuera de services
* [ ] DTOs + validation
* [ ] Eliminar duplicación

---

## 🧩 FASE B3 – Endpoints estables

* [ ] Responses estandarizadas
* [ ] Errores claros
* [ ] Nada de leaks técnicos

---

# 🧠 ORDEN DE EJECUCIÓN (CLAVE)

1. Frontend F1 → F5
2. Verificar que TODO funciona igual
3. Backend B1 → B3
4. Verificar estabilidad
5. **Luego recién agregar planes, límites y features**

---

## ✅ Resultado esperado

* Código limpio
* SSR estable
* Menos bugs
* Menos estrés
* Agentes productivos
* Base lista para monetización

---