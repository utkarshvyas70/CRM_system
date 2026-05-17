import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Plus, Headphones, X, Menu } from 'lucide-react'

const navItems = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tickets/new', icon: Plus,            label: 'New Ticket' },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-surface">

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        w-64 bg-surface-card border-r border-surface-border
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:w-56
      `}>
        <div className="px-5 py-5 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
              <Headphones size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">SupportDesk</p>
              <p className="text-[10px] text-slate-500 mt-0.5">CRM System</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-border transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400 border border-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-border/50'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-surface-border">
          <p className="text-[10px] text-slate-600 font-mono">v1.0.0 · Datastraw</p>
        </div>
      </aside>

      <header className="md:hidden fixed top-0 left-0 right-0 z-20 bg-surface-card border-b border-surface-border h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-border transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand-600 rounded-md flex items-center justify-center">
            <Headphones size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white">SupportDesk</span>
        </div>
      </header>

      <main className="flex-1 md:ml-56 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 md:px-8 py-5 md:py-8 animate-fade-in">
          {children}
        </div>
      </main>

    </div>
  )
}