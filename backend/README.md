# Expense Tracker — Backend

The FastAPI backend for **Expense Tracker**, a full-stack expense management application. Provides a REST API for user authentication, expense management, expense categories, analytics, and admin operations.

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| **FastAPI** | Web framework |
| **Uvicorn** | ASGI server |
| **SQLAlchemy 2** | ORM / database models |
| **Alembic** | Database migrations |
| **PyMySQL** | MySQL driver |
| **Pydantic** | Request/response validation |
| **python-jose** | JWT token creation & verification |
| **Bcrypt** | Password hashing |
| **Passlib** | Password hashing utilities |
| **Jinja2** | Email template rendering |
| **Brevo API** | Transactional email delivery |

---

## 📁 Project Structure

```
app/
├── core/               # Database, email, logger, security utilities
├── dependencies/       # Auth, admin, database, user dependencies
├── models/             # SQLAlchemy models (User, Expense, Category, Item, PasswordReset)
├── routers/            # API route handlers (auth, users, expenses, categories, analytics)
│   └── admin/          # Admin-only routes
├── schemas/            # Pydantic request/response schemas
├── templates/emails/   # HTML email templates (password reset)
└── main.py             # Entry point — FastAPI app with lifespan startup
```

---

## ✨ Features

- ✅ Default admin auto-creation on startup
- ✅ JWT-based authentication (OAuth2 password flow)
- ✅ Bcrypt password hashing
- ✅ Email-verified password reset flow (OTP)
- ✅ Custom console logger with emoji/status levels
- ✅ CORS middleware with configurable origins
- ✅ `/healthy` health-check endpoint

---

## 🧾 API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create a new user account |
| POST | `/auth/login` | Login → returns JWT access token |
| POST | `/auth/forgot-password` | Send password reset OTP to email |
| POST | `/auth/verify-otp` | Verify the password reset OTP |
| POST | `/auth/reset-password` | Set a new password after OTP verification |

### Users (`/users`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/me` | Get current user's profile |
| PUT | `/users/me` | Update current user's name/email |
| PUT | `/users/me/password` | Change current user's password |

### Expenses (`/expenses`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/expenses` | List current user's expenses |
| GET | `/expenses/{expense_id}` | Get a specific expense |
| POST | `/expenses` | Create an expense (with items) |
| PUT | `/expenses/{expense_id}` | Update an expense |
| DELETE | `/expenses/{expense_id}` | Delete an expense |
| GET | `/expenses/date/{expense_date}` | List expenses for a given date |

### Expense Categories (`/expense-categories`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/expense-categories` | List all expense categories |
| GET | `/expense-categories/{category_id}` | Get a specific category |

### Analytics (`/analytics`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/summary` | Summary stats (today, week, month, year spending) |
| GET | `/analytics/weekly` | Weekly spending breakdown |
| GET | `/analytics/monthly` | Monthly spending breakdown |
| GET | `/analytics/yearly` | Yearly spending breakdown |
| GET | `/analytics/categories` | Spending by category |
| GET | `/analytics/trends` | Spending trends over time |

### Admin — Users (`/admin/users`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | List all non-admin users |
| GET | `/admin/users/search?query=` | Search users by name or email |
| GET | `/admin/users/{user_id}` | Get a specific user |
| POST | `/admin/users` | Create a new user |
| PUT | `/admin/users/{user_id}` | Update a user |
| POST | `/admin/users/{user_id}/reset-password` | Reset user password + email temp password |
| DELETE | `/admin/users/{user_id}` | Delete a user |

### Admin — Expenses (`/admin/users/{user_id}/expenses`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users/{user_id}/expenses` | List a user's expenses |
| GET | `/admin/users/{user_id}/expenses/{expense_id}` | Get a user's specific expense |
| PUT | `/admin/users/{user_id}/expenses/{expense_id}` | Update a user's expense |
| DELETE | `/admin/users/{user_id}/expenses/{expense_id}` | Delete a user's expense |
| GET | `/admin/users/{user_id}/expenses/date/{expense_date}` | User's expenses on a date |

### Admin — Categories (`/admin/expense-categories`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/admin/expense-categories` | Create an expense category |
| PUT | `/admin/expense-categories/{category_id}` | Update a category |
| DELETE | `/admin/expense-categories/{category_id}` | Delete a category |

### Admin — Analytics (`/admin/analytics`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/analytics/summary` | System-wide summary stats |
| GET | `/admin/analytics/users` | Users overview |
| GET | `/admin/analytics/top-users` | Top spending users |
| GET | `/admin/analytics/categories` | Category spending breakdown |
| GET | `/admin/analytics/monthly-trend` | Monthly spending trend |
| GET | `/admin/analytics/weekly-trend` | Daily/weekly trend |
| GET | `/admin/analytics/recent-expenses` | Recent expenses |

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/healthy` | API health check |

> Interactive API docs are available at `/docs` (Swagger UI) and `/redoc` (ReDoc).

---

## 🔌 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `ALGORITHM` | JWT algorithm (default `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Login token lifetime |
| `PASSWORD_RESET_OTP_EXPIRE_MINUTES` | OTP lifetime |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `DEFAULT_ADMIN_NAME` | Default admin name (auto-created) |
| `DEFAULT_ADMIN_EMAIL` | Default admin email |
| `DEFAULT_ADMIN_PASSWORD` | Default admin password |
| `BREVO_API_KEY` | Brevo API key for email |
| `EMAIL_FROM` | From-address for outgoing emails |
| `EMAIL_FROM_NAME` | From-name for outgoing emails |

---

## ⚙️ Getting Started

```bash
# Create & activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Start the server (auto-reload)
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000` by default. Swagger UI: `http://localhost:8000/docs`.

---

## 🗄️ Database

- Models are **auto-created** on startup (`Base.metadata.create_all`).
- **Alembic** is configured (`alembic.ini`) for structured migrations if needed:

```bash
alembic init
alembic revision --autogenerate -m "migration"
alembic upgrade head
```

---

## 📧 Email Templates

- `app/templates/emails/password_reset.html` — OTP reset email (user-initiated)
- `app/templates/emails/admin_password_reset.html` — Temporary password email (admin-initiated)

---

## 📄 License

This is a private project. All rights reserved.