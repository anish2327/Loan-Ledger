import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function GoogleAuthButton({ role, text = "continue_with" }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const onSuccess = async (res) => {
    setError("");
    try {
      // Send the Google token to our backend. The backend verifies it
      // and returns our own user and token.
      const { data } = await api.post("/auth/google", {
        credential: res.credential,
        role,
      });

      login({ ...data.user, token: data.token });
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not connect to the server. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={() => setError("Google sign-in failed. Please try again.")}
          text={text}
          shape="pill"
          width="320"
        />
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100">
          {error}
        </p>
      )}
    </div>
  );
}