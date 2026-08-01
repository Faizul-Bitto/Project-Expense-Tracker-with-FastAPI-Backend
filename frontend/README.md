# Expense Tracker — Frontend

The React frontend for **Expense Tracker**, a full-stack expense management application. Built with **React 19**, **Vite 8**, and **Tailwind CSS v4**.

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS v4** | Styling |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client (with JWT auth interceptor) |
| **Recharts 3** | Data visualization (analytics charts) |
| **Lucide React** | Icons |
| **Sonner** | Toast notifications |
| **shadcn/ui** | UI component primitives |
| **Zod** | Validation schemas |

---

## 📁 Project Structure

```
src/
├── api/               # API clients (auth, users, expenses, categories, analytics, admin)
│   ├── client.js      # Axios instance + request/response interceptors
│   └── endpoints.js   # Centralized endpoint constants
├── components/        # Reusable UI components (ui, common, forms, tables, admin, user)
├── config/            # App config (name, version, defaults)
├── contexts/          # React contexts (Auth, Theme)
├── hooks/             # Custom hooks (useAuth)
├── layouts/           # UserLayout & AdminLayout (desktop nav + mobile menu)
├── lib/               # Utilities (API helper, cn)
├── pages/
│   ├── auth/          # Login, Register, Forgot Password, Verify OTP, Reset Password
│   ├── user/          # Dashboard, Expenses, Expense Form, Analytics, Profile
│   └── admin/         # Dashboard, Users, Expenses, Categories, Analytics
├── routes/            # UserRoutes, AdminRoutes, ProtectedRoute
└── utils/             # Logger, class-name utilities
```

---

## ✨ Features

### Authentication
- 🔐 Register & Login (JWT-based)
- 👁️ Show/hide password toggle on all password inputs
- 🔑 Forgot Password → OTP → Verify OTP → Reset Password flow
- 🔒 Protected routes with role-based access (User / Admin)

### User Panel
- 📊 **Dashboard** — expense summary overview
- 💸 **Expenses** — list, create, edit, delete expenses with multiple items
- 📅 **Date Filter** — view expenses by specific date
- 📈 **Analytics** — charts for weekly, monthly, yearly spending, categories & trends
- 👤 **Profile** — update name/email, change password

### Admin Panel
- 📊 **Dashboard** — system summary stats
- 👥 **Users** — search, create, edit, delete users, reset user passwords
- 🧾 **Expenses** — view & manage any user's expenses
- 🗂️ **Categories** — create, edit, delete expense categories
- 📈 **Analytics** — total spending, top users, category breakdown, monthly/weekly trends, recent activity

### Global
- 🌙 **Dark / Light theme** toggle (floating button)
- 📱 **Fully responsive** — mobile hamburger navigation, horizontally scrollable tables
- 🔔 **Toast notifications** for every action result
- 🪵 **Browser console logging** for every API request/response & user action

---

## 🔌 Environment Variables

Create a `.env` file in the root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## ⚙️ Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

The dev server runs at `http://localhost:5173` by default.

---

## 🔗 API Integration

The frontend connects to the FastAPI backend through the centralized Axios client (`src/api/client.js`) which:

- Automatically attaches the **JWT token** (`Authorization: Bearer <token>`) to every request
- On **401 Unauthorized**, clears local auth state and redirects to `/login`
- Logs every request/response to the browser console

The default API base URL is `http://localhost:8000` (configurable via `VITE_API_BASE_URL`).

---

## 🚢 Deployment

The frontend is configured for deployment on **Vercel**:

- `vercel.json` — SPA rewrite rule so all routes fall back to `index.html` (prevents 404s on refresh/direct navigation)

---

## 📄 License

This is a private project. All rights reserved.