import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const inr = (n) => "₹ " + Math.round(n).toLocaleString("en-IN");

const flatCalc = (p, rate, n) => {
  const interest = (p * rate * n) / (12 * 100);
  return { emi: (p + interest) / n, interest };
};

const reducingCalc = (p, rate, n) => {
  const r = rate / 12 / 100;
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return { emi, interest: emi * n - p };
};

const roles = [
  {
    key: "client",
    icon: "🧑",
    title: "For Clients",
    steps: [
      "Sign up and choose the Client role",
      "Browse and compare loan offers from brokers",
      "Apply for a loan and track your EMIs",
    ],
  },
  {
    key: "broker",
    icon: "🏦",
    title: "For Brokers",
    steps: [
      "Sign up and choose the Broker role",
      "Create Flat or Reducing Balance loan offers",
      "Review requests and track repayments",
    ],
  },
];

function Slider({ label, value, min, max, step, onChange, format }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-indigo-600">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-600"
      />
    </div>
  );
}

function Result({ title, tag, data, highlight }) {
  return (
    <div className={`rounded-2xl p-5 ${highlight ? "bg-indigo-600 text-white" : "bg-slate-50 ring-1 ring-slate-200"}`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${highlight ? "text-indigo-200" : "text-slate-500"}`}>{tag}</p>
      <p className="mt-1 text-lg font-bold">{title}</p>
      <p className="mt-4 text-3xl font-extrabold">{inr(data.emi)}</p>
      <p className={`text-xs ${highlight ? "text-indigo-200" : "text-slate-500"}`}>per month</p>
      <p className={`mt-3 text-sm ${highlight ? "text-indigo-100" : "text-slate-600"}`}>
        Total interest: <b>{inr(data.interest)}</b>
      </p>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(12);
  const [months, setMonths] = useState(12);

  const flat = flatCalc(amount, rate, months);
  const reducing = reducingCalc(amount, rate, months);
  const saving = flat.interest - reducing.interest;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 py-20 text-white">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <span className="rounded-full bg-white/15 px-4 py-1 text-xs font-semibold ring-1 ring-white/30">
            Brokers and clients on one platform
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">
            Loan management, <br className="hidden md:block" /> made simple
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-indigo-100">
            Brokers publish loan offers and clients apply for them. Track EMIs, interest and the remaining balance in one place.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {user ? (
              <Link to={`/${user.role}`} className="rounded-xl bg-white px-7 py-3 font-semibold text-indigo-700 shadow-lg hover:bg-indigo-50">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="rounded-xl bg-white px-7 py-3 font-semibold text-indigo-700 shadow-lg hover:bg-indigo-50">
                  Get Started
                </Link>
                <Link to="/login" className="rounded-xl border border-white/60 px-7 py-3 font-semibold hover:bg-white/10">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* EMI Calculator */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-slate-900">Flat vs Reducing: compare them yourself</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500">
          Move the sliders to see how the EMI and total interest change with each method.
        </p>

        <div className="mt-10 grid gap-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100 md:p-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <Slider label="Loan amount" value={amount} min={10000} max={1000000} step={5000} onChange={setAmount} format={inr} />
            <Slider label="Interest rate (per year)" value={rate} min={1} max={36} step={0.5} onChange={setRate} format={(v) => `${v}%`} />
            <Slider label="Duration" value={months} min={3} max={60} step={1} onChange={setMonths} format={(v) => `${v} months`} />
          </div>

          <div className="lg:col-span-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <Result tag="Method 1" title="Flat Interest" data={flat} />
              <Result tag="Method 2" title="Reducing Balance" data={reducing} highlight />
            </div>
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">
              With Reducing Balance, the client pays <b>{inr(saving)}</b> less in interest.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-slate-900">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {roles.map((r) => (
              <div key={r.key} className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <span className="text-2xl">{r.icon}</span> {r.title}
                </h3>
                <ol className="mt-5 space-y-4">
                  {r.steps.map((s, i) => (
                    <li key={s} className="flex items-center gap-3 text-sm text-slate-700">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}