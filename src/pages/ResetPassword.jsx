import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";
import "../styles/resetpassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPassword(password);

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h1 className="reset-logo">SASTA STORE</h1>
        <h2 className="reset-title">Reset Password</h2>

        <form onSubmit={submit}>
          {success && (
            <div className="reset-success">
              ✅ Password reset successfully
            </div>
          )}

          <input
            type="password"
            placeholder="New Password"
            className="reset-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="reset-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {error && <div className="reset-error">{error}</div>}

          <button type="submit" className="reset-btn">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
