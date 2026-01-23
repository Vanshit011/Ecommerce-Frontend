import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyForgotOtp } from "../services/api";
import "../styles/resetpassword.css";

export default function VerifyOtp() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      setLoading(true);

      await verifyForgotOtp(otp);

      // ✅ OTP valid → go reset password screen
      navigate("/reset-password");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h1 className="reset-logo">SASTA STORE</h1>
        <h2 className="reset-title">Verify OTP</h2>
        <p className="reset-subtitle">
          Enter the 6-digit OTP sent to you.
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

          {error && <div className="reset-error">{error}</div>}

          <button
            type="submit"
            className="reset-btn"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
