# Mapa de Dependencias de Componentes

> Documento que muestra qué componentes usan a cuales, visualizado en múltiples formatos.

---

## 1. Vista de Árbol Jerárquico

### 📄 PÁGINAS (Entry Points)

```
AuthPage (291 líneas)
├── AuthHeader
├── AuthModeSwitcher
├── Button
├── Card
│   └── usesUI: AlertMessage
└── AlertMessage

CatalogPage (104 líneas)
├── CategoryFilterBar
├── CatalogSearchForm
│   └── Button
├── CatalogToolbar
│   └── Button
├── CatalogResultsGrid
│   ├── BookCard
│   │   ├── BookCoverImage
│   │   ├── CopyPips
│   │   ├── Button
│   │   └── Card
│   └── Skeleton
├── CatalogEmptyState
│   └── Button
├── CatalogErrorState
│   └── Button
└── CatalogPagination
    └── Button

BookDetailPage (119 líneas)
├── BookHero
│   └── BookCoverImage
├── BookMeta
├── BookAvailabilityPanel
│   └── CopyPips
├── BookActionCard
│   ├── Button
│   └── AlertMessage
├── BookDescription
├── Button
└── Skeleton

MyLoansPage (94 líneas)
├── AlertMessage
├── LoanCard
│   ├── BookCoverImage
│   ├── Button
│   ├── Card
│   └── LoanOverdueBadge
├── LoanEmptyState
│   └── Button
├── LoanHistoryTable
│   └── BookCoverImage
└── Skeleton

MyReservationsPage
├── AlertMessage
├── ReservationCard
│   ├── BookCoverImage
│   ├── Button
│   └── Card
├── ReservationEmptyState
│   └── Button
└── Skeleton

MyBooksPage
├── AlertMessage
├── ReadingBookCard
│   ├── BookCoverImage
│   └── Card
├── ReadingEmptyState
│   └── Button
└── Skeleton

AppLayout (54 líneas)
├── Button
└── ThemeToggle
```

---

## 2. Tabla de Dependencias (Quién usa a quién)

| Componente                | Usa                                                                                                                               | Categoría         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **AuthPage**              | AlertMessage, AuthHeader, AuthModeSwitcher, Button, Card                                                                          | Page              |
| **CatalogPage**           | CategoryFilterBar, CatalogSearchForm, CatalogToolbar, CatalogPagination, CatalogResultsGrid, CatalogEmptyState, CatalogErrorState | Page              |
| **BookDetailPage**        | BookHero, BookMeta, BookAvailabilityPanel, BookActionCard, BookDescription, Button, Skeleton                                      | Page              |
| **MyLoansPage**           | AlertMessage, LoanCard, LoanEmptyState, LoanHistoryTable, Skeleton                                                                | Page              |
| **MyReservationsPage**    | AlertMessage, ReservationCard, ReservationEmptyState, Skeleton                                                                    | Page              |
| **MyBooksPage**           | AlertMessage, ReadingBookCard, ReadingEmptyState, Skeleton                                                                        | Page              |
| **AppLayout**             | Button, ThemeToggle                                                                                                               | Layout            |
| **CatalogResultsGrid**    | BookCard, Skeleton                                                                                                                | Catalog Container |
| **BookCard**              | BookCoverImage, CopyPips, Button, Card                                                                                            | Catalog Item      |
| **LoanCard**              | BookCoverImage, Button, Card, LoanOverdueBadge                                                                                    | Loan Item         |
| **BookActionCard**        | Button, AlertMessage, ReadingStatusSelector                                                                                       | Book Detail Sub   |
| **ReadingStatusSelector** | —                                                                                                                                 | Book Detail Sub   |
| **BookAvailabilityPanel** | CopyPips                                                                                                                          | Book Detail Sub   |
| **BookHero**              | BookCoverImage                                                                                                                    | Book Detail Sub   |
| **LoanHistoryTable**      | BookCoverImage                                                                                                                    | Loan Sub          |
| **ReservationCard**       | BookCoverImage, Button, Card                                                                                                      | Reservation Sub   |
| **ReservationEmptyState** | Button                                                                                                                            | Reservation Sub   |
| **ReadingBookCard**       | BookCoverImage, Card                                                                                                              | Reading Sub       |
| **ReadingEmptyState**     | Button                                                                                                                            | Reading Sub       |
| **ThemeToggle**           | useTheme                                                                                                                          | Layout Sub        |
| **CatalogSearchForm**     | Button                                                                                                                            | Catalog Sub       |
| **CatalogToolbar**        | Button                                                                                                                            | Catalog Sub       |
| **CatalogPagination**     | Button                                                                                                                            | Catalog Sub       |
| **CatalogErrorState**     | Button                                                                                                                            | Catalog Sub       |
| **LoanEmptyState**        | Button                                                                                                                            | Loan Sub          |
| **AuthHeader**            | —                                                                                                                                 | Auth Sub          |
| **AuthModeSwitcher**      | —                                                                                                                                 | Auth Sub          |
| **BookMeta**              | —                                                                                                                                 | Book Detail Sub   |
| **BookDescription**       | —                                                                                                                                 | Book Detail Sub   |
| **CopyPips**              | —                                                                                                                                 | Shared            |
| **LoanOverdueBadge**      | —                                                                                                                                 | Loan Sub          |
| **CategoryFilterBar**     | —                                                                                                                                 | Catalog Sub       |
| **ProtectedRoute**        | —                                                                                                                                 | Route Guard       |
| **Button (UI)**           | @base-ui/react                                                                                                                    | Base Primitive    |
| **Card (UI)**             | —                                                                                                                                 | Base Primitive    |
| **Input (UI)**            | @base-ui/react                                                                                                                    | Base Primitive    |
| **Badge (UI)**            | @base-ui/react                                                                                                                    | Base Primitive    |
| **Skeleton (UI)**         | —                                                                                                                                 | Base Primitive    |
| **AlertMessage (UI)**     | —                                                                                                                                 | Custom UI         |
| **BookCoverImage (UI)**   | —                                                                                                                                 | Custom UI         |

---

## 3. Gráfico de Uso (Quién es usado por cuántos)

```
⭐⭐⭐⭐⭐ Button        → usado por 11 componentes
⭐⭐⭐⭐  Card          → usado por 2 componentes
⭐⭐⭐⭐  BookCoverImage → usado por 4 componentes
⭐⭐⭐   CopyPips       → usado por 3 componentes
⭐⭐⭐   AlertMessage   → usado por 3 componentes
⭐⭐⭐   Skeleton       → usado por 2 componentes
⭐⭐⭐   BookCard       → usado por 1 componente (CatalogResultsGrid)
⭐⭐    LoanCard       → usado por 1 componente (MyLoansPage)
⭐⭐    LoanOverdueBadge → usado por 1 componente (LoanCard)
⭐     CatalogResultsGrid → usado por 1 componente (CatalogPage)
```

**Button es el componente más reutilizado** (11 usos).

---

## 4. Mapa de Flujo (Cómo se conectan las páginas)

```
┌──────────────────────────────────────────────────────────────┐
│                      APP STRUCTURE                           │
└──────────────────────────────────────────────────────────────┘

                         App.tsx
                            │
                       AppLayout ────► Button
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    AuthPage          CatalogPage        BookDetailPage
        │                   │                   │
        │          ┌────────┼────────┐          │
        │          │        │        │          │
    ┌───┴────┐  ┌──┴──┐  ┌──┴──┐  ┌─┴──┐    ┌──┴──────┐
    │ Auth   │  │Cata │  │Cata │  │Cata│    │ Book    │
    │ Config │  │logue│  │logue│  │logue│   │ Detail  │
    └────┬───┘  │ Grid│  │Err. │  │Pagi│   └────┬────┘
         │      └──┬──┘  └─────┘  │nate│        │
         │         │              └────┘        │
         │    ┌────┴────┐                   ┌───┴──────┐
         │    │          │                   │          │
     ┌───┴────┴───┐  ┌───┴────┐         ┌────┴──┐   ┌──┴──┐
     │  BookCard  │  │ LoanCard│        │BookHero│   │Other│
     │            │  │         │        │        │   │     │
     └──┬───┬──┬──┘  └──┬─┬────┘        └───┬────┘   └─────┘
        │   │  │        │ │                 │
        ▼   ▼  ▼        ▼ ▼                 ▼
    ┌─────────────┐ ┌──────────┐       ┌──────────┐
    │  UI + Data  │ │  UI +    │       │  UI +    │
    │  Components │ │  Data    │       │  Pips    │
    └─────────────┘ │  Comp    │       └──────────┘
                    └──────────┘


                        MyLoansPage
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───┴────────┐     ┌────┴────┐      ┌──────┴──┐
    │ LoanCard   │     │ Loan    │      │ Loan    │
    │            │     │ Empty   │      │ History │
    │            │     │ State   │      │ Table   │
    └────┬───┬───┘     └────┬────┘      └────┬────┘
         │   │              │                │
         ▼   ▼              ▼                ▼
    ┌─────────────┐      ┌──────┐      ┌─────────┐
    │BookCover    │      │Button│      │BookCover│
    │Image        │      │      │      │Image    │
    └─────────────┘      └──────┘      └─────────┘
```

---

## 5. Niveles de Profundidad

### Nivel 0: Páginas (Entry Points)

- AuthPage
- CatalogPage
- BookDetailPage
- MyLoansPage
- AppLayout

### Nivel 1: Contenedores/Secciones

- CatalogResultsGrid
- LoanCard
- BookActionCard
- BookAvailabilityPanel

### Nivel 2: Presentacionales

- BookCard
- CatalogSearchForm
- CatalogToolbar
- CatalogPagination
- LoanHistoryTable
- LoanEmptyState
- CatalogEmptyState
- CatalogErrorState
- BookHero
- BookMeta
- BookDescription
- LoanOverdueBadge
- CopyPips
- AuthHeader
- AuthModeSwitcher
- CategoryFilterBar

### Nivel 3: Base UI (Primitivos)

- Button
- Card
- Input
- Badge
- Skeleton
- AlertMessage
- BookCoverImage

---

## 6. Componentes por Funcionalidad

### 🔐 Autenticación

```
AuthPage
├── AuthHeader (mostrar título/desc)
├── AuthModeSwitcher (login/register tabs)
├── Button (submit)
├── Card (contenedor)
└── AlertMessage (error server)
```

### 🔍 Búsqueda de Catálogo

```
CatalogPage
├── CategoryFilterBar (filtro por tema)
├── CatalogSearchForm (input + botones de búsqueda)
├── CatalogToolbar (título, contador, sort, hide unavailable)
├── CatalogResultsGrid (grid de resultados)
│   ├── BookCard (cada libro)
│   │   ├── BookCoverImage
│   │   ├── CopyPips (pips de disponibilidad)
│   │   ├── Button (borrow/hold)
│   │   └── Card
│   └── Skeleton (loading)
├── CatalogEmptyState (no hay resultados)
├── CatalogErrorState (error de búsqueda)
└── CatalogPagination (números de página)
```

### 📖 Detalles del Libro

```
BookDetailPage
├── BookHero (cubierta)
│   └── BookCoverImage
├── BookMeta (título, autor, año, temas)
├── BookAvailabilityPanel (stock, cola de espera)
│   └── CopyPips
├── BookActionCard (botón borrow/hold)
│   ├── Button
│   └── AlertMessage
└── BookDescription (sinopsis expandible)
```

### 📚 Mis Préstamos

```
MyLoansPage
├── Tabs: Active / History
├── Active:
│   ├── LoanCard (cada préstamo activo)
│   │   ├── BookCoverImage
│   │   ├── Button (return)
│   │   ├── Card
│   │   └── LoanOverdueBadge (warn if overdue)
│   └── LoanEmptyState
├── History:
│   └── LoanHistoryTable (tabla de devueltos)
│       └── BookCoverImage
├── AlertMessage (error de red)
└── Skeleton (loading)
```

---

## 7. Estadísticas

| Métrica                          | Valor            |
| -------------------------------- | ---------------- |
| **Total de Componentes**         | 37               |
| **Páginas**                      | 4                |
| **Layouts**                      | 1                |
| **Componentes de Negocio**       | 22               |
| **Componentes UI (Base)**        | 7                |
| **Componentes UI (Custom)**      | 2                |
| **Componentes Utilitarios**      | 1                |
| **Profundidad máxima**           | 4 niveles        |
| **Componente más reutilizado**   | Button (11 usos) |
| **Componentes sin dependencias** | 11               |

---

## 8. Matriz de Coexistencia

¿Qué componentes aparecen juntos en las mismas páginas?

```
AuthPage:
  AuthHeader ↔ AuthModeSwitcher ↔ Button ↔ Card ↔ AlertMessage

CatalogPage:
  CategoryFilterBar ↔ CatalogSearchForm ↔ CatalogToolbar
  ↔ CatalogResultsGrid ↔ BookCard ↔ CopyPips ↔ Button
  ↔ CatalogPagination ↔ Skeleton

BookDetailPage:
  BookHero ↔ BookMeta ↔ BookAvailabilityPanel ↔ BookActionCard
  ↔ BookDescription ↔ BookCoverImage ↔ CopyPips ↔ Button ↔ Skeleton

MyLoansPage:
  LoanCard ↔ LoanEmptyState ↔ LoanHistoryTable ↔ BookCoverImage
  ↔ Button ↔ Card ↔ AlertMessage ↔ Skeleton
```

---

## 9. Recomendaciones

### ✅ Bien estructurado

- Separación clara entre niveles (Pages → Containers → Presentational → UI)
- Reutilización inteligente (Button, BookCoverImage, CopyPips)
- Sin ciclos/circular dependencies

### 🔍 Puntos a observar

- **Button**: Usado 11 veces. Si cambias su API, afecta 11 archivos.
  - Solución: Mantener compatible hacia atrás.

- **BookCoverImage**: Usado 4 veces (BookCard, BookHero, LoanCard, LoanHistoryTable).
  - Bien: La lógica de fallback está centralizada.

- **Card**: Usado 2 veces (BookCard, LoanCard).
  - Considera si merece un componente intermedio BookCardWrapper.

### 🚀 Mejoras futuras

- Extraer `BookCardContainer` si BookCard y LoanCard comparten mucho
- Considerar un `<BookList />` que envuelva `CatalogResultsGrid` + `LoanHistoryTable`
- Crear `<FormField />` para DRY en AuthPage (solo si crece)

---

## 10. Referencias Cruzadas

### Por carpeta

**`ui/`** (7 componentes - Base Primitives)

```
button.tsx          ← usado por 11 componentes
card.tsx            ← usado por 3 componentes
input.tsx           ← (no usado en componentes, solo en forms)
badge.tsx           ← (no usado)
skeleton.tsx        ← usado por 2 componentes
AlertMessage.tsx    ← usado por 3 componentes
BookCoverImage.tsx  ← usado por 4 componentes
```

**`catalog/`** (8 componentes)

```
CatalogPage         ← entry point
  ├── BookCard      ← reutilizable
  ├── CatalogResultsGrid
  ├── CatalogSearchForm
  ├── CatalogToolbar
  ├── CatalogPagination
  ├── CatalogEmptyState
  ├── CatalogErrorState
  └── CategoryFilterBar
```

**`book-detail/`** (5 componentes)

```
BookDetailPage      ← entry point
  ├── BookHero
  ├── BookMeta
  ├── BookAvailabilityPanel
  ├── BookActionCard
  └── BookDescription
```

**`loans/`** (4 componentes)

```
MyLoansPage         ← entry point
  ├── LoanCard      ← reutilizable
  ├── LoanEmptyState
  ├── LoanHistoryTable
  └── LoanOverdueBadge
```

**`auth/`** (2 componentes)

```
AuthPage            ← entry point
  ├── AuthHeader
  └── AuthModeSwitcher
```

**Root** (2 componentes)

```
CopyPips            ← compartido, usado por 3
ProtectedRoute      ← route guard
```

---

Este mapa te ayuda a:

- Entender el flujo de la aplicación
- Ver qué cambia si modificas un componente
- Identificar componentes candidates a refactor
- Planificar nuevas features sin romper existentes
