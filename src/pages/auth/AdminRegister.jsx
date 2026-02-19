import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAdmin } from "../../services/api";

const AdminRegister = () => {
  const [form, setForm] = useState({
    name: "",
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
      await registerAdmin(form);
      alert("Admin Registration successful");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Admin Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-200 p-5">
      <div className="bg-white/80 backdrop-blur-md border border-white/30 shadow-2xl rounded-3xl p-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-600 mb-8">
          ADMIN PORTAL
        </h1>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Admin Account</h2>

        <p className="text-slate-600 text-sm mb-8">Register to manage the store operations.</p>

        <form onSubmit={handleSubmit}>
          <div className="text-left mb-5">
            <label className="block text-sm font-semibold text-slate-800 mb-2">Full Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base text-slate-800 transition-all outline-none focus:border-indigo-600 focus:ring-4 focus:ring-black/5"
            />
          </div>

          <div className="text-left mb-5">
            <label className="block text-sm font-semibold text-slate-800 mb-2">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base text-slate-800 transition-all outline-none focus:border-indigo-600 focus:ring-4 focus:ring-black/5"
            />
          </div>

          <div className="text-left mb-5">
            <label className="block text-sm font-semibold text-slate-800 mb-2">Phone Number</label>
            <input
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              pattern="[6-9]{1}[0-9]{9}"
              required
              className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base text-slate-800 transition-all outline-none focus:border-indigo-600 focus:ring-4 focus:ring-black/5"
            />
          </div>

          <div className="text-left mb-5">
            <label className="block text-sm font-semibold text-slate-800 mb-2">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-base text-slate-800 transition-all outline-none focus:border-indigo-600 focus:ring-4 focus:ring-black/5"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-3 py-3 rounded-xl text-sm font-medium mb-5 border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base border-none cursor-pointer transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
          >
            Register Admin
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <span
            className="text-indigo-600 font-semibold cursor-pointer hover:text-indigo-700"
            onClick={() => navigate("/login")}
          >
            Sign In here
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
