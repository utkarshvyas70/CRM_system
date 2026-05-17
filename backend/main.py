from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import sqlite3
import random
import string
import os

app = FastAPI(title="Support CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.environ.get("DB_PATH", "crm.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            subject TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'Open' CHECK(status IN ('Open', 'In Progress', 'Closed')),
            priority TEXT DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High', 'Urgent')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id TEXT NOT NULL,
            note_text TEXT NOT NULL,
            author TEXT DEFAULT 'Support Agent',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
        )
    """)
    conn.commit()
    conn.close()


init_db()


def generate_ticket_id():
    suffix = ''.join(random.choices(string.digits, k=4))
    return f"TKT-{suffix}"


# --- Models ---

class TicketCreate(BaseModel):
    customer_name: str
    customer_email: str
    subject: str
    description: str
    priority: Optional[str] = "Medium"


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    note: Optional[str] = None
    note_author: Optional[str] = "Support Agent"


# --- Endpoints ---

@app.get("/")
def root():
    return {"message": "Support CRM API is running", "version": "1.0.0"}


@app.post("/api/tickets", status_code=201)
def create_ticket(ticket: TicketCreate):
    conn = get_db()
    cur = conn.cursor()

    # Generate unique ticket ID
    ticket_id = generate_ticket_id()
    for _ in range(10):
        cur.execute("SELECT id FROM tickets WHERE ticket_id = ?", (ticket_id,))
        if not cur.fetchone():
            break
        ticket_id = generate_ticket_id()

    now = datetime.utcnow().isoformat()
    cur.execute("""
        INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, priority, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'Open', ?, ?, ?)
    """, (ticket_id, ticket.customer_name, ticket.customer_email,
          ticket.subject, ticket.description, ticket.priority or "Medium", now, now))
    conn.commit()
    conn.close()
    return {"ticket_id": ticket_id, "created_at": now, "message": "Ticket created successfully"}


@app.get("/api/tickets")
def list_tickets(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    conn = get_db()
    cur = conn.cursor()

    query = "SELECT ticket_id, customer_name, customer_email, subject, status, priority, created_at, updated_at FROM tickets WHERE 1=1"
    params = []

    if status:
        query += " AND status = ?"
        params.append(status)

    if priority:
        query += " AND priority = ?"
        params.append(priority)

    if search:
        like = f"%{search}%"
        query += " AND (customer_name LIKE ? OR customer_email LIKE ? OR ticket_id LIKE ? OR subject LIKE ? OR description LIKE ?)"
        params.extend([like, like, like, like, like])

    # Count total for pagination
    count_cur = conn.cursor()
    count_query = query.replace(
        "SELECT ticket_id, customer_name, customer_email, subject, status, priority, created_at, updated_at",
        "SELECT COUNT(*)"
    )
    count_cur.execute(count_query, params)
    total = count_cur.fetchone()[0]

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, (page - 1) * limit])
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    return {
        "tickets": [dict(r) for r in rows],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@app.get("/api/tickets/{ticket_id}")
def get_ticket(ticket_id: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tickets WHERE ticket_id = ?", (ticket_id,))
    ticket = cur.fetchone()
    if not ticket:
        conn.close()
        raise HTTPException(status_code=404, detail="Ticket not found")

    cur.execute("SELECT * FROM notes WHERE ticket_id = ? ORDER BY created_at ASC", (ticket_id,))
    notes = [dict(n) for n in cur.fetchall()]
    conn.close()

    result = dict(ticket)
    result["notes"] = notes
    return result


@app.put("/api/tickets/{ticket_id}")
def update_ticket(ticket_id: str, body: TicketUpdate):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id FROM tickets WHERE ticket_id = ?", (ticket_id,))
    if not cur.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Ticket not found")

    now = datetime.utcnow().isoformat()
    updates = []
    params = []

    if body.status:
        updates.append("status = ?")
        params.append(body.status)

    if body.priority:
        updates.append("priority = ?")
        params.append(body.priority)

    if updates:
        updates.append("updated_at = ?")
        params.append(now)
        params.append(ticket_id)
        cur.execute(f"UPDATE tickets SET {', '.join(updates)} WHERE ticket_id = ?", params)

    if body.note and body.note.strip():
        cur.execute(
            "INSERT INTO notes (ticket_id, note_text, author, created_at) VALUES (?, ?, ?, ?)",
            (ticket_id, body.note.strip(), body.note_author or "Support Agent", now)
        )

    conn.commit()
    conn.close()
    return {"success": True, "updated_at": now}


@app.delete("/api/tickets/{ticket_id}")
def delete_ticket(ticket_id: str):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM tickets WHERE ticket_id = ?", (ticket_id,))
    if not cur.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Ticket not found")
    cur.execute("DELETE FROM notes WHERE ticket_id = ?", (ticket_id,))
    cur.execute("DELETE FROM tickets WHERE ticket_id = ?", (ticket_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Ticket deleted"}


@app.get("/api/stats")
def get_stats():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT status, COUNT(*) as count FROM tickets GROUP BY status")
    status_counts = {row["status"]: row["count"] for row in cur.fetchall()}
    cur.execute("SELECT COUNT(*) as total FROM tickets")
    total = cur.fetchone()["total"]
    cur.execute("SELECT COUNT(*) as count FROM tickets WHERE DATE(created_at) = DATE('now')")
    today = cur.fetchone()["count"]
    conn.close()
    return {
        "total": total,
        "open": status_counts.get("Open", 0),
        "in_progress": status_counts.get("In Progress", 0),
        "closed": status_counts.get("Closed", 0),
        "today": today
    }