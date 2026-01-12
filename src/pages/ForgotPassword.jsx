import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/api";
import "../styles/forgotpassword.css";

export default function ForgotPassword() {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        // 🔍 Detect email or mobile
        const isEmail = value.includes("@");
        const isValidMobile = /^[6-9]\d{9}$/.test(value);

        if (!isEmail && !isValidMobile) {
            setError("Enter a valid email or 10-digit mobile number");
            return;
        }

        const payload = value.includes("@")
            ? { email: value }
            : { mobile: value };

        await forgotPassword(payload);


        try {
            await forgotPassword(payload);
            navigate("/reset-password");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP");
        }
    };

    return (
        <div className="forgot-container">
            <div className="forgot-card">
                <h2 className="forgot-title">Forgot Password</h2>
                <p className="forgot-subtitle">
                    Enter your email or mobile number to receive OTP
                </p>

                <form onSubmit={submit}>
                    <input
                        type="text"
                        className="forgot-input"
                        placeholder="Email or Mobile number"
                        value={value}
                        onChange={(e) => setValue(e.target.value.trim())}
                        required
                    />

                    {error && <div className="forgot-error">{error}</div>}

                    <button type="submit" className="forgot-btn">
                        Send OTP
                    </button>
                </form>

                <div className="login-footer">
                    Back to{" "}
                    <span onClick={() => navigate("/login")}>
                        Login
                    </span>
                </div>
            </div>
        </div>
    );
}
