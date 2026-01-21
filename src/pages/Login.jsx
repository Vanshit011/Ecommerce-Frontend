import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import "../styles/login.css";

const Login = () => {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            return setError("Please fill in all fields");
        }

        setIsLoading(true);
        setError("");

        try {
            const res = await loginUser(form);

            const token = res.data?.access_token ||
                res.data?.token ||
                res.data?.accessToken ||
                res.data?.access;

            if (token) {
                localStorage.setItem("token", token);

                const role = res.data?.user?.role || res.data?.role || "user";
                localStorage.setItem("role", role);

                if (role === "admin") {
                    navigate("/dashboard");
                } else {
                    navigate("/home");
                }
            } else {
                setError("Token not found in response");
            }

        } catch (err) {
            const apiMessage =
                err?.response?.data?.message ||
                "Invalid email or password";

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
                    <div className="login-field login-input">
                        <label className="login-label">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="login-field login-input">
                        <label className="login-label">Password</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <div className="login-footer">
                        <span
                            onClick={() => navigate("/forgot-password")}
                        >
                            Forgot Password?
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Login"}
                    </button>


                    <div className="login-divider"></div>

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
