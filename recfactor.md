Aquí tienes un **README / PLAN.md en Markdown**, **listo para copiar**, pensado para **ejecutar el refactor por fases**, **delegable a un agente**, **sin romper producción** y **con reglas estrictas**.

No hay relleno. Es operativo.

---

```md
# 🧱 Plan de Refactor Frontend – Next.js (Seguro y por Fases)

## 🎯 Objetivo
Reestructurar el frontend para:
- Eliminar código repetido
- Reducir tamaño de archivos
- Separar UI, lógica y datos
- Aplicar Atomic / Molecular Architecture
- Facilitar mantenimiento y delegación a agentes
- No romper funcionalidades existentes

---

## 🛑 Reglas Generales (OBLIGATORIAS)

### Arquitectura
- `app/` → SOLO rutas, layouts y loading
- `components/` → UI pura (sin fetch, sin lógica)
- `features/` → lógica de negocio por dominio
- `services/` → comunicación con API / Supabase
- `lib/` → configuración global
- `utils/` → funciones puras
- `types/` → tipos compartidos

### Código
- ❌ No `fetch` en componentes ni `page.tsx`
- ❌ No lógica de negocio en UI
- ❌ No archivos > 150 líneas
- ❌ No duplicar lógica
- ✅ Un archivo = una responsabilidad
- ✅ Tipado estricto
- ✅ Imports absolutos (`@/`)

### Convenciones
- `*.service.ts` → reglas de negocio
- `*.api.ts` → llamadas HTTP
- `*.hooks.ts` → hooks
- `*.types.ts` → tipos del dominio
- `*.constants.ts` → constantes
- `page.tsx` máx. 30 líneas

---

## 📁 Estructura Final Objetivo

```

src/
├── app/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── features/
├── services/
├── hooks/
├── store/
├── lib/
├── utils/
└── types/

````

---

## 🟢 FASE 1 — Preparación (RIESGO: NULO)

### Objetivo
Preparar el terreno sin tocar código existente.

### Tareas
- [ ] Crear carpetas base
```bash
mkdir -p src/{features,services,hooks,store,utils,types}
mkdir -p src/components/{atoms,molecules,organisms,templates}
````

* [ ] Verificar alias `@/` en `tsconfig.json`
* [ ] Confirmar que el proyecto compila sin cambios

---

## 🟡 FASE 2 — Centralizar Servicios (RIESGO: BAJO)

### Objetivo

Eliminar fetchs repetidos y accesos directos a Supabase.

### Subfase 2.1 – Base API

* [ ] Crear `services/api.ts`
* [ ] Centralizar headers, base URL y errores
* [ ] Reemplazar fetchs directos progresivamente

### Subfase 2.2 – Servicios por dominio

* [ ] Crear archivos:

```
services/auth.api.ts
services/products.api.ts
services/orders.api.ts
services/stores.api.ts
```

* [ ] Mover llamadas HTTP desde:

  * `page.tsx`
  * componentes
  * contextos

### Reglas

* ❌ No lógica aquí
* ✅ Solo comunicación externa

---

## 🟠 FASE 3 — Features (RIESGO: MEDIO)

### Objetivo

Mover TODA la lógica de negocio fuera de UI.

### Estructura estándar por feature

```
features/<feature>/
├── <feature>.service.ts
├── <feature>.hooks.ts
├── <feature>.types.ts
└── <feature>.constants.ts
```

### Subfase 3.1 – Crear dominios

* [ ] `features/auth`
* [ ] `features/products`
* [ ] `features/orders`
* [ ] `features/store`
* [ ] `features/settings`

### Subfase 3.2 – Mover lógica

* [ ] Extraer lógica desde `page.tsx`
* [ ] Extraer lógica desde `contexts/`
* [ ] Usar hooks como única interfaz hacia UI

### Reglas

* UI solo usa hooks
* Services solo se usan desde features

---

## 🔵 FASE 4 — Componentes (Atomic Design) (RIESGO: MEDIO)

### Objetivo

Componentes pequeños, reutilizables y sin lógica.

### Subfase 4.1 – Clasificación

* [ ] Mover inputs, botones, iconos → `atoms`
* [ ] Formularios → `molecules`
* [ ] Navbar, Footer → `organisms`
* [ ] Layouts → `templates`

### Subfase 4.2 – Limpieza

* [ ] Eliminar lógica interna
* [ ] Pasar callbacks por props
* [ ] Reducir tamaño de componentes

### Reglas

* ❌ Nada de fetch
* ❌ Nada de estado de negocio
* ✅ Solo props

---

## 🟣 FASE 5 — Limpieza de `app/` (RIESGO: BAJO)

### Objetivo

`app/` como capa de routing, no de lógica.

### Subfase 5.1 – Pages

* [ ] Cada `page.tsx`:

  * importar un componente desde `features`
  * no tener lógica propia

### Subfase 5.2 – Eliminar archivos indebidos

* [ ] Eliminar componentes dentro de `app/`
* [ ] Moverlos a `features` o `components`

---

## 🧹 FASE 6 — Limpieza Final (RIESGO: BAJO)

### Tareas

* [ ] Eliminar código duplicado
* [ ] Unificar tipos en `types/`
* [ ] Revisar imports circulares
* [ ] Verificar build y lint

---

## ✅ Checklist Final

* [ ] No hay fetch fuera de `services`
* [ ] No hay lógica en componentes
* [ ] `page.tsx` es delgado
* [ ] Cada feature es independiente
* [ ] Archivos < 150 líneas
* [ ] Build pasa sin errores

---

## 🤖 Instrucciones para Agentes

* Ejecutar UNA fase a la vez
* No mezclar fases
* No refactorizar estilos sin permiso
* No cambiar comportamiento funcional
* Commits pequeños y claros

---

## 🏁 Resultado Esperado

* Código modular
* Fácil de mantener
* Fácil de testear
* Fácil de delegar
* Escalable sin deuda técnica

```


