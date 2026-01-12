import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";
import "../styles/resetpassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      await resetPassword(otp, password);
      alert("Password reset successfully");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2 className="reset-title">Reset Password</h2>
        <p className="reset-subtitle">
          Enter the OTP and your new password
        </p>

        <form onSubmit={submit}>
          <input
            type="text"
            maxLength="6"
            placeholder="Enter OTP"
            className="reset-input reset-otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.trim())}
            required
          />

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

        <div className="login-footer">
          Back to{" "}
          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </div>
      </div>
    </div>
  );
}
