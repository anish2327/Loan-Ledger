import { useState } from "react";
import api from "../api";
import Input from "./Input";

const inr = (n) => "₹ " + Math.round(n).toLocaleString("en-IN");

const SAMPLE = 100000;

const flatCalc = (p, rate, n) => {
  const interest = (p * rate * n) / 1200;
  return { emi: (p + interest) / n, interest };
};

const reducingCalc = (p, rate, n) => {
  const r = rate / 1200;
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return { emi, interest: emi * n - p };
};

const methods = [
  { id: "Flat", title: "Flat Interest", desc: "Fixed interest added to every EMI" },
  { id: "Reducing", title: "Reducing Balance", desc: "Interest on the remaining principal" },
];

export default function CreateOfferModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    method: "Reducing",
    rate: "12",
    local: "",
    min: "10000",
    max: "200000",
    minMonths: "6",
    maxMonths: "24",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    setServerError("");
  };

  const rate = Number(form.rate);
  const local = form.method === "Flat" ? Number(form.local) || 0 : 0;
  const months = Number(form.minMonths);
  const canPreview = rate > 0 && months > 0;

  const preview = canPreview
    ? form.method === "Flat"
      ? flatCalc(SAMPLE, rate + local, months)
      : reducingCalc(SAMPLE, rate, months)
    : null;

  const validate = () => {
    const e = {};
    if (!(rate > 0 && rate <= 60)) e.rate = "Rate must be above 0 and up to 60.";
    if (local < 0 || local > 60) e.local = "Local interest must be between 0 and 60.";
    if (!(Number(form.min) > 0)) e.min = "Enter a valid amount.";
    if (Number(form.max) <= Number(form.min)) e.max = "Max amount must be greater than min amount.";
    if (!(Number(form.minMonths) >= 1)) e.minMonths = "Minimum duration is 1 month.";
    if (Number(form.maxMonths) < Number(form.minMonths)) e.maxMonths = "Max months cannot be less than min months.";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError("");

    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const { data } = await api.post("/offers", {
        method: form.method,
        rate,
        localInterest: local,
        minAmount: Number(form.min),
        maxAmount: Number(form.max),
        minMonths: Number(form.minMonths),
        maxMonths: Number(form.maxMonths),
      });

      onCreated(data.offer);
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Could not connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create Offer</h2>
            <p className="mt-1 text-sm text-slate-500">Clients will see this offer on their dashboard.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          {/* Method */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Interest method</p>
            <div className="grid grid-cols-2 gap-3">
              {methods.map((m) => {
                const active = form.method === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setForm({ ...form, method: m.id })}
                    className={`rounded-xl border-2 p-3 text-left transition ${
                      active ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${active ? "text-indigo-700" : "text-slate-900"}`}>{m.title}</p>
                    <p className="text-xs text-slate-500">{m.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rates */}
          <div className={`grid gap-3 ${form.method === "Flat" ? "grid-cols-2" : "grid-cols-1"}`}>
            <Input label="Interest rate (% per year)" type="number" step="0.1" name="rate" value={form.rate} onChange={change} error={errors.rate} />
            {form.method === "Flat" && (
              <Input label="Local interest (+ % per year)" type="number" step="0.1" name="local" value={form.local} onChange={change} error={errors.local} placeholder="0" />
            )}
          </div>

          {/* Amount range */}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Min amount (₹)" type="number" name="min" value={form.min} onChange={change} error={errors.min} />
            <Input label="Max amount (₹)" type="number" name="max" value={form.max} onChange={change} error={errors.max} />
          </div>

          {/* Months range */}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Min months" type="number" name="minMonths" value={form.minMonths} onChange={change} error={errors.minMonths} />
            <Input label="Max months" type="number" name="maxMonths" value={form.maxMonths} onChange={change} error={errors.maxMonths} />
          </div>

          {/* Live preview */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
              Preview: {inr(SAMPLE)} for {canPreview ? months : "-"} months
            </p>
            {preview ? (
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-extrabold">{inr(preview.emi)}</p>
                  <p className="text-xs text-indigo-200">per month</p>
                </div>
                <p className="text-right text-sm text-indigo-100">
                  Total interest
                  <br />
                  <b className="text-base">{inr(preview.interest)}</b>
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-indigo-100">Enter a rate and duration to see the EMI.</p>
            )}
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100">
              {serverError}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Cancel
            </button>
            <button
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Publishing..." : "Publish Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}