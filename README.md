# TourGuardian — AI Travel Safety Platform

A full-stack tourist-safety application: trip planning, live location tracking,
an SOS emergency button, an AI safety chatbot, AI-based risk assessment, and an
admin dashboard.

**Stack:** React + Vite + Tailwind (frontend) · Node.js + Express (backend) · **MySQL** (database)

> The original brief suggested MongoDB — this build uses **MySQL** instead, as requested.
> The AI chatbot and risk engine ship with a built-in, fully-offline rule-based
> implementation, so the whole app works out of the box with **no external API keys**.
> You can later swap `backend/src/utils/riskEngine.js` and `chatbotEngine.js` for real
> LLM calls without changing any routes or frontend code.

---

## 1. Project structure

```
tourguardian/
├── backend/                 # Node.js + Express + MySQL API
│   ├── schema.sql           # Run this to create the database & tables
│   ├── .env.example         # Copy to .env and fill in your MySQL credentials
│   ├── server.js
│   └── src/
│       ├── config/db.js
│       ├── middleware/      # JWT auth, error handling
│       ├── controllers/     # Business logic per feature
│       ├── routes/          # REST endpoints
│       └── utils/           # Risk engine + chatbot engine (rule-based AI)
└── frontend/                 # React + Vite + Tailwind
    └── src/
        ├── api/axios.js      # Configured API client (adds JWT automatically)
        ├── context/AuthContext.jsx
        ├── components/       # Navbar, SOSButton, Chatbot, MapView, ProtectedRoute
        └── pages/            # Login, Register, Dashboard, Trips, Map, Risk, Contacts, Alerts, Admin
```

## 2. Prerequisites

- Node.js 18+
- MySQL 8+ (or MariaDB) running locally or remotely

## 3. Backend setup

```bash
cd backend
npm install

# create the database + tables
mysql -u root -p < schema.sql

cp .env.example .env
# edit .env: set DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET

npm run dev        # starts on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/health`

### Creating an admin account
Register a normal account first via the app, then promote it to admin directly in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

## 4. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL should point at your backend, default is fine

npm run dev             # starts on http://localhost:5173
```

Open http://localhost:5173, register an account, and you're in.

## 5. Feature → endpoint map

| Feature                       | Frontend page              | Backend route(s) |
|-------------------------------|-----------------------------|-------------------|
| Login / Register              | `/login`, `/register`       | `POST /api/auth/login`, `POST /api/auth/register` |
| Dashboard / safety overview   | `/dashboard`                | `GET /api/trips`, `/api/notifications`, `/api/risk/history` |
| Trip planning & itinerary     | `/trips`                    | `/api/trips` (CRUD) |
| Live location tracking        | `/map`                      | `POST /api/locations`, `GET /api/locations/history` |
| SOS emergency button          | floating button (all pages) | `POST /api/sos`, `GET /api/sos`, `PUT /api/sos/:id/resolve` |
| AI risk assessment            | `/risk`                     | `POST /api/risk/assess`, `GET /api/risk/history` |
| AI safety chatbot             | floating widget (all pages) | `POST /api/chatbot/chat` |
| Emergency contacts            | `/contacts`                 | `/api/emergency-contacts` (CRUD) |
| Alerts & notifications        | `/alerts`                   | `/api/notifications` |
| Admin dashboard & analytics   | `/admin` (admin role only)  | `/api/admin/*` |

## 6. Notes & next steps

- **Maps** use Leaflet + OpenStreetMap tiles — no API key required.
- **SOS notifications** currently create an in-app record and log which emergency
  contacts *would* be notified. Wire `src/controllers/sosController.js` to Twilio/SendGrid
  for real SMS/email delivery.
- **Risk engine & chatbot** are deterministic rule-based systems so the app is fully
  functional offline. Plug in a real AI provider by editing `AI_PROVIDER_API_KEY` in
  `.env` and updating `riskEngine.js` / `chatbotEngine.js`.
- Passwords are hashed with bcrypt; auth uses JWT bearer tokens (7-day expiry by default).
