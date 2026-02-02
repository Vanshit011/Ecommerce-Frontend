import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/api";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-5">
      <div className="bg-white/80 backdrop-blur-md border border-white/30 shadow-2xl rounded-3xl p-10 w-full max-w-md text-center animate-[slideUp_0.6s_cubic-bezier(0.16,1,0.3,1)]">

        <h1 className="text-3xl font-extrabold tracking-tight text-blue-600 mb-8">
          SASTA STORE
        </h1>

        <h2 className="text-2xl font-bold text-slate-800 mb-8">
          Reset Password
        </h2>

        <form onSubmit={submit}>
          {success && (
            <div className="bg-green-50 text-green-600 px-3 py-3 rounded-xl text-sm font-medium mb-5 border border-green-200">
              ✅ Password reset successfully
            </div>
          )}

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base text-slate-800 transition-all outline-none focus:border-blue-600 focus:ring-4 focus:ring-black/5 mb-4"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
            className="w-full px-4 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-base border-none cursor-pointer transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
