import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { api } from '../api.js'
import toast from 'react-hot-toast'

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']

export default function NewTicket() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customer_name:  '',
    customer_email: '',
    subject:        '',
    description:    '',
    priority:       'Medium',
  })
  const [errors, setErrors] = useState({})

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.customer_name.trim())  e.customer_name  = 'Customer name is required'
    if (!form.customer_email.trim()) e.customer_email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.customer_email)) e.customer_email = 'Enter a valid email'
    if (!form.subject.trim())        e.subject        = 'Subject is required'
    if (!form.description.trim())    e.description    = 'Description is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await api.createTicket(form)
      toast.success(`Ticket ${res.ticket_id} created!`)
      navigate(`/tickets/${res.ticket_id}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4">
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>
        <h1 className="text-xl font-semibold text-white">Create New Ticket</h1>
        <p className="text-sm text-slate-400 mt-0.5">Fill in the details below to open a support ticket</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Customer info */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-surface-border">
            Customer Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Customer Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.customer_name}
                onChange={e => set('customer_name', e.target.value)}
                className={`input ${errors.customer_name ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.customer_name && <p className="text-xs text-red-400 mt-1">{errors.customer_name}</p>}
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={form.customer_email}
                onChange={e => set('customer_email', e.target.value)}
                className={`input ${errors.customer_email ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.customer_email && <p className="text-xs text-red-400 mt-1">{errors.customer_email}</p>}
            </div>
          </div>
        </div>

        {/* Issue details */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-surface-border">
            Issue Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Subject</label>
              <input
                type="text"
                placeholder="Brief summary of the issue"
                value={form.subject}
                onChange={e => set('subject', e.target.value)}
                className={`input ${errors.subject ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject}</p>}
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                rows={5}
                placeholder="Describe the issue in detail..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
                className={`input resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
            </div>
            <div>
              <label className="label">Priority</label>
              <div className="flex gap-2 flex-wrap">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set('priority', p)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-150 font-medium ${
                      form.priority === p
                        ? 'bg-brand-600 border-brand-500 text-white'
                        : 'bg-surface border-surface-border text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-surface-border">
          <Link to="/" className="btn-secondary flex-1 justify-center">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Creating...</> : <><Send size={15} /> Create Ticket</>}
          </button>
        </div>
      </form>
    </div>
  )
}
