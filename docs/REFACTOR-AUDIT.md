# Informe de Auditoría — University Library Monorepo

> **Generado:** 2024-10-19
> **Estado:** Pendiente de ejecución
> **Autor:** Auditoría automatizada (Fase 1-2)

---

## 1. Resumen ejecutivo

El monorepo está bien estructurado para su tamaño: workspaces de pnpm configurados correctamente, Tailwind 4 con tema personalizado, backend con arquitectura en capas y tipos compartidos realmente usados por ambos paquetes. El código no tiene errores de tipado ni de lint. Sin embargo, hay margen de mejora.

### Top 5 problemas más importantes

| #   | Problema                                                                                                                                                                                               | Impacto |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| 1   | **`CatalogPage.tsx` (353 líneas)**: mezcla lógica de URL params, debounce, fetch y renderizado. Es la página más crítica y la más difícil de mantener.                                                 | Alto    |
| 2   | **`AuthPage.tsx` (274 líneas)**: contiene validación, manejo de estado de formulario y lógica de envío en el mismo componente. El formulario podría beneficiarse de React 19 Actions/`useActionState`. | Alto    |
| 3   | **Falta configuración de `strict: true` en frontend**: `tsconfig.app.json` no tiene `strict`, lo que permite errores silenciosos. Backend y shared sí lo tienen.                                       | Alto    |
| 4   | **No existen tests**: ningún archivo `*.test.ts` o `*.spec.ts`. Partes críticas como `LoanService` y `AuthService` carecen de cobertura.                                                               | Alto    |
| 5   | **Scripts raíz incompletos**: falta `typecheck`, `test`, `dev` (concurrente front+back) y no hay CI configurado.                                                                                       | Medio   |

---

## 2. Hallazgos detallados

### 2.1 Frontend: acoplamiento y componentización

| Sev.  | Archivo:línea                                     | Problema                                                                                           | Corrección propuesta                                                                                                                          |
| ----- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Alta  | `pages/CatalogPage.tsx:1-353`                     | 353 líneas con debounce, URL sync, fetch, renderizado y 6 handlers de eventos.                     | Extraer hook `useCatalogSearch` para estado URL + fetch. Extraer `CatalogResultsGrid` y `CatalogEmptyState` como componentes de presentación. |
| Alta  | `pages/AuthPage.tsx:1-274`                        | 274 líneas con validación inline, 3 states de form, servidor, y JSX largo.                         | Refactorizar a `useActionState`. Extraer `AuthFormFields` para inputs reutilizables.                                                          |
| Media | `pages/MyLoansPage.tsx:1-143`                     | Lógica de fetch y tabs en página. El patrón es manejable pero podría extraerse para consistencia.  | Extraer `useMyLoans` hook que encapsule fetch y return handler.                                                                               |
| Media | `pages/BookDetailPage.tsx:1-148`                  | Fetch dentro de página, pero la estructura es aceptable.                                           | Extraer `useBookDetail` hook. Bajo prioridad.                                                                                                 |
| Media | `components/book-detail/BookActionCard.tsx:23-40` | Lógica de fetch (`handleBorrow`) dentro de componente de UI.                                       | Mover `handleBorrow` a un hook `useBorrowBook` o recibirlo como prop.                                                                         |
| Baja  | `components/loans/LoanCard.tsx:18-24`             | `handleReturnClick` mezcla estado local con callback externo. Aceptable pero podría simplificarse. | Sin cambios urgentes.                                                                                                                         |
| Baja  | `components/catalog/CatalogPagination.tsx:38-64`  | Cálculo de números de página inline.                                                               | Extraer a función pura `getPageNumbers(current, total)`.                                                                                      |

#### Código repetido identificado

| Patrón                                                 | Apariciones                                                                                    | Propuesta                                        |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Cover image fallback (placeholder si no hay `coverId`) | `BookCard.tsx:26-37`, `BookHero.tsx:10-21`, `LoanCard.tsx:45-58`, `LoanHistoryTable.tsx:43-56` | Crear `<BookCoverImage coverId title size />`    |
| Formato de fecha (`toLocaleDateString`)                | 5+ lugares                                                                                     | Crear util `formatDate(date, style: 'short'      | 'long')`en`lib/utils.ts` |
| Error alert con icono                                  | `AuthPage.tsx:141-153`, `MyLoansPage.tsx:108-112`, `BookActionCard.tsx:91-95`                  | Crear `<AlertMessage variant="error" message />` |

### 2.2 React 19: criterios específicos

| Sev.  | Archivo:línea                   | Problema                                                                                                                | Corrección propuesta                                                                                  |
| ----- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Baja  | `context/AuthContext.tsx:65-67` | Usa `<AuthContext.Provider>`. En React 19 puede usarse `<AuthContext>` directamente.                                    | Cambiar a `<AuthContext value={...}>`. Cambio trivial.                                                |
| Media | `pages/AuthPage.tsx:58-88`      | Formulario con `useState` + `handleSubmit` manual. React 19 tiene `useActionState` para esto.                           | Refactorizar a `useActionState` para login/register, simplificando manejo de errores y pending state. |
| —     | N/A                             | No hay `forwardRef` innecesario. ✓                                                                                      | —                                                                                                     |
| —     | N/A                             | No hay `useMemo`/`useCallback` innecesario (tampoco React Compiler). ✓                                                  | —                                                                                                     |
| Baja  | `pages/CatalogPage.tsx:30-36`   | Estado derivado (`prevQueryParam` vs `queryParam`) para sincronizar input. Funcional pero podría usar `key` para reset. | Considerar `key={queryParam}` en input o dejar como está.                                             |

### 2.3 Tailwind

| Sev. | Archivo:línea                        | Problema                                                           | Corrección propuesta                                              |
| ---- | ------------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Baja | `AppLayout.tsx:11,42,47`             | `max-w-[1200px]` repetido 3 veces (valor arbitrario).              | Definir `--container-max` en tema o usar `max-w-7xl` (1280px).    |
| Baja | `BookCard.tsx:42`, `CopyPips.tsx:40` | `text-[10px]`, `text-[11px]` no son tokens del tema.               | Usar `text-[0.625rem]` o añadir tamaño en tema como `--text-2xs`. |
| Info | `badge.tsx:7`                        | `focus-visible:ring-[3px]`: ok, no hay token predefinido para 3px. | Aceptable.                                                        |
| ✓    | `index.css:3-39`                     | Tema bien definido con tokens personalizados.                      | Ninguna.                                                          |
| ✓    | `button.tsx`, `badge.tsx`            | Ya usan `cva` correctamente.                                       | Ninguna.                                                          |

### 2.4 Carpeta `shared` y tipos compartidos

| Sev.  | Archivo:línea                                                         | Problema                                                                                          | Corrección propuesta                                                                                                      |
| ----- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| ✓     | `shared/src/index.ts`                                                 | Exporta DTOs, enums y `ApiError`. Frontend y backend los importan.                                | Ninguna.                                                                                                                  |
| Baja  | `shared/src/index.ts:26-30`                                           | `ReadingStatus` enum definido pero no usado en frontend ni backend (feature futura según schema). | **Mantener** (decisión del propietario).                                                                                  |
| Media | Backend valida con Zod, pero los schemas no se exportan desde shared. | Frontend valida manualmente (`AuthPage:30-55`). Duplicación de reglas.                            | Mover schemas de validación (register, login) a `shared` como Zod schemas. Frontend importa y deriva tipos con `z.infer`. |
| ✓     | `shared/tsconfig.json`                                                | `strict: true`, builds correctamente.                                                             | Ninguna.                                                                                                                  |
| ✓     | `shared` no tiene deps de React ni Express.                           | Ninguna.                                                                                          |

### 2.5 TypeScript (tipado estricto)

| Sev.  | Archivo:línea                                                                     | Problema                                                       | Corrección propuesta                                                  |
| ----- | --------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------- |
| Alta  | `frontend/tsconfig.app.json`                                                      | Falta `strict: true`. Solo tiene flags de lint parciales.      | Añadir `"strict": true`. Puede revelar errores ocultos.               |
| Media | `frontend/tsconfig.json:3`                                                        | `baseUrl` deprecado en TS 7. Actualmente solo warning.         | Migrar a paths relativos o `ignoreDeprecations: "6.0"` temporalmente. |
| Baja  | `backend/lib/jwt.ts:22`                                                           | `as TokenPayload` cast forzado. Inevitable con `jsonwebtoken`. | Aceptable dado que `jwt.verify` no tiene genéricos precisos.          |
| ✓     | Sin `any`, `@ts-ignore`, `@ts-expect-error`.                                      | Excelente.                                                     | Ninguna.                                                              |
| ✓     | `import type` usado consistentemente.                                             | Ninguna.                                                       |
| Media | Backend y frontend usan versiones distintas de TypeScript (`~6.0.2` vs `^5.7.3`). | Alinear a una versión única en raíz o ambos paquetes.          |

### 2.6 Backend (Express)

| Sev.  | Archivo:línea                  | Problema                                                                                                                                | Corrección propuesta                                                        |
| ----- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| ✓     | Arquitectura                   | rutas → controladores → servicios → prisma. Correcta.                                                                                   | Ninguna.                                                                    |
| ✓     | Validación                     | Zod en todos los endpoints (auth, books, loans).                                                                                        | Ninguna.                                                                    |
| ✓     | `app.ts:55-66`                 | Middleware de errores centralizado.                                                                                                     | Ninguna.                                                                    |
| ✓     | `app.ts:19`                    | `helmet()` usado.                                                                                                                       | Ninguna.                                                                    |
| Media | `app.ts:27`                    | CORS permite cualquier origin en dev (`callback(null, true)` fallback). En prod podría ser un riesgo si no se configura `FRONTEND_URL`. | Hacer fallback más restrictivo o loggear warning.                           |
| Baja  | `index.ts:7-8`                 | No hay graceful shutdown ni health check de DB.                                                                                         | Añadir `process.on('SIGTERM', ...)` y verificar conexión a DB en `/health`. |
| Baja  | Sin rate limiting configurado. | **No añadir** (decisión del propietario).                                                                                               |
| ✓     | `lib/jwt.ts:3`                 | Secret default en dev, pero variable de entorno usada.                                                                                  | Ok para dev.                                                                |
| Media | `lib/prisma.ts:22`             | Logging de todas las queries (`log: ['query', ...]`). Excesivo para dev normal.                                                         | Configurar condicionalmente o reducir a `['warn', 'error']`.                |

### 2.7 Estado general del monorepo

| Sev.  | Área                | Problema                                                                                                        | Corrección propuesta                                                                           |
| ----- | ------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Alta  | Tests               | 0 archivos de test.                                                                                             | **Fuera del alcance de este refactor.**                                                        |
| Alta  | Scripts raíz        | No hay `typecheck`, `test`, ni `dev` concurrente.                                                               | Añadir scripts: `"dev": "pnpm -r --parallel dev"`, `"typecheck": "pnpm -r exec tsc --noEmit"`. |
| Media | CI                  | No existe `.github/workflows`.                                                                                  | Crear workflow básico: install, build, typecheck, lint.                                        |
| Media | `.env.example`      | No existe. Solo `.env` (gitignored).                                                                            | Crear `.env.example` con variables documentadas.                                               |
| Media | TS versions         | Frontend: `~6.0.2`, Backend: `^5.7.3`, Shared: `^5.0.0`.                                                        | Unificar versión en root `package.json` como `devDependency` compartida.                       |
| Baja  | `cn` dependency     | Frontend usa paquete `cn` (línea `frontend/package.json:19`) que es un wrapper trivial de clsx. Ya tiene `cva`. | **Eliminar `cn` y usar `clsx` directamente** (ya viene con `cva`).                             |
| ✓     | Límites de paquetes | Frontend no importa backend ni viceversa. Solo shared.                                                          | Correcto.                                                                                      |
| ✓     | ESLint              | Configurado con flat config, TypeScript y React Hooks.                                                          | Ninguna.                                                                                       |
| Baja  | Prettier            | No hay config de Prettier.                                                                                      | **Añadir `.prettierrc` y plugin de Tailwind** para orden de clases.                            |

---

## 3. Plan de componentización

### 3.1 `CatalogPage.tsx` (353 → ~80 líneas)

```
CatalogPage (page)
├── useCatalogSearch() ← hook nuevo (~120 líneas)
│   ├── maneja URLSearchParams
│   ├── debounce de query
│   ├── fetch con AbortController
│   └── retorna: state, handlers
│
├── CatalogHeader (presentación)
│   ├── título + descripción
│   └── CatalogSearchForm (existente)
│
├── CatalogResultsSection (contenedor ligero)
│   ├── CatalogToolbar (existente)
│   ├── CatalogResultsGrid (nuevo) ← grid de BookCards
│   ├── CatalogEmptyState (nuevo) ← "no results"
│   ├── CatalogErrorState (nuevo) ← error + retry
│   └── CatalogPagination (existente)
```

**Props del hook `useCatalogSearch`:**

```ts
interface UseCatalogSearchReturn {
  // State
  inputQuery: string;
  results: WorkDTO[];
  numFound: number;
  isSearching: boolean;
  searchError: string | null;
  authorSortScope?: 'exact' | 'page';
  // Derived
  displayedResults: WorkDTO[];
  totalPages: number;
  hasSearched: boolean;
  // Params
  queryParam: string;
  fieldParam: string;
  subjectParam: string;
  sortParam: string;
  pageParam: number;
  hideUnavailable: boolean;
  // Handlers
  updateSearchQuery: (query: string) => void;
  handleSubmit: (e: FormEvent) => void;
  handleClearQuery: () => void;
  handleFieldChange: (field: string) => void;
  handleCategorySelect: (id: string) => void;
  handleSortChange: (sort: string) => void;
  handleToggleHideUnavailable: () => void;
  handlePageChange: (page: number) => void;
  retry: () => void;
}
```

### 3.2 `AuthPage.tsx` (274 → ~100 líneas)

```
AuthPage (page)
├── useActionState para login/register
│   ├── validación con schemas de shared
│   ├── submit async
│   └── manejo de errores automático
│
├── AuthCard (presentación)
│   ├── AuthHeader
│   ├── AuthModeSwitcher
│   ├── AuthAlertMessage (genérico)
│   └── AuthFormFields (inputs + labels)
```

**Implementación con React 19 `useActionState`:**

```ts
async function loginAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await login(parsed.data);
    return { success: true };
  } catch (err) {
    return { serverError: getErrorMessage(err) };
  }
}

// En el componente:
const [state, formAction, isPending] = useActionState(
  loginAction,
  initialState
);
```

### 3.3 Componente reutilizable: `BookCoverImage`

```tsx
interface BookCoverImageProps {
  coverId?: number;
  title: string;
  size: 'sm' | 'md' | 'lg'; // S (40x56), M (64x96), L (280x420)
  className?: string;
}
```

Reemplaza el patrón repetido en 4 componentes.

---

## 4. Plan de migración de tipos a `shared`

| Acción        | Origen                                    | Destino                      | Notas                                                                |
| ------------- | ----------------------------------------- | ---------------------------- | -------------------------------------------------------------------- |
| **Mover**     | `AuthController.ts:7-22` (registerSchema) | `shared/src/schemas/auth.ts` | Exportar como `registerSchema` + `type RegisterInput = z.infer<...>` |
| **Mover**     | `AuthController.ts:24-32` (loginSchema)   | `shared/src/schemas/auth.ts` | Idem                                                                 |
| **Eliminar**  | `AuthPage.tsx:30-55` validación manual    | —                            | Usar schema importado de shared                                      |
| **Conservar** | Todo lo demás en `shared/src/index.ts`    | —                            | Ya está bien ubicado                                                 |
| **Conservar** | `ReadingStatus` enum                      | —                            | Feature futura                                                       |

**Estructura propuesta para `shared/src`:**

```
shared/src/
├── index.ts (re-exporta todo)
├── dto.ts (DTOs actuales)
├── enums.ts (ErrorCode, ReadingStatus, LoanStatus)
└── schemas/
    └── auth.ts (Zod schemas)
```

**Nota:** Mover schemas requiere añadir `zod` como dependencia de `shared`.

---

## 5. Orden de ejecución

Pasos pequeños, de menor a mayor riesgo. Cada paso debe verificarse antes de continuar.

| Paso | Descripción                                                            | Verificación                          |
| ---- | ---------------------------------------------------------------------- | ------------------------------------- |
| 1    | Añadir `strict: true` a `frontend/tsconfig.app.json`                   | `pnpm --filter frontend tsc --noEmit` |
| 2    | Crear `.env.example` en raíz                                           | Visual                                |
| 3    | Añadir scripts `typecheck`, `dev` a `package.json` raíz                | `pnpm typecheck`                      |
| 4    | Unificar versión de TypeScript en los 3 paquetes                       | `pnpm install && pnpm typecheck`      |
| 5    | Configurar Prettier con plugin de Tailwind                             | `pnpm format` funciona                |
| 6    | Eliminar dependencia `cn`, usar `clsx` de `cva`                        | `pnpm install && pnpm lint`           |
| 7    | Crear `lib/utils.ts#formatDate()`                                      | Lint + typecheck                      |
| 8    | Crear `components/ui/BookCoverImage.tsx`                               | Visual                                |
| 9    | Reemplazar cover fallbacks en 4 componentes por `BookCoverImage`       | Visual                                |
| 10   | Extraer `useCatalogSearch` hook de `CatalogPage`                       | Comportamiento igual en UI            |
| 11   | Extraer `CatalogResultsGrid`, `CatalogEmptyState`, `CatalogErrorState` | Visual                                |
| 12   | Extraer `useBookDetail` hook de `BookDetailPage`                       | Comportamiento igual                  |
| 13   | Extraer `useMyLoans` hook de `MyLoansPage`                             | Comportamiento igual                  |
| 14   | Añadir `zod` a `shared` y mover schemas de auth                        | Build shared, typecheck backend       |
| 15   | Actualizar `AuthPage` para usar schemas de shared                      | Typecheck frontend                    |
| 16   | Refactorizar `AuthPage` a `useActionState` (React 19)                  | Comportamiento igual                  |
| 17   | Cambiar `<AuthContext.Provider>` a `<AuthContext>`                     | Comportamiento igual                  |
| 18   | Crear `AlertMessage` componente UI                                     | Visual                                |
| 19   | Reemplazar alerts en 3 lugares                                         | Visual                                |
| 20   | Crear workflow de CI básico                                            | Push a branch, ver checks             |

---

## 6. Decisiones tomadas

Las siguientes preguntas fueron respondidas por el propietario del proyecto:

| Pregunta                                      | Decisión                   |
| --------------------------------------------- | -------------------------- |
| ¿Añadir `express-rate-limit`?                 | **No**                     |
| ¿Mantener paquete `cn` o reemplazar?          | **Eliminar y usar `clsx`** |
| ¿Eliminar enum `ReadingStatus`?               | **No, mantener**           |
| ¿Usar `useActionState` para formularios Auth? | **Sí**                     |
| ¿Configurar Prettier con plugin Tailwind?     | **Sí**                     |
| ¿Incluir testing en este refactor?            | **No, fuera del alcance**  |

---

## 7. Instrucciones para el agente ejecutor

1. **No modifiques comportamiento ni aspecto visual.** El refactor es puramente estructural.
2. **Después de cada paso**, ejecuta:
   - `pnpm typecheck` (o el comando específico del paso)
   - `pnpm lint`
   - Verifica visualmente si hay cambios de UI
3. **Haz un commit por paso** con mensaje descriptivo.
4. **Si encuentras algo no cubierto en este plan**, anótalo y pregunta antes de proceder.
5. **Si un paso falla**, corrígelo antes de continuar al siguiente.

---

## 8. Archivos clave de referencia

- `frontend/tsconfig.app.json` — Configuración TS del frontend
- `frontend/src/pages/CatalogPage.tsx` — Página más grande (353 líneas)
- `frontend/src/pages/AuthPage.tsx` — Segunda página más grande (274 líneas)
- `frontend/src/context/AuthContext.tsx` — Context de autenticación
- `shared/src/index.ts` — Tipos compartidos
- `backend/src/controllers/AuthController.ts` — Schemas de Zod a mover
- `package.json` (raíz) — Scripts del monorepo
