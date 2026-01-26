import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../services/api";
import Header from "../../components/common/Header";
import "../../styles/pages/profile.css";
import { useToast } from "../../context/ToastContext";

const Profile = () => {
    const { showToast } = useToast();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await getProfile();
            const user = res.data.user || res.data;

            setProfile(user);
            setEmail(user.email || "");
            setMobile(user.mobile || "");
        } catch (err) {
            console.error("Fetch profile failed:", err);
            showToast("Failed to load profile", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!email || !mobile) {
            showToast("Email and mobile required", "warning");
            return;
        }

        if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            showToast("Invalid email format", "warning");
            return;
        }
        if (!/^\d{10}$/.test(mobile)) {
            showToast("Mobile must be 10 digits", "warning");
            return;
        }

        //  Check if nothing changed
        if (
            email === profile.email &&
            mobile === profile.mobile
        ) {
            showToast("No changes detected", "info");
            return;
        }

        setSaving(true);

        try {
            const res = await updateProfile({
                email,
                mobile,
            });

            setProfile(res.data.user);

            showToast("Profile updated successfully ✅", "success");
        } catch (err) {
            console.error(err);

            showToast(
                err?.response?.data?.message || "Failed to update profile",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };


    if (loading) {
        return (
            <>
                <Header />
                <p style={{ padding: 40 }}>Loading profile...</p>
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="profile-page">
                <div className="profile-container">

                    {/* LEFT SIDEBAR */}
                    <aside className="profile-sidebar">
                        <h3>My Account</h3>

                        <ul>
                            <li className="active">Personal Details</li>
                        </ul>
                    </aside>

                    {/* RIGHT CONTENT */}
                    <section className="profile-content">
                        <h2>Personal Details</h2>

                        <div className="profile-form">

                            <div className="profile-row">
                                <label>Email Address</label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter email"
                                />
                            </div>

                            <div className="profile-row">
                                <label>Mobile Number</label>
                                <input
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="Enter mobile number"
                                />
                            </div>

                            <button
                                className="profile-save-btn"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>

                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};

export default Profile;
