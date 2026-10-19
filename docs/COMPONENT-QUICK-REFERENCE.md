# Matriz de Dependencias Rápida

## Tabla de Consulta Rápida (Quién usa a quién)

```
COMPONENTE                    USADO POR                                            TIPO
──────────────────────────────────────────────────────────────────────────────────────────
Button                        CatalogSearchForm, CatalogToolbar,               BASE UI
                              CatalogPagination, CatalogEmptyState,            (⭐⭐⭐⭐⭐
                              CatalogErrorState, BookCard, BookActionCard,     11 usos)
                              LoanCard, LoanEmptyState, AuthPage, AppLayout

BookCoverImage                BookCard, BookHero, LoanCard,                    CUSTOM UI
                              LoanHistoryTable                                  (⭐⭐⭐⭐
                                                                                4 usos)

CopyPips                      BookCard, BookAvailabilityPanel                   SHARED
                                                                                (⭐⭐⭐
                                                                                3 usos)

AlertMessage                  AuthPage, BookActionCard, MyLoansPage             CUSTOM UI
                                                                                (⭐⭐⭐
                                                                                3 usos)

Card                          BookCard, LoanCard                                BASE UI
                                                                                (⭐⭐
                                                                                2 usos)

Skeleton                      CatalogResultsGrid, BookDetailPage                BASE UI
                                                                                (⭐⭐
                                                                                2 usos)

BookCard                      CatalogResultsGrid                                CATALOG
                                                                                (⭐
                                                                                1 uso)

CatalogResultsGrid            CatalogPage                                       CATALOG
                                                                                CONTAINER

LoanCard                      MyLoansPage                                       LOAN
                                                                                (⭐
                                                                                1 uso)

LoanOverdueBadge              LoanCard                                          LOAN SUB

BookActionCard                BookDetailPage                                    BOOK DETAIL
                                                                                SUB

BookAvailabilityPanel         BookDetailPage                                    BOOK DETAIL
                                                                                SUB

BookHero                      BookDetailPage                                    BOOK DETAIL
                                                                                SUB

BookMeta                      BookDetailPage                                    BOOK DETAIL
                                                                                SUB

BookDescription               BookDetailPage                                    BOOK DETAIL
                                                                                SUB

CatalogSearchForm             CatalogPage                                       CATALOG SUB

CatalogToolbar                CatalogPage                                       CATALOG SUB

CatalogPagination             CatalogPage                                       CATALOG SUB

CatalogEmptyState             CatalogPage                                       CATALOG SUB

CatalogErrorState             CatalogPage                                       CATALOG SUB

CategoryFilterBar             CatalogPage                                       CATALOG SUB

LoanEmptyState                MyLoansPage                                       LOAN SUB

LoanHistoryTable              MyLoansPage                                       LOAN SUB

AuthHeader                    AuthPage                                          AUTH SUB

AuthModeSwitcher              AuthPage                                          AUTH SUB

Input                         AuthPage (implícito en form)                      BASE UI
                                                                                (no importado)

Badge                         (no usado en componentes)                         BASE UI
                                                                                (no usado)

ProtectedRoute                router.tsx                                        ROUTE GUARD

AppLayout                     router.tsx (raíz)                                 LAYOUT
```

---

## Resumen por Categoría

### 🔴 BASE UI (7 componentes)

- **Button** ⭐⭐⭐⭐⭐ (11 usos) - MÁS CRÍTICO
- **Card** ⭐⭐ (2 usos)
- **Skeleton** ⭐⭐ (2 usos)
- **Input** (0 usos - solo en forms HTML)
- **Badge** (0 usos - no usado)
- **AlertMessage** ⭐⭐⭐ (3 usos) - CUSTOM
- **BookCoverImage** ⭐⭐⭐⭐ (4 usos) - CUSTOM

### 🟠 CATÁLOGO (8 componentes)

```
CatalogPage (104 líneas)
├── 📊 CatalogResultsGrid
│   ├── BookCard (mostrar uno)
│   │   ├── Button, Card, BookCoverImage, CopyPips
│   └── Skeleton (loading)
├── CatalogSearchForm (input de búsqueda)
│   └── Button
├── CatalogToolbar (titulo, sort, hide)
│   └── Button
├── CatalogPagination (números)
│   └── Button
├── CategoryFilterBar (temas)
├── CatalogEmptyState (sin resultados)
│   └── Button
└── CatalogErrorState (error)
    └── Button
```

### 🟡 DETALLES DEL LIBRO (5 componentes)

```
BookDetailPage (119 líneas)
├── BookHero (imagen)
│   └── BookCoverImage
├── BookMeta (titulo, autor, temas)
├── BookAvailabilityPanel (stock)
│   └── CopyPips
├── BookActionCard (borrow/hold)
│   ├── Button
│   └── AlertMessage
├── BookDescription (sinopsis)
├── Button (back)
└── Skeleton (loading)
```

### 🟢 PRÉSTAMOS (4 componentes)

```
MyLoansPage (94 líneas)
├── LoanCard (préstamo activo)
│   ├── BookCoverImage
│   ├── Button (return)
│   ├── Card
│   └── LoanOverdueBadge
├── LoanEmptyState (sin préstamos)
│   └── Button
├── LoanHistoryTable (devueltos)
│   └── BookCoverImage
├── AlertMessage (error)
└── Skeleton (loading)
```

### 🔵 AUTENTICACIÓN (2 componentes)

```
AuthPage (291 líneas)
├── AuthHeader (titulo/desc)
├── AuthModeSwitcher (tabs)
├── Button (submit)
├── Card (contenedor)
└── AlertMessage (error)
```

### ⚫ COMPARTIDOS (2 componentes)

```
CopyPips (pips de disponibilidad)
├── Usado por BookCard
├── Usado por BookAvailabilityPanel
└── Reutilizable

ProtectedRoute (verificación de auth)
└── Usado en rutas
```

---

## Impacto de Cambios

Si modificas este componente, afecta a:

| Componente             | Cambios → Afectan a       | # Archivos |
| ---------------------- | ------------------------- | ---------- |
| **Button**             | 11 componentes, 5 páginas | 11         |
| **BookCoverImage**     | 4 componentes             | 4          |
| **CopyPips**           | 3 componentes             | 3          |
| **AlertMessage**       | 3 componentes             | 3          |
| **Card**               | 2 componentes             | 2          |
| **Skeleton**           | 2 componentes             | 2          |
| **BookCard**           | 1 componente (grid)       | 1          |
| **LoanCard**           | 1 página                  | 1          |
| **CatalogResultsGrid** | 1 página (CatalogPage)    | 1          |

---

## Componentes "Puros" (Sin Dependencias)

Estos no usan otros componentes (solo UI base/utils):

1. **AuthHeader** - Solo HTML + Tailwind
2. **AuthModeSwitcher** - Solo HTML + Tailwind
3. **BookMeta** - Solo HTML + Tailwind
4. **BookDescription** - Solo HTML + Tailwind
5. **LoanOverdueBadge** - Solo HTML + Tailwind
6. **CategoryFilterBar** - Solo HTML + Tailwind
7. **CatalogSearchForm** (usa Button) - Semi-puro
8. **CatalogToolbar** (usa Button) - Semi-puro
9. **CatalogEmptyState** (usa Button) - Semi-puro
10. **CatalogErrorState** (usa Button) - Semi-puro
11. **LoanEmptyState** (usa Button) - Semi-puro

**Beneficio:** Muy fáciles de testear y reutilizar en otros contextos.

---

## Densidad de Dependencias por Página

```
CatalogPage:    8 dependencias directas (muy acoplada)
BookDetailPage: 6 dependencias directas (muy acoplada)
MyLoansPage:    5 dependencias directas (acoplada)
AuthPage:       4 dependencias directas (moderadamente acoplada)
AppLayout:      1 dependencia directa (simple)

PROMEDIO:       4.8 dependencias por página
MÁXIMO:         CatalogPage (8)
MÍNIMO:         AppLayout (1)
```

Este es un buen nivel de acoplamiento: cada página gestiona su propio dominio.

---

## Propuesta: Componentes Candidatos a Extracción

### Podrían beneficiarse de un componente wrapper:

1. **BookCardBase**

   ```
   Actualmente: BookCard (se usa en CatalogResultsGrid)
   Futuro: LoanCard también podría heredar

   BookCardBase → BookCard (para catálogo)
               → LoanCard (simplificar lógica)
   ```

2. **BookDisplay**

   ```
   Actualmente: BookHero + BookMeta + BookMeta (separados)
   Futuro: Un componente que combine los 3
   ```

3. **StateContainer**
   ```
   Actualmente: Cada página tiene su propia lógica de loading/error/empty
   Futuro: Un componente reutilizable que envuelva esto
   ```

---

## Conclusión

Tu estructura de componentes es **profesional y bien organizada**:

✅ **Reutilización clara** - Button, BookCoverImage, CopyPips tienen múltiples usos
✅ **Separación de responsabilidades** - Cada dominio (catalog, loans, book-detail, auth) es independiente  
✅ **Pocos ciclos** - La mayoría de dependencias son unidireccionales
✅ **Fácil de mantener** - Cambios en un componente afectan a pocos archivos

💪 **Listo para crecer**
