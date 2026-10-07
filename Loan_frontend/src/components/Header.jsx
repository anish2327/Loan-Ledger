import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? "text-indigo-600" : "text-slate-600 hover:text-indigo-600"
  }`;

function Avatar({ user }) {
  if (user.picture) {
    return <img src={user.picture} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover" />;
  }
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-sm font-bold uppercase text-indigo-700">
      {user.name?.[0] || "U"}
    </span>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Home", end: true },
    ...(user ? [{ to: `/${user.role}`, label: "Dashboard" }] : []),
  ];

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" onClick={close} className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 font-bold text-white shadow">
            ₹
          </span>
          <span className="text-xl font-bold text-slate-900">LoanHub</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <Avatar user={user} />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs capitalize text-indigo-600">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:opacity-95"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d={open ? "M6 6l12 12M18 6L6 18" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={close}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2">
                <Avatar user={user} />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs capitalize text-indigo-600">{user.role}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                Logout
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link to="/login" onClick={close} className="rounded-lg border border-slate-300 py-2 text-center text-sm font-medium text-slate-700">
                Login
              </Link>
              <Link to="/signup" onClick={close} className="rounded-lg bg-indigo-600 py-2 text-center text-sm font-semibold text-white">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}