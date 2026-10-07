import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import CreateOfferModal from "../components/CreateOfferModal";
import ConfirmDialog from "../components/ConfirmDialog";

const inr = (n) => "₹ " + Math.round(n).toLocaleString("en-IN");

const badge = (m) =>
  m === "Flat" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";

const duration = (o) =>
  o.minMonths === o.maxMonths ? `${o.minMonths} months` : `${o.minMonths}-${o.maxMonths} months`;

export default function BrokerDashboard() {
  const { user } = useAuth();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [toggleErrors, setToggleErrors] = useState({});

  // Delete flow: which offer is waiting for confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Load the broker's offers when the page opens
  useEffect(() => {
    let cancelled = false;

    api
      .get("/offers/mine")
      .then(({ data }) => {
        if (!cancelled) setOffers(data.offers);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.response?.data?.message || "Could not load your offers. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreated = (offer) => {
    setOffers((prev) => [offer, ...prev]);
    setShowModal(false);
  };

  const toggle = async (id) => {
    setTogglingId(id);
    setToggleErrors((prev) => ({ ...prev, [id]: "" }));

    try {
      const { data } = await api.patch(`/offers/${id}/toggle`);
      setOffers((prev) => prev.map((o) => (o.id === id ? data.offer : o)));
    } catch (err) {
      setToggleErrors((prev) => ({
        ...prev,
        [id]: err.response?.data?.message || "Could not update this offer.",
      }));
    } finally {
      setTogglingId(null);
    }
  };

  const askDelete = (offer) => {
    setDeleteError("");
    setDeleteTarget(offer);
  };

  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError("");

    try {
      await api.delete(`/offers/${deleteTarget.id}`);
      setOffers((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Could not delete this offer. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {user.name} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your offers, loan requests and clients.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:opacity-95"
        >
          + Create Offer
        </button>
      </div>

      {/* Stats: these fill in once loans exist */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Clients" value="0" icon="👥" />
        <StatCard label="Money Lent" value={inr(0)} icon="💸" color="text-violet-600" bg="bg-violet-50" />
        <StatCard label="Interest Earned" value={inr(0)} icon="📈" color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Amount to Collect" value={inr(0)} icon="⏳" color="text-rose-600" bg="bg-rose-50" />
      </div>

      {/* Offers + Requests */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">My Offers</h2>
          <div className="mt-4 space-y-3">
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
                You have not created any offers yet.
              </p>
            )}

            {offers.map((o) => (
              <div
                key={o.id}
                className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition ${
                  o.isActive ? "" : "opacity-60"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(o.method)}`}>{o.method}</span>
                    {!o.isActive && (
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        Paused
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggle(o.id)}
                      disabled={togglingId === o.id}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {togglingId === o.id ? "Updating..." : o.isActive ? "Pause" : "Resume"}
                    </button>
                    <button
                      onClick={() => askDelete(o)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-2xl font-extrabold text-indigo-600">
                  {o.rate}%
                  {o.localInterest > 0 && (
                    <span className="text-base font-bold text-amber-600"> + {o.localInterest}% local</span>
                  )}
                  <span className="text-sm font-medium text-slate-400"> per year</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {inr(o.minAmount)} - {inr(o.maxAmount)} &middot; {duration(o)}
                </p>

                {toggleErrors[o.id] && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 ring-1 ring-red-100">
                    {toggleErrors[o.id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Loan Requests</h2>
          <div className="mt-4">
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 ring-1 ring-slate-100">
              No pending requests yet.
            </p>
          </div>
        </section>
      </div>

      {/* Clients */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">My Clients</h2>
        <div className="mt-4">
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 ring-1 ring-slate-100">
            No clients yet.
          </p>
        </div>
      </section>

      {showModal && <CreateOfferModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this offer?"
          message={`Clients will no longer see this ${deleteTarget.method} offer (${deleteTarget.rate}%). Existing loans are not affected.`}
          confirmText="Delete"
          loadingText="Deleting..."
          loading={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}