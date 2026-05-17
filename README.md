# SupportDesk CRM

A full-stack customer support ticketing system built with **FastAPI + SQLite** (backend) and **React + Tailwind CSS** (frontend).

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Python 3.11+, FastAPI, SQLite     |
| Frontend  | React 18, Vite, Tailwind CSS      |
| Deploy    | Railway (backend), Vercel (frontend) |

---

## Features

- **Create Tickets** — Customer info, subject, description, priority
- **List All Tickets** — Paginated table with ID, name, subject, status, priority, date
- **Search** — Real-time search across name, email, ticket ID, subject, description
- **Filter by Status** — Open / In Progress / Closed
- **Filter by Priority** — Low / Medium / High / Urgent
- **View & Update** — Full ticket detail, status/priority update
- **Notes / Comments** — Add internal notes with agent name attribution
- **Delete Ticket** — Remove a ticket permanently
- **Stats Dashboard** — Total, open, in-progress, closed counts

---

## Project Structure

```
support-crm/
├── backend/
│   ├── main.py              # FastAPI app + all endpoints
│   ├── requirements.txt
│   ├── railway.toml         # Railway deploy config
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NewTicket.jsx
│   │   │   └── TicketDetail.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Badges.jsx
│   │   │   └── StatCard.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
└── README.md
```

---

## Local Setup

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd support-crm
```

### 2. Backend

```bash
cd backend
python -m venv venv

# Mac/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env

uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs at: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env

npm run dev
```

Frontend runs at: http://localhost:5173

---

## API Endpoints

| Method | Endpoint                   | Description           |
|--------|----------------------------|-----------------------|
| GET    | `/`                        | Health check          |
| GET    | `/api/stats`               | Dashboard stats       |
| POST   | `/api/tickets`             | Create ticket         |
| GET    | `/api/tickets`             | List tickets (filter/search/paginate) |
| GET    | `/api/tickets/{ticket_id}` | Get ticket + notes    |
| PUT    | `/api/tickets/{ticket_id}` | Update status/priority/add note |
| DELETE | `/api/tickets/{ticket_id}` | Delete ticket         |

### Query params for GET /api/tickets

- `status` — Open | In Progress | Closed
- `priority` — Low | Medium | High | Urgent
- `search` — text search
- `page` — page number (default 1)
- `limit` — results per page (default 20)

---

## Deployment

### Backend → Railway

1. Go to [railway.app](https://railway.app) and create a new project
2. Connect your GitHub repo, select the `backend/` folder (or set root to `backend/`)
3. Railway auto-detects Python via nixpacks
4. Set environment variable: `DB_PATH=crm.db`
5. Note your Railway URL (e.g. `https://your-app.up.railway.app`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com), import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-app.up.railway.app`
4. Deploy

---

## Database Schema

```sql
CREATE TABLE tickets (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id      TEXT UNIQUE NOT NULL,        -- e.g. TKT-4829
    customer_name  TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    subject        TEXT NOT NULL,
    description    TEXT NOT NULL,
    status         TEXT DEFAULT 'Open',         -- Open | In Progress | Closed
    priority       TEXT DEFAULT 'Medium',       -- Low | Medium | High | Urgent
    created_at     TIMESTAMP,
    updated_at     TIMESTAMP
);

CREATE TABLE notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id  TEXT NOT NULL REFERENCES tickets(ticket_id),
    note_text  TEXT NOT NULL,
    author     TEXT DEFAULT 'Support Agent',
    created_at TIMESTAMP
);
```

---

## .env.example

**backend/.env.example**
```
DB_PATH=crm.db
PORT=8000
```

**frontend/.env.example**
```
VITE_API_URL=
```
