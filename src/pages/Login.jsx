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
        setIsLoading(true);
        setError("");

        try {
            const res = await loginUser(form);
            localStorage.setItem("token", res.data.access_token);
            alert("Login successful");
            // navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">
                    Login to continue shopping
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

                    <div className="login-footer">
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
