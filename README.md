# 💰Finance Backend System

## 🚀 Overview

This project is a **Finance Data Processing and Access Control Backend** built to simulate a real-world financial dashboard system.

This project was built independently with custom architecture and logic design.  
All implementation decisions (RBAC, Prisma schema, API structure) were designed and coded manually.

It focuses on:

- Managing financial transactions
- Enforcing role-based access control (RBAC)
- Providing aggregated insights for dashboards
- Designing clean, scalable backend architecture

---

## 🎯 How This Matches the Assignment

| Requirement | Implementation |
|------------|--------------|
| User & Role Management | JWT auth + role-based system |
| Financial Records | Full CRUD with filters |
| Dashboard APIs | Aggregated financial summaries |
| Access Control | Middleware-based RBAC |
| Validation | API-level validation + error handling |
| Persistence | PostgreSQL (Neon) via Prisma |

---

## 🧠 Key Design Decisions

### 1. API-First Architecture
Built using **Next.js API routes**, treating backend as a modular service layer.

### 2. Prisma ORM
Used for:
- Type-safe database queries
- Clean schema modeling
- Easy migrations

### 3. Middleware-Based RBAC
Access control is centralized instead of being scattered across routes.

### 4. JWT via Cookies
- Secure authentication
- Stateless backend
- Easy frontend integration

---

## ⚙️ Tech Stack

- **Framework:** Next.js (App Router API)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon / Local)
- **ORM:** Prisma
- **Auth:** JSON Web Tokens (JWT)
- **Deployment:** Vercel

---

## 📁 Project Structure
---
.
├── app
│ ├── admin
│ ├── analytics
│ ├── api
│ │ ├── analytics
│ │ │ └── route.ts
│ │ ├── auth
│ │ │ ├── login
│ │ │ ├── logout
│ │ │ ├── me
│ │ │ └── register
│ │ ├── records
│ │ │ ├── [id]
│ │ │ └── route.ts
│ │ └── users
│ │ ├── [id]
│ │ └── route.ts
│ ├── dashboard
│ ├── generated
│ ├── login
│ ├── register
│ ├── favicon.ico
│ ├── globals.css
│ ├── layout.tsx
│ └── page.tsx
│
├── lib
│ ├── auth.ts
│ ├── getUser.ts
│ └── prisma.ts
│
├── prisma
│ ├── migrations
│ └── schema.prisma
│
├── public
├── node_modules
├── .env

---

## 👥 User & Role System

### Roles

- **Viewer**
  - Read-only dashboard access

- **Analyst**
  - View records
  - Access analytics

- **Admin**
  - Full access (users + records management)

---

## 🔐 Authentication Flow

1. User logs in
2. Server generates JWT
3. Token stored in **HTTP-only cookies**
4. Each request:
   - Token is verified
   - User role is extracted
   - Access is enforced

---

## 🛡️ Authorization (RBAC)

Access is enforced using middleware logic.

### Example

```ts
if (user.role !== "ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```
## Role-Based Access Control (RBAC)

| Action           | Viewer | Analyst | Admin |
|------------------|--------|---------|-------|
| View Records     | ✅     | ✅      | ✅    |
| Create Records   | ❌     | ❌      | ✅    |
| Update/Delete    | ❌     | ❌      | ✅    |
| View Analytics   | ❌     | ✅      | ✅    |
| Manage Users     | ❌     | ❌      | ✅    |

## 💵 Financial Records Module
Record Fields
- amount
- type (income / expense)
- category
- date
- notes

## Features
- Create transaction
- Update transaction
- Delete transaction
- Fetch records
## Filter by:
- Type
-Category
- Date range
## 📊 Dashboard & Analytics

Provides aggregated insights instead of just raw data.

- APIs Provide
- Total income
- Total expenses
- Net balance
- Recent transactions


## ✅ Validation & Error Handling

- **400** → Bad Request (invalid input)  
- **401** → Unauthorized (invalid/missing token)  
- **403** → Forbidden (role restriction)  
- **500** → Internal Server Error  

Ensures stable and predictable backend behavior.

---

## 🗄️ Database Schema (Simplified)

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}


model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role
  createdAt DateTime @default(now())
}

// -------------------------
// GLOBAL FINANCIAL RECORDS
// -------------------------
model Record {
  id        Int      @id @default(autoincrement())
  amount    Float
  type      RecordType
  category  String
  date      DateTime
  note      String?  
}

// -------------------------
// ENUMS
// -------------------------
enum Role {
  VIEWER
  ANALYST
  ADMIN
}

enum RecordType {
  INCOME
  EXPENSE
}
```
## 🔌 API Documentation

### 🔐 Authentication APIs

#### 1. Login
**POST** `/api/auth/login`

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password"
}
```
2. Register

**POST /api/auth/register**

Request Body:
```
{
  "email": "user@example.com",
  "password": "password",
  "role": "VIEWER | ANALYST | ADMIN"
}
```
Response:
```
{
  "message": "User created successfully"
}
```
3. Get Current User
```
GET /api/auth/me
```
Response:
```
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "ANALYST"
}
```
4. Logout
```
POST /api/auth/logout
```
Response:
```
{
  "message": "Logged out successfully"
}
```
## 👥 User Management (Admin Only)
5. Get All Users
```
GET /api/users
```
Response:
```
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "role": "VIEWER",
    "active": true
  }
]
```
6. Update User
```
PATCH /api/users/:id
```
Request Body:
```
{
  "role": "ADMIN",
  "active": true
}
```
Response:
```
{
  "message": "User updated successfully"
}
```
7. Delete User
```
DELETE /api/users/:id
```
Response:
```
{
  "message": "User deleted successfully"
}
```
##📊 Records APIs
8. Get All Records
```
GET /api/records
```
Response:
```
[
  {
    "id": "uuid",
    "amount": 1000,
    "type": "income",
    "category": "salary",
    "date": "2025-04-05T00:00:00.000Z",
    "notes": "optional"
  }
]
```
9. Create Record
```
POST /api/records
```
Request Body:
```
{
  "amount": 1000,
  "type": "income | expense",
  "category": "salary",
  "date": "2025-04-05T00:00:00.000Z",
  "notes": "optional"
}
```
Response:
```
{
  "message": "Record created successfully"
}
```
10. Update Record
```
PUT /api/records/:id
```
Request Body:
```
{
  "amount": 1200,
  "category": "updated-category"
}
```
Response:
```
{
  "message": "Record updated successfully"
}
```
11. Delete Record
```
DELETE /api/records/:id
```
Response:
```
{
  "message": "Record deleted successfully"
}
```
##📈 Dashboard & Analytics
12. Get Dashboard Data
```
GET /api/dashboard
```
Response:
```
{
  "totalIncome": 5000,
  "totalExpense": 2000,
  "balance": 3000
}
```
13. Get Analytics
```
GET /api/analytics
```
Response:
```
{
  "monthlyData": [],
  "categoryBreakdown": []
}
```

##🚀 Getting Started
1. Clone Repository
```
git clone https://github.com/Abirpaul007/Zorvyn-Finance-Backend-System.git
cd Zorvyn-Finance-Backend-System
```
2. Install Dependencies
```
npm install
```
3. Environment Variables

Create a .env file:
```
DATABASE_URL=your_neon_or_local_db_url
JWT_SECRET=your_secret
```
4. Setup Database
```
npx prisma generate
npx prisma db push
```
5. Run Development Server
```
npm run dev
```
## 🌐 Deployment Notes
- Hosted on Vercel
- Uses Neon PostgreSQL
- Ensure environment variables are configured correctly
## ⚠️ Challenges Faced
- Prisma + Vercel build inconsistencies
- Cookie handling in Next.js App Router
- Clean RBAC structure without duplication
- Efficient aggregation queries
- 
##📌 Conclusion

This project demonstrates:

- Strong backend fundamentals
- Clean API design
- Real-world RBAC implementation
- Structured financial data processing

The focus was on building a system that is logical, maintainable, and scalable, rather than overly complex.
