import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";
import "../styles/resetpassword.css";

export default function ResetPassword() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      await resetPassword(state.email, otp, password);
      alert("Password reset successfully");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Reset failed");
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
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="New Password"
            className="reset-input"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="reset-input"
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button type="submit" className="reset-btn">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
