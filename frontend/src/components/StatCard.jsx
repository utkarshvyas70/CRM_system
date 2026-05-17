export default function StatCard({ label, value, icon: Icon, color = 'blue', sub }) {
  const colorMap = {
    blue:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
    green:  'text-green-400 bg-green-500/10 border-green-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    slate:  'text-slate-400 bg-slate-500/10 border-slate-500/20',
  }

  return (
    <div className="card p-5 flex items-start gap-4 animate-slide-up">
      <div className={`p-2.5 rounded-lg border ${colorMap[color]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold text-white tabular-nums">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-slate-600 mt-1">{sub}</p>}
      </div>
    </div>
  )
}
