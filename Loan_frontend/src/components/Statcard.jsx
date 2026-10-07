export default function StatCard({ label, value, icon, color = "text-indigo-600", bg = "bg-indigo-50" }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-lg text-lg ${bg}`}>{icon}</span>
      </div>
      <p className={`mt-3 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}