import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../api";
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

  // If already logged in, go to the dashboard
  if (user) return <Navigate to={`/${user.role}`} replace />;

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { ...form, role });
      login({ ...data.user, token: data.token });
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back 👋" subtitle="Log in to manage your loans.">
      <GoogleAuthButton role={role} text="signin_with" />
      <Divider />

      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-slate-700">Log in as</p>
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
          {loading ? "Logging in..." : `Log in as ${role === "client" ? "Client" : "Broker"}`}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to LoanHub?{" "}
        <Link to="/signup" className="font-semibold text-indigo-600 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}