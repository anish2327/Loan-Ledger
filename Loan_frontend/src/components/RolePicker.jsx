const roles = [
  { id: "client", icon: "🧑", title: "Client", desc: "Apply for loans" },
  { id: "broker", icon: "🏦", title: "Broker", desc: "Give loan offers" },
];

export default function RolePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {roles.map((r) => {
        const active = value === r.id;
        return (
          <button
            type="button"
            key={r.id}
            onClick={() => onChange(r.id)}
            className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
              active
                ? "border-indigo-600 bg-indigo-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-indigo-300"
            }`}
          >
            <span className="text-2xl">{r.icon}</span>
            <span>
              <p className={`text-sm font-semibold ${active ? "text-indigo-700" : "text-slate-900"}`}>{r.title}</p>
              <p className="text-xs text-slate-500">{r.desc}</p>
            </span>
          </button>
        );
      })}
    </div>
  );
}