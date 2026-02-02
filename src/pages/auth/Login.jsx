import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api";

const Login = () => {
  const navigate = useNavigate();

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
        res.data?.access_token ||
        res.data?.token ||
        res.data?.accessToken ||
        res.data?.access;

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
      const apiMessage =
        err?.response?.data?.message ||
        "Login failed";

      setError(apiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-5">
      <div className="bg-white/80 backdrop-blur-md border border-white/30 shadow-2xl rounded-3xl p-10 w-full max-w-md text-center animate-[slideUp_0.6s_cubic-bezier(0.16,1,0.3,1)]">

        <h1 className="text-3xl font-extrabold tracking-tight text-blue-600 mb-8">
          SASTA STORE
        </h1>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Account Login
        </h2>

        <p className="text-slate-600 text-sm mb-8">
          Please enter your credentials to access your account.
        </p>

        <form onSubmit={handleSubmit}>

          {/* ================= EMAIL LOGIN ================= */}
          {step === "email" && (
            <>
              <div className="text-left mb-5">
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base text-slate-800 transition-all outline-none focus:border-blue-600 focus:ring-4 focus:ring-black/5"
                />
              </div>

              <div className="text-left mb-5">
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base text-slate-800 transition-all outline-none focus:border-blue-600 focus:ring-4 focus:ring-black/5"
                />
              </div>
            </>
          )}

          {/* ================= MOBILE INPUT ================= */}
          {step === "mobile" && (
            <>
              <div className="text-left mb-5">
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Mobile Number
                </label>
                <input
                  name="mobile"
                  type="text"
                  value={form.mobile}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base text-slate-800 transition-all outline-none focus:border-blue-600 focus:ring-4 focus:ring-black/5"
                />
              </div>
            </>
          )}

          {/* ================= OTP VERIFY ================= */}
          {step === "otp" && (
            <>
              <div className="text-left mb-5">
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Enter OTP
                </label>
                <input
                  name="otp"
                  type="text"
                  value={form.otp}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base text-slate-800 transition-all outline-none focus:border-blue-600 focus:ring-4 focus:ring-black/5"
                />
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-3 rounded-xl text-sm font-medium mb-5 border border-red-200">
              {error}
            </div>
          )}

          {/* FOOTER LINKS */}
          {step === "email" && (
            <div className="flex justify-end mb-6 text-sm">
              <span
                onClick={() => navigate("/forgot-password")}
                className="text-slate-600 cursor-pointer transition-colors hover:text-blue-600"
              >
                Forgot Password?
              </span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          {step !== "mobile" && (
            <button
              type="submit"
              className="w-full px-4 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-base border-none cursor-pointer transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isLoading}
            >
              {isLoading
                ? "Signing in..."
                : step === "otp"
                  ? "Verify & Login"
                  : "Login"}
            </button>
          )}

          {/* CONTINUE FOR MOBILE */}
          {step === "mobile" && (
            <button
              type="button"
              className="w-full px-4 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-base border-none cursor-pointer transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              onClick={() => {
                if (!form.mobile) {
                  return setError("Enter mobile number");
                }
                setStep("otp");
              }}
            >
              Continue
            </button>
          )}

          <div className="h-px bg-slate-300 my-8"></div>

          {/* SWITCH LOGIN METHOD */}
          {step === "email" && (
            <div className="flex justify-center mb-0 text-sm text-slate-600">
              Login with{" "}
              <span
                onClick={() => setStep("mobile")}
                className="text-blue-600 font-semibold ml-1 cursor-pointer hover:text-blue-700"
              >
                Mobile
              </span>
            </div>
          )}

          {step !== "email" && (
            <div className="flex justify-center mb-0 text-sm text-slate-600">
              <span
                onClick={() => setStep("email")}
                className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700"
              >
                ← Back to Email Login
              </span>
            </div>
          )}

          {/* REGISTER */}
          <div className="flex justify-center mt-4 text-sm text-slate-600">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-600 font-semibold ml-1 cursor-pointer hover:text-blue-700"
            >
              Sign up here
            </span>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;
