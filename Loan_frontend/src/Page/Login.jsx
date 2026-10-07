import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import RolePicker from "../components/RolePicker";
import Divider from "../components/Divider";
import GoogleAuthButton from "../components/GoogleAuthButton";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("client");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pehle se login hai to dashboard pe bhejo
  if (user) return <Navigate to={`/${user.role}`} replace />;

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      return setError("Password kam se kam 6 characters ka hona chahiye");
    }

    setLoading(true);
    // LATER: backend call yahan aayegi
    // const { data } = await axios.post("/api/auth/login", { ...form, role });
    await new Promise((r) => setTimeout(r, 600)); // demo delay

    login({
      name: form.email.split("@")[0],
      email: form.email,
      role,
      token: "demo-token",
    });
    navigate(`/${role}`);
  };

  return (
    <AuthLayout title="Welcome back 👋" subtitle="Login karke apne loans manage karo">
      <GoogleAuthButton role={role} text="signin_with" />
      <Divider />

      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-slate-700">Login as</p>
        <RolePicker value={role} onChange={setRole} />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={change}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={change}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in..." : `Login as ${role}`}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Naye ho?{" "}
        <Link to="/signup" className="font-semibold text-indigo-600 hover:underline">
          Account banao
        </Link>
      </p>
    </AuthLayout>
  );
}