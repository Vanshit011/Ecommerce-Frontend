import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api";
import "../../styles/pages/login.css";

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
    <div className="login-container">
      <div className="login-card">

        <h1 className="login-logo">SASTA STORE</h1>

        <h2 className="login-title">Account Login</h2>

        <p className="login-subtitle">
          Please enter your credentials to access your account.
        </p>

        <form onSubmit={handleSubmit}>

          {/* ================= EMAIL LOGIN ================= */}
          {step === "email" && (
            <>
              <div className="login-field login-input">
                <label className="login-label">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="login-field login-input">
                <label className="login-label">Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {/* ================= MOBILE INPUT ================= */}
          {step === "mobile" && (
            <>
              <div className="login-field login-input">
                <label className="login-label">
                  Mobile Number
                </label>
                <input
                  name="mobile"
                  type="text"
                  value={form.mobile}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {/* ================= OTP VERIFY ================= */}
          {step === "otp" && (
            <>
              <div className="login-field login-input">
                <label className="login-label">
                  Enter OTP
                </label>
                <input
                  name="otp"
                  type="text"
                  value={form.otp}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {error && <div className="login-error">{error}</div>}

          {/* FOOTER LINKS */}
          {step === "email" && (
            <div className="login-footer">
              <span onClick={() => navigate("/forgot-password")}>
                Forgot Password?
              </span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          {step !== "mobile" && (
            <button
              type="submit"
              className="login-btn"
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
              className="login-btn"
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

          <div className="login-divider"></div>

          {/* SWITCH LOGIN METHOD */}
          {step === "email" && (
            <div className="login-footer centered">
              Login with{" "}
              <span onClick={() => setStep("mobile")}>
                Mobile
              </span>
            </div>
          )}

          {step !== "email" && (
            <div className="login-footer centered">
              <span onClick={() => setStep("email")}>
                ← Back to Email Login
              </span>
            </div>
          )}

          {/* REGISTER */}
          <div className="login-footer centered">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/register")}>
              Sign up here
            </span>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;
