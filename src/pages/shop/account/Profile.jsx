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
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-[240px_1fr] gap-6">

        {/* SIDEBAR */}
        <aside className="bg-white rounded-lg shadow p-5 h-fit sticky top-24">
          <h3 className="font-semibold text-lg mb-4">
            My Account
          </h3>

          <ul className="space-y-2 text-sm">

            <li>
              <button
                onClick={() =>
                  personalRef.current?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="text-blue-600 font-medium"
              >
                Personal Details
              </button>
            </li>

            <li>
              <button
                onClick={() => navigate("/my-orders")}
                className="text-gray-600 hover:text-blue-600"
              >
                My Orders
              </button>
            </li>

          </ul>
        </aside>

        {/* CONTENT */}
        <section className="space-y-6">

          {/* PROFILE CARD */}
          <div
            ref={personalRef}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-xl font-semibold mb-6">
              Personal Details
            </h2>

            <div className="max-w-md space-y-4">
              <input
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Email"
                className="w-full border rounded px-3 py-2"
              />

              <input
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value)
                }
                placeholder="Mobile"
                className="w-full border rounded px-3 py-2"
              />

              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* ADDRESSES */}
          <div
            ref={addressRef}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Saved Addresses
              </h2>

              <button
                onClick={() => setShowAddressForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                + Add Address
              </button>
            </div>

            {/* ADDRESS GRID */}
            <div className="grid sm:grid-cols-2 gap-4">
              {addresses.map((addr) => {
                const id = addr.id || addr._id;

                return (
                  <div
                    key={id}
                    className={`border rounded p-4 ${addr.isdefault
                        ? "border-blue-600"
                        : ""
                      }`}
                  >
                    {addr.isdefault && (
                      <span className="text-xs text-blue-600">
                        DEFAULT
                      </span>
                    )}

                    <p className="font-medium">
                      {addr.fullname}
                    </p>

                    <p className="text-sm text-gray-500">
                      {addr.country}
                    </p>

                    <p className="text-sm text-gray-600">
                      {addr.addressline1}
                      {addr.addressline2 &&
                        `, ${addr.addressline2}`}
                      , {addr.city},{" "}
                      {addr.state} -{" "}
                      {addr.postalcode}
                    </p>

                    <div className="flex gap-3 mt-3 text-sm">
                      <button
                        onClick={() =>
                          handleSetDefault(id)
                        }
                        disabled={addr.isdefault}
                        className={`${addr.isdefault
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-600"
                          }`}
                      >
                        Set Default
                      </button>

                      <button
                        onClick={() =>
                          handleEditAddress(addr)
                        }
                        className="text-gray-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteAddress(id)
                        }
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ADDRESS FORM */}
          {showAddressForm && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">
                {editingAddress
                  ? "Edit Address"
                  : "Add New Address"}
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">

                <input
                  placeholder="Full Name"
                  value={addressForm.fullname}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      fullname:
                        e.target.value,
                    })
                  }
                  className="border rounded px-3 py-2"
                />

                <input
                  placeholder="Country"
                  value={addressForm.country}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      country:
                        e.target.value,
                    })
                  }
                  className="border rounded px-3 py-2"
                />

                <input
                  placeholder="Address Line 1"
                  value={
                    addressForm.addressline1
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      addressline1:
                        e.target.value,
                    })
                  }
                  className="border rounded px-3 py-2 sm:col-span-2"
                />

                <input
                  placeholder="Address Line 2 (Optional)"
                  value={
                    addressForm.addressline2
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      addressline2:
                        e.target.value,
                    })
                  }
                  className="border rounded px-3 py-2 sm:col-span-2"
                />

                <input
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      city:
                        e.target.value,
                    })
                  }
                  className="border rounded px-3 py-2"
                />

                <input
                  placeholder="State"
                  value={addressForm.state}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      state:
                        e.target.value,
                    })
                  }
                  className="border rounded px-3 py-2"
                />

                <input
                  placeholder="Postal Code"
                  value={
                    addressForm.postalcode
                  }
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      postalcode:
                        e.target.value,
                    })
                  }
                  className="border rounded px-3 py-2"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={handleAddressSubmit}
                  className="bg-blue-600 text-white px-5 py-2 rounded"
                >
                  Save Address
                </button>

                <button
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                  }}
                  className="border px-5 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </section>
      </div>
    </div>
  );
};

export default Profile;
