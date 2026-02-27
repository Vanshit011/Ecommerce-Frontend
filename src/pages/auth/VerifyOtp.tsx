// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyForgotOtp } from "../../services/api";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-5">
      <div className="bg-white/80 backdrop-blur-md border border-white/30 shadow-2xl rounded-3xl p-10 w-full max-w-md text-center animate-[slideUp_0.6s_cubic-bezier(0.16,1,0.3,1)]">
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-600 mb-8">SASTA STORE</h1>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">Verify OTP</h2>

        <p className="text-slate-600 text-sm mb-8">Enter the 6-digit OTP sent to you.</p>

        <form onSubmit={submit}>
          <input
            type="text"
            maxLength="6"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.trim())}
            required
            className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base text-slate-800 transition-all outline-none focus:border-blue-600 focus:ring-4 focus:ring-black/5 mb-5 text-center text-2xl tracking-widest font-semibold"
          />

          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-3 rounded-xl text-sm font-medium mb-5 border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-base border-none cursor-pointer transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
