# Product Management System

A full-stack **Product Management System** built with a FastAPI + Strawberry GraphQL backend and an Angular 21 + Apollo Client frontend, featuring JWT authentication, role-based authorization, and a fully responsive UI.

---

## 🗂 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Backend Setup](#-backend-setup)
- [Frontend Setup](#-frontend-setup)
- [Authentication](#-authentication)
- [API Overview](#-api-overview)
- [Features](#-features)
- [Running Tests](#-running-tests)
- [Quick Start](#-quick-start)

---

## 🛠 Tech Stack

### Backend

| Technology | Version |
|---|---|
| Python | 3.8.10 |
| FastAPI | 0.124.4 |
| Strawberry GraphQL | 0.255.0 |
| SQLAlchemy | 2.0.46 |
| PostgreSQL (psycopg) | 3.2.13 |
| python-jose (JWT) | — |
| Uvicorn | 0.33.0 |

### Frontend

| Technology | Version |
|---|---|
| Angular | 21.1.3 |
| Angular Material | 21.1.3 |
| Apollo Angular | 13.0.0 |
| GraphQL | 16.12.0 |
| RxJS | 7.8.2 |
| TailwindCSS | 4.1.18 |
| Vitest | 4.0.18 |
| Node.js | 24.13.0 |
| npm | 11.6.2 |

---

## 📁 Project Structure

```
ProductManagementSystem/
│
├── backend/
│   ├── app/
│   │   ├── graphql/
│   │   ├── models/
│   │   ├── database.py
│   │   └── main.py
│   └── ...
│
├── frontend/
│   └── pms-frontend/
│
└── README.md
```

---

## ✅ Prerequisites

Ensure the following are installed before getting started:

- **Python** 3.8+
- **Node.js** 24+
- **npm** 11+
- **PostgreSQL**
- **Git**

---

## 🔧 Backend Setup

### 1. Create and activate a virtual environment

```bash
python -m venv .venv
```

**Windows:**
```bash
.venv\Scripts\activate
```

**macOS / Linux:**
```bash
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

If no `requirements.txt` is present, install manually:

```bash
pip install fastapi uvicorn strawberry-graphql SQLAlchemy psycopg-binary python-jose passlib python-dotenv
```

### 3. Configure environment variables

Create a `.env` file in the backend root directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/pms_db
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=60
```

### 4. Start the backend server

```bash
uvicorn backend.app.main:app --reload
```

| Endpoint | URL |
|---|---|
| REST / Docs | `http://127.0.0.1:8000` |
| GraphQL Playground | `http://127.0.0.1:8000/graphql` |

---

## 💻 Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend/pms-frontend
```

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
ng serve
```

The application will be available at `http://localhost:4200`.

---

## 🔐 Authentication

Authentication is JWT-based and handled transparently by the Apollo Client middleware.

- The `login` mutation returns a signed JWT token
- The token is persisted in `localStorage`
- The token is automatically attached to all outgoing GraphQL requests
- Expired or invalid tokens trigger an automatic logout and redirect to the login page

**Sample credentials** (if the database has been seeded manually):

```
Username: user1
Password: password123
```

> Adjust credentials to match your database seed configuration.

---

## 📡 API Overview

### Queries

| Query | Description |
|---|---|
| `me` | Returns the authenticated user |
| `products` | Returns all products |
| `productById(id)` | Returns a product by ID |

### Mutations

| Mutation | Access |
|---|---|
| `login` | Public |
| `register` | Public |
| `createProduct` | Authenticated |
| `updateProduct` | Authenticated |
| `deleteProduct` | Admin only |

---

## ✨ Features

**Authentication & Authorization**
- JWT-based login and registration
- Role-based access control (`ADMIN` / `USER`)
- Automatic logout on `401 Unauthorized`

**Error Handling**
- Centralized Apollo `errorLink` handles all GraphQL and network errors
- `401` → clears token and redirects to login
- `403` → displays "Access denied" via snackbar
- Network errors → displays "Server unreachable" notification

**User Experience**
- Loading indicators on login, product list, and CRUD operations
- Snackbar notifications for all user-facing error states
- Dark / Light theme toggle with persistence
- Internationalization support (English / French)
- Fully responsive UI

**Architecture**
- Angular standalone components
- Apollo Client with cache management
- Clean layered architecture: GraphQL → Service → UI
- CSS variables for consistent theming
- RxJS operators for reactive data flow

---

## 🧪 Running Tests

Run the full frontend test suite using Vitest:

```bash
npm test
```

This executes all component and service unit tests.

---

## 🚀 Quick Start

Get the full application running in six steps:

1. **Clone** the repository
2. **Configure** PostgreSQL and create the `pms_db` database
3. **Set up** the `.env` file with your database credentials and JWT secret
4. **Start** the backend server with `uvicorn`
5. **Start** the frontend with `ng serve`
6. **Log in** and begin managing products

---

## 📄 License

This project is intended for demonstration and portfolio purposes.
