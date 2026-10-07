import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";

const inr = (n) => "₹ " + Math.round(n).toLocaleString("en-IN");

const badge = (m) =>
  m === "Flat" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";

// DEMO DATA: baad me API se aayega
const offers = [
  { id: 1, method: "Reducing", rate: 12, min: 10000, max: 200000, months: "6-24", applied: 4 },
  { id: 2, method: "Flat", rate: 10, min: 5000, max: 100000, months: "3-12", applied: 2 },
];

const initialRequests = [
  { id: 1, client: "Rahul Mehta", amount: 60000, months: 12, method: "Reducing" },
  { id: 2, client: "Pooja Singh", amount: 25000, months: 6, method: "Flat" },
  { id: 3, client: "Amit Kumar", amount: 120000, months: 24, method: "Reducing" },
];

const initialClients = [
  { id: 1, name: "Neha Sharma", lent: 100000, interest: 12000, outstanding: 48000, paid: 8, total: 12 },
  { id: 2, name: "Vikas Yadav", lent: 50000, interest: 5000, outstanding: 36000, paid: 3, total: 12 },
  { id: 3, name: "Sunita Devi", lent: 200000, interest: 48000, outstanding: 150000, paid: 6, total: 24 },
];

export default function BrokerDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState(initialRequests);
  const [clients, setClients] = useState(initialClients);

  const approve = (r) => {
    setClients([
      ...clients,
      { id: Date.now(), name: r.client, lent: r.amount, interest: 0, outstanding: r.amount, paid: 0, total: r.months },
    ]);
    setRequests(requests.filter((x) => x.id !== r.id));
  };

  const reject = (id) => setRequests(requests.filter((x) => x.id !== id));

  const lent = clients.reduce((s, c) => s + c.lent, 0);
  const earned = clients.reduce((s, c) => s + c.interest, 0);
  const outstanding = clients.reduce((s, c) => s + c.outstanding, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Namaste, {user.name} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Apne clients, offers aur requests manage karo</p>
        </div>
        <button className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:opacity-95">
          + Create Offer
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Clients" value={clients.length} icon="👥" />
        <StatCard label="Money Lent" value={inr(lent)} icon="💸" color="text-violet-600" bg="bg-violet-50" />
        <StatCard label="Interest Earned" value={inr(earned)} icon="📈" color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Outstanding" value={inr(outstanding)} icon="⏳" color="text-rose-600" bg="bg-rose-50" />
      </div>

      {/* Offers + Requests */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">My Offers</h2>
          <div className="mt-4 space-y-3">
            {offers.map((o) => (
              <div key={o.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(o.method)}`}>{o.method}</span>
                  <span className="text-xs text-slate-400">{o.applied} applications</span>
                </div>
                <p className="mt-3 text-2xl font-extrabold text-indigo-600">
                  {o.rate}% <span className="text-sm font-medium text-slate-400">/ year</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {inr(o.min)} - {inr(o.max)} &middot; {o.months} months
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            Loan Requests
            {requests.length > 0 && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">{requests.length}</span>
            )}
          </h2>
          <div className="mt-4 space-y-3">
            {requests.length === 0 && (
              <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 ring-1 ring-slate-100">
                Koi pending request nahi hai 🎉
              </p>
            )}
            {requests.map((r) => (
              <div key={r.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{r.client}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge(r.method)}`}>{r.method}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {inr(r.amount)} for {r.months} months
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => approve(r)}
                    className="rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reject(r.id)}
                    className="rounded-lg border border-slate-300 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Clients table */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">My Clients</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Lent</th>
                <th className="px-5 py-3">Interest</th>
                <th className="px-5 py-3">Outstanding</th>
                <th className="px-5 py-3">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((c) => {
                const pct = Math.round((c.paid / c.total) * 100);
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">{c.name}</td>
                    <td className="px-5 py-4 text-slate-600">{inr(c.lent)}</td>
                    <td className="px-5 py-4 text-emerald-600">{inr(c.interest)}</td>
                    <td className="px-5 py-4 text-rose-600">{inr(c.outstanding)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{c.paid}/{c.total}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}