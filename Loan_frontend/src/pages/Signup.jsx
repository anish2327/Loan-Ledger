import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import RolePicker from "../components/RolePicker";
import Divider from "../components/Divider";
import GoogleAuthButton from "../components/GoogleAuthButton";

const strengthScore = (p) =>
  [
    p.length >= 6,
    p.length >= 10,
    /[A-Z]/.test(p) && /[0-9]/.test(p),
    /[^A-Za-z0-9]/.test(p),
  ].filter(Boolean).length;

const strengthColors = ["bg-slate-200", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
const strengthLabels = ["", "Weak", "Okay", "Good", "Strong"];

export default function Signup() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("client");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, go to the dashboard
  if (user) return <Navigate to={`/${user.role}`} replace />;

  const score = strengthScore(form.password);
  const matches = form.confirm && form.password === form.confirm;

  const change = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    setServerError("");
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = "Name must be at least 3 characters long.";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit mobile number.";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters long.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
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
      const { data } = await api.post("/auth/signup", {
        name: form.name.trim(),
        email: form.email,
        phone: form.phone,
        password: form.password,
        role,
      });

      login({ ...data.user, token: data.token });
      navigate(`/${data.user.role}`);
    } catch (err) {
      const message =
        err.response?.data?.message || "Could not connect to the server. Please try again.";

      // 409 = this email already exists: show it under the email field
      if (err.response?.status === 409) {
        setErrors({ email: message });
      } else {
        setServerError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account 🚀" subtitle="Choose how you want to use LoanHub.">
      <GoogleAuthButton role={role} text="signup_with" />
      <Divider />

      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-slate-700">I am a</p>
        <RolePicker value={role} onChange={setRole} />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Full name"
          name="name"
          value={form.name}
          onChange={change}
          error={errors.name}
          placeholder="Anish Giri"
          autoComplete="name"
          required
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={change}
          error={errors.email}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <Input
          label="Phone number"
          type="tel"
          name="phone"
          value={form.phone}
          onChange={(e) => change({ target: { name: "phone", value: e.target.value.replace(/\D/g, "") } })}
          error={errors.phone}
          placeholder="9876543210"
          maxLength={10}
          autoComplete="tel"
          required
        />

        <div>
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={change}
            error={errors.password}
            autoComplete="new-password"
            required
          />
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition ${i <= score ? strengthColors[score] : "bg-slate-200"}`}
                  />
                ))}
              </div>
              <span className="w-12 text-xs text-slate-500">{strengthLabels[score]}</span>
            </div>
          )}
        </div>

        <div>
          <Input
            label="Confirm password"
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={change}
            error={errors.confirm}
            autoComplete="new-password"
            required
          />
          {matches && <p className="mt-1 text-xs text-green-600">✓ Passwords match</p>}
        </div>

        {serverError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100">
            {serverError}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : `Sign up as ${role === "client" ? "Client" : "Broker"}`}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}