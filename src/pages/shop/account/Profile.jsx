import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  updateProfile,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../../services/api";

import Header from "../../../components/common/Header";
import { useToast } from "../../../context/ToastContext";

const Profile = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const personalRef = useRef(null);
  const addressRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  /* ADDRESS STATES */
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [addressForm, setAddressForm] = useState({
    fullname: "",
    addressline1: "",
    addressline2: "",
    city: "",
    state: "",
    postalcode: "",
    country: "",
  });

  useEffect(() => {
    loadProfile();
    loadAddresses();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      const user = res.data.user || res.data;

      setProfile(user);
      setEmail(user.email || "");
      setMobile(user.mobile || "");
    } catch {
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.data || []);
    } catch {
      console.error("Address load failed");
    }
  };

  /* PROFILE SAVE */
  const handleSave = async () => {
    if (!email || !mobile) return;

    setSaving(true);

    try {
      const res = await updateProfile({ email, mobile });
      setProfile(res.data.user);
      showToast("Profile updated successfully ✅", "success");
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ADDRESS HANDLERS */

  const handleAddressSubmit = async () => {
    try {
      if (editingAddress) {
        await updateAddress(
          editingAddress.id || editingAddress._id,
          addressForm,
        );
        showToast("Address updated", "success");
      } else {
        await createAddress(addressForm);
        showToast("Address added", "success");
      }

      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        fullname: "",
        addressline1: "",
        addressline2: "",
        city: "",
        state: "",
        postalcode: "",
        country: "",
      });

      loadAddresses();
    } catch {
      showToast("Failed to save address", "error");
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      fullname: addr.fullname || "",
      addressline1: addr.addressline1 || "",
      addressline2: addr.addressline2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalcode: addr.postalcode || "",
      country: addr.country || "",
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id) => {
    await deleteAddress(id);
    showToast("Address removed", "success");
    loadAddresses();
  };

  const handleSetDefault = async (id) => {
    const alreadyDefault = addresses.find(
      (a) => (a.id || a._id) === id && a.isdefault,
    );

    if (alreadyDefault) return;

    await setDefaultAddress(id);
    showToast("Default address set", "success");
    loadAddresses();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex justify-center py-20">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[280px_1fr] gap-8">

        {/* SIDEBAR */}
        <aside className="h-fit sticky top-24 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                {(profile?.name?.[0] || "U").toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hello,</p>
                <h3 className="font-bold text-slate-800 text-lg leading-tight">{profile?.name || "User"}</h3>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => personalRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 font-bold transition-all text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Personal Details
              </button>

              <button
                onClick={() => navigate("/my-orders")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-all text-sm group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                My Orders
              </button>

              <button
                onClick={() => navigate("/my-payments")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-all text-sm group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                My Payments
              </button>
            </nav>
          </div>
        </aside>

        {/* CONTENT */}
        <section className="space-y-8">

          {/* PERSONAL DETAILS CARD */}
          <div ref={personalRef} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Personal Information</h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-800"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-200 disabled:opacity-70 disabled:active:scale-100"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          {/* ADDRESS BOOK */}
          <div ref={addressRef} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Address Book</h2>
                <p className="text-slate-500 mt-1 text-sm">Manage your delivery locations</p>
              </div>
              <button
                onClick={() => setShowAddressForm(true)}
                className="bg-blue-50 text-blue-600 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-100 active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="text-lg leading-none">+</span> Add New Address
              </button>
            </div>

            {/* ADDRESS GRID */}
            <div className="grid md:grid-cols-2 gap-5">
              {addresses.map((addr) => {
                const id = addr.id || addr._id;

                return (
                  <div
                    key={id}
                    className={`relative p-5 rounded-2xl border-2 transition-all ${addr.isdefault
                        ? "border-blue-500 bg-blue-50/10 shadow-md shadow-blue-100"
                        : "border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100"
                      }`}
                  >
                    {addr.isdefault && (
                      <span className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md tracking-wide">
                        DEFAULT
                      </span>
                    )}

                    <div className="pr-16">
                      <h4 className="font-bold text-slate-800 mb-1">{addr.fullname}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {addr.addressline1}
                        {addr.addressline2 && <>, {addr.addressline2}</>}
                        <br />
                        {addr.city}, {addr.state} - <span className="font-semibold text-slate-800">{addr.postalcode}</span>
                        <br />
                        <span className="text-slate-400 font-medium text-xs mt-1 block uppercase tracking-wider">{addr.country}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-dashed border-slate-200">
                      <button
                        onClick={() => handleEditAddress(addr)}
                        className="text-xs font-bold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(id)}
                        className="text-xs font-bold text-slate-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                      {!addr.isdefault && (
                        <button
                          onClick={() => handleSetDefault(id)}
                          className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {addresses.length === 0 && (
                <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-slate-900 font-bold mb-1">No addresses saved</h3>
                  <p className="text-slate-500 text-sm">Add a delivery address to checkout faster.</p>
                </div>
              )}
            </div>
          </div>

          {/* ADDRESS FORM MODAL/INLINE */}
          {showAddressForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 md:p-8 animate-slide-up max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {editingAddress ? "Edit Address" : "Add New Address"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                    className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input
                      placeholder="John Doe"
                      value={addressForm.fullname}
                      onChange={(e) => setAddressForm({ ...addressForm, fullname: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Country</label>
                    <input
                      placeholder="India"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address Line 1</label>
                    <input
                      placeholder="Flat, House no., Building, Company, Apartment"
                      value={addressForm.addressline1}
                      onChange={(e) => setAddressForm({ ...addressForm, addressline1: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address Line 2 (Optional)</label>
                    <input
                      placeholder="Area, Street, Sector, Village"
                      value={addressForm.addressline2}
                      onChange={(e) => setAddressForm({ ...addressForm, addressline2: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                    <input
                      placeholder="Mumbai"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">State</label>
                    <input
                      placeholder="Maharashtra"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Postal Code</label>
                    <input
                      placeholder="400001"
                      value={addressForm.postalcode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalcode: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleAddressSubmit}
                    className="flex-1 bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                  >
                    {editingAddress ? "Update Address" : "Save New Address"}
                  </button>

                  <button
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                    className="px-6 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </section>
      </div>
    </div>
  );
};

export default Profile;
