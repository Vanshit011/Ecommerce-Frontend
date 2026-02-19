import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginUser } from "../../services/api";
import { Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // step = email | mobile | otp
  const [step, setStep] = useState("email");

  const [form, setForm] = useState({
    email: "",
    password: "",
    mobile: "",
    otp: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API || "http://localhost:3000";

  useEffect(() => {
    // Check if user is already logged in
    const existingToken = localStorage.getItem("token");
    const existingRole = localStorage.getItem("role");

    if (existingToken) {
      if (existingRole === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
      return;
    }

    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const errorMsg = searchParams.get("error");

    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
    }

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "user");

      if (role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    }
  }, [searchParams, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = {};

    if (step === "email") {
      if (!form.email || !form.password) {
        return setError("Please fill in all fields");
      }

      payload = {
        email: form.email,
        password: form.password,
      };
    }

    if (step === "otp") {
      if (!form.mobile || !form.otp) {
        return setError("Enter mobile number and OTP");
      }

      payload = {
        mobile: form.mobile,
        otp: form.otp,
      };
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await loginUser(payload);

      const token =
        res.data?.access_token || res.data?.token || res.data?.accessToken || res.data?.access;

      if (!token) {
        return setError("Token not found in response");
      }

      localStorage.setItem("token", token);

      const role = res.data?.user?.role || "user";
      localStorage.setItem("role", role);

      if (role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      const apiMessage = err?.response?.data?.message || "Login failed";

      setError(apiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  return (
    <div className="min-h-[calc(100-80px)] mt-20 flex items-center justify-center bg-slate-50">
      <div className="bg-white border border-slate-200 shadow-2xl shadow-blue-100/50 rounded-[2.5rem] p-10 w-full max-w-md text-center animate-fade-in relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-60"></div>

        <div className="relative z-10">
          <Link to="/home" className="inline-block mb-8 group">
            <h1 className="text-3xl font-black tracking-tight flex items-center justify-center gap-1">
              <span className="text-slate-900 group-hover:text-blue-600 transition-colors">
                SASTA
              </span>
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg group-hover:bg-blue-700 transition-all group-hover:scale-110">
                STORE
              </span>
            </h1>
          </Link>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome Back</h2>
          <p className="text-slate-500 text-sm mb-8 font-medium">Please sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ================= EMAIL LOGIN ================= */}
            {step === "email" && (
              <>
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-800 transition-all outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div className="text-left">
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Password
                    </label>
                    <span
                      onClick={() => navigate("/forgot-password")}
                      className="text-xs font-bold text-blue-600 cursor-pointer hover:text-blue-700 hover:underline transition-all"
                    >
                      Forgot Password?
                    </span>
                  </div>
                  <input
                    name="password"
                    type="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-800 transition-all outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </>
            )}

            {/* ================= MOBILE INPUT ================= */}
            {step === "mobile" && (
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Mobile Number
                </label>
                <input
                  name="mobile"
                  type="text"
                  placeholder="10-digit mobile number"
                  value={form.mobile}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-800 transition-all outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            )}

            {/* ================= OTP VERIFY ================= */}
            {step === "otp" && (
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Verification Code
                </label>
                <input
                  name="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={form.otp}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-800 transition-all outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 text-center tracking-[1em] font-bold"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2 animate-shake">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            {step !== "mobile" && (
              <button
                type="submit"
                className="w-full px-4 py-4 bg-blue-600 text-white rounded-2xl font-bold text-base transition-all shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : step === "otp" ? (
                  "Verify & Login"
                ) : (
                  "Sign In"
                )}
              </button>
            )}

            {/* CONTINUE FOR MOBILE */}
            {step === "mobile" && (
              <button
                type="button"
                className="w-full px-4 py-4 bg-blue-600 text-white rounded-2xl font-bold text-base transition-all shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => {
                  if (!form.mobile) return setError("Enter mobile number");
                  setStep("otp");
                }}
              >
                Get OTP
              </button>
            )}
          </form>

          <footer className="mt-8 space-y-4">
            {/* SWITCH LOGIN METHOD */}
            <div className="text-sm text-slate-500 font-medium">
              {step === "email" ? (
                <>
                  Or login with{" "}
                  <button
                    onClick={() => setStep("mobile")}
                    className="text-blue-600 font-bold hover:text-blue-700 hover:underline"
                  >
                    Mobile Number
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setStep("email")}
                  className="text-blue-600 font-bold hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                >
                  ← Back to Email Login
                </button>
              )}
            </div>

            <div className="h-px bg-slate-100"></div>

            {/* REGISTER LINKS */}
            <div className="flex flex-col gap-3">
              {/* <p className="text-sm text-slate-500 font-medium">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-blue-600 font-bold hover:text-blue-700 hover:underline"
                >
                  Sign Up
                </button>
              </p> */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                  Want to sell with us?
                </p>
                <button
                  onClick={() => navigate("/admin/register")}
                  className="text-sm font-black text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 mx-auto transition-transform hover:scale-105"
                >
                  Sign Up as Seller
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* OAUTH */}
            <div className="relative pt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400 font-bold tracking-widest uppercase">
                  Social Login
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                className="flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 hover:shadow-lg active:scale-95 group"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin("github")}
                className="flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 border border-slate-900 rounded-xl font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 group"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="group-hover:text-blue-400 transition-colors"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                GitHub
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
