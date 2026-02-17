import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, logout, updateProfile } from "../../../services/api";
import { useToast } from "../../../context/ToastContext.jsx";

const AdminProfileModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "" });
  const modalRef = useRef(null);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const fetchAdminProfile = async () => {
    try {
      const res = await getProfile();
      const data = res.data.user || res.data;
      setAdmin(data);
      setFormData({ name: data.name, email: data.email, mobile: data.mobile || "" });
    } catch (error) {
      console.error("Failed to fetch admin profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.clear();
      navigate("/login");
      showToast("Logged out successfully", "success");
    } catch (error) {
      console.error("Logout failed", error);
      localStorage.clear();
      navigate("/login");
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      await fetchAdminProfile();
      setIsEditing(false);
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Update failed", error);
      showToast("Failed to update profile", "error");
    }
  };

  if (!admin && !loading) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        ref={modalRef}
        className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-scale-up"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white active:scale-95"
              title="Edit Profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
          )}

          <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full mx-auto mb-4 flex items-center justify-center text-white ring-4 ring-white/10 shadow-2xl overflow-hidden">
            <span className="font-black text-4xl drop-shadow-md">
              {admin?.name?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight">{admin?.name || "Admin"}</h2>
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-2">
            {admin?.email || "admin@example.com"}
          </p>
        </div>

        {/* BODY */}
        <div className="p-8">
          <div className="space-y-4 mb-10">
            {/* EMAIL Field */}
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/50">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm shrink-0">
                📧
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  Email Address
                </p>
                {isEditing ? (
                  <input
                    type="email"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm mt-1 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-700"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  <p className="text-slate-700 font-bold truncate text-sm mt-0.5">
                    {admin?.email || "N/A"}
                  </p>
                )}
              </div>
            </div>

            {/* MOBILE Field */}
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/50">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm shrink-0">
                📱
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  Mobile Number
                </p>
                {isEditing ? (
                  <input
                    type="tel"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm mt-1 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all font-bold text-slate-700"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                ) : (
                  <p className="text-slate-700 font-bold text-sm mt-0.5">
                    {admin?.mobile || "N/A"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/50">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm shrink-0">
                🛡️
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  Account Privilege
                </p>
                <p className="text-slate-700 font-black text-sm mt-0.5">System Admin</p>
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ name: admin.name, email: admin.email, mobile: admin.mobile });
                }}
                className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all text-sm active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all text-sm active:scale-95"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-black uppercase tracking-widest hover:bg-red-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 text-xs"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              Sign Out Securely
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfileModal;
