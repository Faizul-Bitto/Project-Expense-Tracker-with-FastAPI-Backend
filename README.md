# Expense Tracker — Full-Stack Web Application

A complete expense management application with a **FastAPI** backend and a **React** frontend. Users can track personal expenses with multiple line items, view spending analytics, and administrators can manage users, categories, and system-wide reports.

---

## 🏗️ Architecture

```
Project-Expense-Tracker-with-FastAPI-Backend/
├── backend/          # FastAPI REST API
│   ├── app/
│   │   ├── core/         # Database, email, logger, security
│   │   ├── dependencies/ # Auth & permission dependencies
│   │   ├── models/       # SQLAlchemy models
│   │   ├── routers/      # API endpoints (user + admin)
│   │   ├── schemas/      # Pydantic schemas
│   │   └── templates/    # HTML email templates
│   ├── alembic/          # Database migrations
│   └── requirements.txt
└── frontend/         # React SPA
    └── src/
        ├── api/          # Axios API clients
        ├── components/   # Reusable UI components
        ├── layouts/      # User & Admin layouts
        ├── pages/        # Auth, User, Admin pages
        ├── routes/       # Protected routing
        └── utils/        # Logger & helpers
```

---

## 🚀 Tech Stack

### Backend
- **FastAPI** — REST API framework
- **SQLAlchemy 2** + **Alembic** — ORM & migrations
- **PyMySQL** — MySQL driver
- **python-jose** — JWT authentication
- **Bcrypt** — Password hashing
- **Jinja2** — Email template rendering
- **Brevo API** — Transactional email delivery

### Frontend
- **React 19** + **Vite 8** — UI & build tool
- **Tailwind CSS v4** — Styling
- **React Router 7** — Client-side routing
- **Axios** — HTTP client with JWT interceptor
- **Recharts 3** — Charts & analytics
- **Sonner** — Toast notifications
- **shadcn/ui** — UI primitives

---

## ✨ Features

### Authentication
- User registration & login (JWT-based)
- Role-based access control (user / admin)
- Password reset via email OTP flow

### User Features
- Dashboard with expense summaries
- Create, edit, delete expenses with multiple line items
- Filter expenses by date
- Analytics: weekly, monthly, yearly spending, category breakdowns, trends
- Profile management (name, email, password)

### Admin Features
- User management (list, search, create, edit, delete)
- User password reset (emails temporary password)
- Manage any user's expenses
- Manage expense categories
- System-wide analytics: top spenders, category breakdown, monthly/weekly trends

### Global
- Dark / light theme toggle
- Fully responsive (mobile hamburger menu, scrollable tables)
- Console logging for API requests & user actions (backend & frontend)

---

## 📝 Documentation

| README | Description |
|---|---|
| [`frontend/README.md`](frontend/README.md) | Frontend setup, structure, features |
| [`backend/README.md`](backend/README.md) | Backend setup, structure, endpoints |

---

## ⚙️ Getting Started (Full Stack)

### 1. Backend

```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Start API server
uvicorn app.main:app --reload
```

API runs at `http://localhost:8000` — Swagger UI at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 🔑 Default Admin

On first startup, the backend automatically creates a default administrator account. The admin credentials are configured through environment variables in the backend `.env` file:

- `DEFAULT_ADMIN_NAME` — provide the administrator's display name
- `DEFAULT_ADMIN_EMAIL` — provide the administrator's email address
- `DEFAULT_ADMIN_PASSWORD` — provide a secure password for the administrator

> **⚠️ Set strong custom credentials for these variables before deploying to production. Do not commit your actual `.env` file to version control.**

---

## 🧪 Running Tests

```bash
cd backend
pytest
```

---

## 🚢 Deployment

- **Frontend**: Deployable to Vercel (SPA rewrite configured via `vercel.json`)
- **Backend**: Standard FastAPI deployment (Uvicorn/Gunicorn + MySQL)
- Set `CORS_ORIGINS` in backend `.env` to the frontend's deployed domain

---

## 📄 License

This is a private project. All rights reserved.