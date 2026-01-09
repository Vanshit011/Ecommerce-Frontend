import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/api";
import "../styles/forgotpassword.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        try {
            await forgotPassword(email);
            navigate("/reset-password", { state: { email } });
        } catch (error) {
            alert(error.response?.data?.message || "Failed to send OTP");
        }
    };

    return (
        <div className="forgot-container">
            <div className="forgot-card">
                <h2 className="forgot-title">Forgot Password</h2>
                <p className="forgot-subtitle">
                    Enter your email to receive a password reset OTP
                </p>

                <form onSubmit={submit}>
                    <input
                        type="email"
                        className="forgot-input"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <button type="submit" className="forgot-btn">
                        Send OTP
                    </button>
                </form>
                <div className="login-footer">
                    Back To {" "}
                    <span onClick={() => navigate("/login")}>
                        Login
                    </span>
                </div>
            </div>

        </div>
    );
}
