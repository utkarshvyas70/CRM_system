import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Loader2, Save, Trash2, MessageSquare,
  User, Mail, Calendar, Clock, Tag, RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { api } from '../api.js'
import { StatusBadge, PriorityBadge } from '../components/Badges.jsx'
import toast from 'react-hot-toast'

const STATUSES    = ['Open', 'In Progress', 'Closed']
const PRIORITIES  = ['Low', 'Medium', 'High', 'Urgent']

export default function TicketDetail() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const [ticket, setTicket]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm]       = useState({ status: '', priority: '', note: '', note_author: 'Support Agent' })

  const load = async () => {
    setLoading(true)
    try {
      const t = await api.getTicket(id)
      setTicket(t)
      setForm(f => ({ ...f, status: t.status, priority: t.priority }))
    } catch (e) {
      toast.error(e.message)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateTicket(id, {
        status:      form.status,
        priority:    form.priority,
        note:        form.note,
        note_author: form.note_author,
      })
      toast.success('Ticket updated successfully')
      setForm(f => ({ ...f, note: '' }))
      await load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete ticket ${id}? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await api.deleteTicket(id)
      toast.success('Ticket deleted')
      navigate('/')
    } catch (e) {
      toast.error(e.message)
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-slate-500">
      <Loader2 size={24} className="animate-spin mr-2" /> Loading ticket...
    </div>
  )

  if (!ticket) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-3">
            <ArrowLeft size={15} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-lg">
              {ticket.ticket_id}
            </span>
            <StatusBadge   status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="text-xl font-semibold text-white mt-2">{ticket.subject}</h1>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-danger shrink-0"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Delete
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: ticket details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Description</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Notes timeline */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={15} className="text-slate-400" />
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Activity & Notes ({ticket.notes?.length || 0})
              </h2>
            </div>

            {ticket.notes?.length === 0 ? (
              <p className="text-sm text-slate-600 italic">No notes yet. Add one below.</p>
            ) : (
              <div className="space-y-4">
                {ticket.notes.map((note, i) => (
                  <div key={note.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-semibold text-brand-400">
                          {note.author?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {i < ticket.notes.length - 1 && (
                        <div className="flex-1 w-px bg-surface-border mt-1" />
                      )}
                    </div>
                    <div className="pb-4 min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-300">{note.author}</span>
                        <span className="text-[11px] text-slate-600">
                          {format(new Date(note.created_at), 'MMM d, yyyy · h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{note.note_text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add note form */}
            <form onSubmit={handleUpdate} className="mt-5 pt-5 border-t border-surface-border space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="input"
                  >
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="input"
                  >
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Agent Name</label>
                <input
                  type="text"
                  value={form.note_author}
                  onChange={e => setForm(f => ({ ...f, note_author: e.target.value }))}
                  className="input"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="label">Add Note (optional)</label>
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Write an update or internal note..."
                  className="input resize-none"
                />
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                  : <><Save size={14} /> Save Changes</>
                }
              </button>
            </form>
          </div>
        </div>

        {/* Right: metadata sidebar */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Customer</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={14} className="text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="text-sm text-white font-medium">{ticket.customer_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={14} className="text-slate-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Email</p>
                  <a
                    href={`mailto:${ticket.customer_email}`}
                    className="text-sm text-brand-400 hover:underline break-all"
                  >
                    {ticket.customer_email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar size={14} className="text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Created</p>
                  <p className="text-sm text-slate-300">
                    {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(ticket.created_at), 'h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw size={14} className="text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Last Updated</p>
                  <p className="text-sm text-slate-300">
                    {format(new Date(ticket.updated_at), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(ticket.updated_at), 'h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Quick Update</h2>
            <p className="text-xs text-slate-500">Current status</p>
            <StatusBadge status={ticket.status} />
            <p className="text-xs text-slate-500 mt-2">Current priority</p>
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>
      </div>
    </div>
  )
}
