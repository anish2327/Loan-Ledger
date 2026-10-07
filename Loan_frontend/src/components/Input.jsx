import { useState } from "react";

export default function Input({ label, type = "text", error, ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <input
          type={isPassword && show ? "text" : type}
          {...props}
          className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
          } ${isPassword ? "pr-16" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-4 text-xs font-semibold text-slate-500 hover:text-indigo-600"
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}