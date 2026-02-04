import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, logout, updateProfile } from "../../../services/api"; // Added updateProfile
import { useToast } from "../../../context/ToastContext";

const AdminProfileModal = ({ onClose }) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", mobile: "" });

    useEffect(() => {
        fetchAdminProfile();
    }, []);

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
            await fetchAdminProfile(); // Refresh data
            setIsEditing(false);
            showToast("Profile updated successfully!", "success");
        } catch (error) {
            console.error("Update failed", error);
            showToast("Failed to update profile", "error");
        }
    };

    if (!admin && !loading) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn" onClick={e => e.stopPropagation()}>
                {/* HEADER */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute top-4 left-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                            title="Edit Profile"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                        </button>
                    )}

                    <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-blue-600 font-bold text-3xl shadow-lg">
                        {admin?.name?.charAt(0).toUpperCase() || "A"}
                    </div>

                    <h2 className="text-xl font-bold">{admin?.name || "Admin"}</h2>

                    <p className="text-blue-100 text-sm mt-1">{admin?.email || "admin@example.com"}</p>
                </div>

                {/* BODY */}
                <div className="p-6">
                    <div className="space-y-4 mb-8">
                        {/* EMAIL Field */}
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                                📧
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-400 font-bold uppercase">Email</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        className="bg-white border border-slate-300 rounded px-2 py-1 text-sm w-full mt-0.5 outline-none focus:border-blue-500 text-slate-700"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-slate-700 font-medium truncate">{admin?.email || "N/A"}</p>
                                )}
                            </div>
                        </div>

                        {/* MOBILE Field */}
                        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                                📱
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-400 font-bold uppercase">Mobile</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        className="bg-white border border-slate-300 rounded px-2 py-1 text-sm w-full mt-0.5 outline-none focus:border-blue-500 text-slate-700"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-slate-700 font-medium">{admin?.mobile || "N/A"}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                                🛡️
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Role</p>
                                <p className="text-slate-700 font-medium">Admin</p>
                            </div>
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setIsEditing(false); setFormData({ name: admin.name, email: admin.email, mobile: admin.mobile }); }}
                                className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="w-full py-3.5 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                            Sign Out
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProfileModal;
