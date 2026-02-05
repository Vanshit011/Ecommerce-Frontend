import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../services/api";

export default function ForgotPassword() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const isEmail = value.includes("@");
    const isValidMobile = /^[6-9]\d{9}$/.test(value);

    if (!isEmail && !isValidMobile) {
      setError("Enter a valid email or 10-digit mobile number");
      return;
    }

    const payload = isEmail ? { email: value } : { mobile: value };

    try {
      await forgotPassword(payload);
      navigate("/verify-otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-5">
      <div className="bg-white/80 backdrop-blur-md border border-white/30 shadow-2xl rounded-3xl p-10 w-full max-w-md text-center animate-[slideUp_0.6s_cubic-bezier(0.16,1,0.3,1)]">
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-600 mb-8">SASTA STORE</h1>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">Reset Access</h2>

        <p className="text-slate-600 text-sm mb-8">
          Enter your email or mobile to receive a secure OTP.
        </p>

        <form onSubmit={submit}>
          <input
            type="text"
            placeholder="Email or Mobile number"
            value={value}
            onChange={(e) => setValue(e.target.value.trim())}
            required
            className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base text-slate-800 transition-all outline-none focus:border-blue-600 focus:ring-4 focus:ring-black/5 mb-5"
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
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-600">
          Back to{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700"
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}
