import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";

const inr = (n) => "₹ " + Math.round(n).toLocaleString("en-IN");

// DEMO DATA: baad me API se aayega
const loans = [
  { id: 1, broker: "Sharma Finance", method: "Reducing", amount: 100000, emi: 8885, paid: 8, total: 12, nextDue: "05 Nov 2026" },
  { id: 2, broker: "Verma Lenders", method: "Flat", amount: 50000, emi: 4583, paid: 3, total: 12, nextDue: "12 Nov 2026" },
];

const offers = [
  { id: 1, broker: "Sharma Finance", method: "Reducing", rate: 12, min: 10000, max: 200000, months: "6-24" },
  { id: 2, broker: "Verma Lenders", method: "Flat", rate: 10, min: 5000, max: 100000, months: "3-12" },
  { id: 3, broker: "Gupta Capital", method: "Reducing", rate: 14, min: 20000, max: 500000, months: "12-60" },
];

const badge = (m) =>
  m === "Flat" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";

export default function ClientDashboard() {
  const { user } = useAuth();

  const borrowed = loans.reduce((s, l) => s + l.amount, 0);
  const outstanding = loans.reduce((s, l) => s + l.emi * (l.total - l.paid), 0);
  const nextEmi = loans.reduce((s, l) => s + l.emi, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Namaste, {user.name} 👋</h1>
      <p className="mt-1 text-sm text-slate-500">Yahan tumhare loans aur offers ka hisaab hai</p>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Loans" value={loans.length} icon="📄" />
        <StatCard label="Total Borrowed" value={inr(borrowed)} icon="💰" color="text-violet-600" bg="bg-violet-50" />
        <StatCard label="Outstanding" value={inr(outstanding)} icon="📉" color="text-rose-600" bg="bg-rose-50" />
        <StatCard label="EMI This Month" value={inr(nextEmi)} icon="🗓️" color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* My loans */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">My Loans</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {loans.map((l) => {
            const pct = Math.round((l.paid / l.total) * 100);
            return (
              <div key={l.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{l.broker}</p>
                    <p className="text-sm text-slate-500">Loan of {inr(l.amount)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(l.method)}`}>{l.method}</span>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>{l.paid} of {l.total} EMIs paid</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="text-slate-500">Next due: <b className="text-slate-800">{l.nextDue}</b></span>
                  <span className="font-semibold text-indigo-600">{inr(l.emi)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Offers */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Available Offers</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {offers.map((o) => (
            <div key={o.id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{o.broker}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge(o.method)}`}>{o.method}</span>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-indigo-600">{o.rate}% <span className="text-sm font-medium text-slate-400">/ year</span></p>
              <ul className="mt-3 flex-1 space-y-1 text-sm text-slate-600">
                <li>Amount: {inr(o.min)} - {inr(o.max)}</li>
                <li>Duration: {o.months} months</li>
              </ul>
              <button className="mt-4 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
                Apply
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}