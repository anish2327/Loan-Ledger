import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";

const inr = (n) => "₹ " + Math.round(n).toLocaleString("en-IN");

const badge = (m) =>
  m === "Flat" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";

const duration = (o) =>
  o.minMonths === o.maxMonths ? `${o.minMonths} months` : `${o.minMonths}-${o.maxMonths} months`;

export default function ClientDashboard() {
  const { user } = useAuth();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Load the active offers from all brokers when the page opens
  useEffect(() => {
    let cancelled = false;

    api
      .get("/offers")
      .then(({ data }) => {
        if (!cancelled) setOffers(data.offers);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.response?.data?.message || "Could not load offers. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Hello, {user.name} 👋</h1>
      <p className="mt-1 text-sm text-slate-500">Here is a summary of your loans and offers.</p>

      {/* Stats: these fill in once loans exist */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Loans" value="0" icon="📄" />
        <StatCard label="Total Borrowed" value={inr(0)} icon="💰" color="text-violet-600" bg="bg-violet-50" />
        <StatCard label="Amount Due" value={inr(0)} icon="📉" color="text-rose-600" bg="bg-rose-50" />
        <StatCard label="EMI This Month" value={inr(0)} icon="🗓️" color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* My loans */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">My Loans</h2>
        <div className="mt-4">
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 ring-1 ring-slate-100">
            You have no loans yet.
          </p>
        </div>
      </section>

      {/* Offers */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Available Offers</h2>

        <div className="mt-4">
          {loading && (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 ring-1 ring-slate-100">
              Loading offers...
            </p>
          )}

          {!loading && loadError && (
            <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-100">{loadError}</p>
          )}

          {!loading && !loadError && offers.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 ring-1 ring-slate-100">
              No offers available right now. Please check back later.
            </p>
          )}

          {offers.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {offers.map((o) => (
                <div key={o.id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-slate-900">{o.brokerName}</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge(o.method)}`}>
                      {o.method}
                    </span>
                  </div>

                  <p className="mt-3 text-3xl font-extrabold text-indigo-600">
                    {o.rate}%
                    {o.localInterest > 0 && (
                      <span className="text-base font-bold text-amber-600"> + {o.localInterest}% local</span>
                    )}
                    <span className="text-sm font-medium text-slate-400"> per year</span>
                  </p>

                  <ul className="mt-3 flex-1 space-y-1 text-sm text-slate-600">
                    <li>Amount: {inr(o.minAmount)} - {inr(o.maxAmount)}</li>
                    <li>Duration: {duration(o)}</li>
                  </ul>

                  {/* Enabled in the next step, when loan applications are built */}
                  <button
                    disabled
                    className="mt-4 cursor-not-allowed rounded-xl bg-slate-200 py-2 text-sm font-semibold text-slate-500"
                  >
                    Apply Now (coming soon)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}