import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import '../styles/register.css';

const Register = () => {
  const [form, setForm] = useState({
    email: "",
    mobile: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      alert("Registration successful");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-logo">SASTA STORE</h1>
        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">Join us for a curate shopping experience.</p>

        <form onSubmit={handleSubmit}>
          <div className="register-field register-input">
            <label className="register-label">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-field register-input">
            <label className="register-label">Phone Number</label>
            <input
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              pattern="[6-9]{1}[0-9]{9}"
              required
            />
          </div>

          <div className="register-field register-input">
            <label className="register-label">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="register-error">{error}</div>}

          <button type="submit" className="register-btn">
            Register
          </button>
        </form>

        <div className="register-footer">
          Already have an account?{" "}
          <span className="register-link" onClick={() => navigate("/login")}>
            Sign In here
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
