import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    <div className="min-h-[calc(100-80px)] mt-20 flex items-center justify-center bg-slate-50 ">
      <div className="bg-white border border-slate-200 shadow-2xl shadow-blue-100/50 rounded-[2.5rem] p-10 w-full max-w-md text-center animate-fade-in relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-60"></div>

        <div className="relative z-10">
          <div className="inline-block mb-8 group">
            <h1 className="text-3xl font-black tracking-tight flex items-center justify-center gap-1">
              <span className="text-slate-900 group-hover:text-blue-600 transition-colors">
                SASTA
              </span>
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg group-hover:bg-blue-700 transition-all group-hover:scale-110">
                STORE
              </span>
            </h1>
          </div>

          <h1 className="text-xs font-black tracking-[0.2em] text-blue-600 mb-2 uppercase">
            Admin Portal
          </h1>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Become a Seller</h2>
          <p className="text-slate-500 text-sm mb-8 font-medium">
            Create your seller account to get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-800 transition-all outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="text-left">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Business Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="biz@company.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-800 transition-all outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="text-left">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Phone Number
              </label>
              <input
                name="mobile"
                type="tel"
                placeholder="Enter 10-digit number"
                value={form.mobile}
                onChange={handleChange}
                pattern="[6-9]{1}[0-9]{9}"
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-800 transition-all outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="text-left">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Secure Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="Choose a strong password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-800 transition-all outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
              />
            </div>

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

            <button
              type="submit"
              className="w-full px-4 py-4 bg-blue-600 text-white rounded-2xl font-bold text-base transition-all shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
            >
              Get Started as Seller
            </button>
          </form>

          <footer className="mt-8 text-sm text-slate-500 font-medium pt-6 border-t border-slate-100">
            Already have an account?{" "}
            <button
              className="text-blue-600 font-bold hover:text-blue-700 hover:underline"
              onClick={() => navigate("/login")}
            >
              Sign In here
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
