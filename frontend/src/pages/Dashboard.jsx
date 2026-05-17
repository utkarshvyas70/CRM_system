import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Ticket, CheckCircle, AlertCircle, RefreshCw, ChevronRight, X } from 'lucide-react'
import { format } from 'date-fns'
import { api } from '../api.js'
import { StatusBadge, PriorityBadge } from '../components/Badges.jsx'
import StatCard from '../components/StatCard.jsx'
import toast from 'react-hot-toast'

const STATUSES   = ['Open', 'In Progress', 'Closed']
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']

export default function Dashboard() {
  const [tickets, setTickets]   = useState([])
  const [stats, setStats]       = useState(null)
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('')
  const [priority, setPriority] = useState('')
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState({ total: 0, pages: 1 })
  const [loading, setLoading]   = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [td, st] = await Promise.all([
        api.getTickets({ search, status, priority, page, limit: 15 }),
        api.getStats(),
      ])
      setTickets(td.tickets)
      setMeta({ total: td.total, pages: td.pages })
      setStats(st)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, status, priority, page])

  useEffect(() => {
    const t = setTimeout(fetchData, 300)
    return () => clearTimeout(t)
  }, [fetchData])

  useEffect(() => setPage(1), [search, status, priority])

  const clearFilters = () => { setSearch(''); setStatus(''); setPriority('') }
  const hasFilters   = search || status || priority

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-white">Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Manage and track support tickets</p>
        </div>
        <Link to="/tickets/new" className="btn-primary shrink-0 text-xs sm:text-sm px-3 sm:px-4">
          <Plus size={15} />
          <span className="hidden xs:inline">New Ticket</span>
          <span className="xs:hidden">New</span>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total"       value={stats.total}       icon={Ticket}      color="slate" />
          <StatCard label="Open"        value={stats.open}        icon={AlertCircle} color="blue"  />
          <StatCard label="In Progress" value={stats.in_progress} icon={RefreshCw}   color="amber" />
          <StatCard label="Closed"      value={stats.closed}      icon={CheckCircle} color="green" />
        </div>
      )}

      {/* Search + Filters */}
      <div className="card p-3 sm:p-4 space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 pr-9 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-2">
          {/* Status pills */}
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 self-center">Status:</span>
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatus(status === s ? '' : s)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  status === s
                    ? 'bg-brand-600 border-brand-500 text-white'
                    : 'border-surface-border text-slate-400 hover:border-slate-500 hover:text-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Priority pills */}
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 self-center">Priority:</span>
            {PRIORITIES.map(p => (
              <button
                key={p}
                onClick={() => setPriority(priority === p ? '' : p)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  priority === p
                    ? 'bg-brand-600 border-brand-500 text-white'
                    : 'border-surface-border text-slate-400 hover:border-slate-500 hover:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 underline self-center ml-auto">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Ticket List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 text-sm gap-2">
            <RefreshCw size={16} className="animate-spin" /> Loading...
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Ticket size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium text-sm">No tickets found</p>
            <p className="text-slate-600 text-xs mt-1">
              {hasFilters ? 'Try adjusting your filters' : 'Create your first ticket to get started'}
            </p>
            {!hasFilters && (
              <Link to="/tickets/new" className="btn-primary mt-4 mx-auto w-fit text-xs">
                <Plus size={14} /> Create Ticket
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['Ticket ID','Customer','Subject','Status','Priority','Date',''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {tickets.map(ticket => (
                    <tr key={ticket.ticket_id} className="hover:bg-surface-border/20 transition-colors group">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-brand-400">{ticket.ticket_id}</span>
                      </td>
                      <td className="px-4 py-3 max-w-[130px]">
                        <p className="font-medium text-white text-xs truncate">{ticket.customer_name}</p>
                        <p className="text-slate-500 text-xs truncate">{ticket.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="text-slate-300 text-xs truncate">{ticket.subject}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {format(new Date(ticket.created_at), 'MMM d, yy')}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/tickets/${ticket.ticket_id}`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white">
                          <ChevronRight size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-surface-border">
              {tickets.map(ticket => (
                <Link
                  key={ticket.ticket_id}
                  to={`/tickets/${ticket.ticket_id}`}
                  className="flex items-start gap-3 px-4 py-4 hover:bg-surface-border/20 active:bg-surface-border/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs text-brand-400">{ticket.ticket_id}</span>
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                    <p className="text-sm font-medium text-white truncate">{ticket.subject}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{ticket.customer_name} · {ticket.customer_email}</p>
                    <p className="text-xs text-slate-600 mt-1">{format(new Date(ticket.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 mt-1 shrink-0" />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {meta.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border">
                <span className="text-xs text-slate-500">{meta.total} tickets</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                    className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Prev</button>
                  <span className="text-xs text-slate-400">{page}/{meta.pages}</span>
                  <button onClick={() => setPage(p => Math.min(meta.pages, p+1))} disabled={page===meta.pages}
                    className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}