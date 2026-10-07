# Database Design

## 1. Relational Model (Schema Details)

This diagram represents the physical database structure, including column types, primary keys (PK), foreign keys (FK), and exact relationships.

```mermaid
erDiagram
    User ||--o{ Loan : "makes"
    User ||--o{ Reservation : "places"
    User ||--o{ ReadingStatus : "tracks"
    
    Work ||--o{ Loan : "has"
    Work ||--o{ Reservation : "has"
    Work ||--o{ ReadingStatus : "has"

    User {
        String id PK
        String name
        String email UK
        String passwordHash
        DateTime createdAt
        DateTime updatedAt
    }

    Work {
        String id PK "Open Library Key"
        String title
        String firstAuthor
        Int coverId
        Int copies "Default 3"
    }

    Loan {
        String id PK
        String userId FK
        String workId FK
        DateTime borrowedAt
        DateTime dueDate
        DateTime returnedAt "Nullable"
        Enum status "ACTIVE, RETURNED"
        Int renewals "Default 0"
    }

    Reservation {
        String id PK
        String userId FK
        String workId FK
        DateTime createdAt
        Enum status "PENDING, HOLD, FULFILLED, CANCELLED"
        DateTime holdExpiresAt "Nullable"
    }

    ReadingStatus {
        String id PK
        String userId FK
        String workId FK
        Enum status "READING, COMPLETED"
        DateTime updatedAt
    }
```

## 2. Conceptual Entity-Relationship (ER) Diagram

This diagram focuses purely on the high-level business concepts and how they relate to one another, abstracting away the technical column details.

```mermaid
erDiagram
    User ||--o{ Loan : "1 to Many"
    User ||--o{ Reservation : "1 to Many"
    User ||--o{ ReadingStatus : "1 to Many"
    
    Work ||--o{ Loan : "1 to Many"
    Work ||--o{ Reservation : "1 to Many"
    Work ||--o{ ReadingStatus : "1 to Many"

    User {
        Student_or_Faculty member
    }

    Work {
        Local_Catalog_Cache metadata
    }

    Loan {
        Borrowing_Activity record
    }

    Reservation {
        Waitlist_Queue position
    }

    ReadingStatus {
        Personal_Tracker status
    }
```
