const features = [
  "Flat interest with an optional local interest",
  "Bank-style reducing balance interest",
  "Live EMI and balance tracking",
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Left: branding panel (large screens only) */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-12 text-white lg:flex lg:flex-col lg:justify-center">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight">
            Lend smarter.
            <br />
            Borrow easier.
          </h2>
          <p className="mt-4 text-indigo-100">
            Brokers publish their loan offers and clients apply for them. All EMI and interest details stay in one place.
          </p>

          <ul className="mt-8 space-y-3 text-sm">
            {features.map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20 text-xs">✓</span>
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl bg-white/15 p-5 ring-1 ring-white/25 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-indigo-100">Sample EMI</p>
            <p className="mt-1 text-3xl font-bold">
              ₹ 4,583 <span className="text-sm font-medium text-indigo-100">/ month</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-2/3 rounded-full bg-white" />
            </div>
            <p className="mt-2 text-xs text-indigo-100">8 of 12 EMIs paid</p>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center bg-white px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="mb-7 mt-2 text-sm text-slate-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}