import React, { useState, useEffect, useCallback } from "react";
import { createCoupon, getAllCoupons } from "../../services/api";
import { useToast } from "../../context/ToastContext";

const EMPTY_FORM = {
  code: "",
  discount_type: "PERCENTAGE",
  discount_value: "",
  min_order_amount: "",
  max_discount_amount: "",
  usage_limit: "",
  start_date: "",
  end_date: "",
  is_active: true,
};

const AdminCoupons = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(null);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllCoupons();
      setCoupons(res.data || []);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return showToast("Coupon code is required", "error");

    try {
      setSubmitting(true);
      await createCoupon({
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount),
        max_discount_amount: Number(form.max_discount_amount),
        usage_limit: Number(form.usage_limit),
        start_date: form.start_date ? new Date(form.start_date).toISOString() : undefined,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
        is_active: form.is_active,
      });
      showToast("Coupon created!", "success");
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to create coupon", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isCouponActive = (coupon) => {
    if (!coupon.is_active) return false;
    const now = new Date();
    if (coupon.start_date && new Date(coupon.start_date) > now) return false;
    if (coupon.end_date && new Date(coupon.end_date) < now) return false;
    if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) return false;
    return true;
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Coupon Management</h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage discount coupons.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <span className="text-lg">{showForm ? "✕" : "+"}</span>
          {showForm ? "Cancel" : "New Coupon"}
        </button>
      </div>

      {/* CREATE FORM */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Create New Coupon</h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {/* Code */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Coupon Code *
              </label>
              <input
                name="code"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SAVE20"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Discount Type *
              </label>
              <select
                name="discount_type"
                value={form.discount_type}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    discount_type: e.target.value,
                  }))
                }
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-white"
              >
                <option value="">Select type</option>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Flat (₹)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Discount Value *
              </label>
              <div className="relative">
                <span
                  className={`font-bold text-sm ${
                    coupons.discount_type === "PERCENTAGE" ? "text-blue-600" : "text-purple-600"
                  }`}
                >
                  {coupons.discount_type === "PERCENTAGE"
                    ? `${coupons.discount_value}% OFF`
                    : `₹${Number(coupons.discount_value).toLocaleString()} OFF`}
                </span>
                <input
                  name="discount_value"
                  type="number"
                  value={form.discount_value}
                  onChange={handleChange}
                  placeholder="10"
                  required
                  min="0"
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                />
              </div>
            </div>

            {/* Min Order Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Min Order Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  name="min_order_amount"
                  type="number"
                  value={form.min_order_amount}
                  onChange={handleChange}
                  placeholder="500"
                  required
                  min="0"
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                />
              </div>
            </div>

            {/* Max Discount Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Max Discount Cap *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  name="max_discount_amount"
                  type="number"
                  value={form.max_discount_amount}
                  onChange={handleChange}
                  placeholder="200"
                  required
                  min="0"
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                />
              </div>
            </div>

            {/* Usage Limit */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Usage Limit *
              </label>
              <input
                name="usage_limit"
                type="number"
                value={form.usage_limit}
                onChange={handleChange}
                placeholder="100"
                required
                min="0"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Start Date *
              </label>
              <input
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                End Date *
              </label>
              <input
                name="end_date"
                type="date"
                value={form.end_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                  Active
                </span>
              </label>
            </div>

            {/* Submit */}
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Coupon"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COUPON LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">All Coupons</h2>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {coupons.length} total
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏷️</div>
            <h3 className="font-bold text-slate-700 mb-1">No coupons yet</h3>
            <p className="text-slate-400 text-sm">Create your first coupon to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <th className="text-left px-6 py-3">Code</th>
                  <th className="text-left px-6 py-3">Discount</th>
                  <th className="text-left px-6 py-3">Min Order</th>
                  <th className="text-left px-6 py-3">Max Cap</th>
                  <th className="text-left px-6 py-3">Usage</th>
                  <th className="text-left px-6 py-3">Validity</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {coupons.map((coupon) => {
                  const active = isCouponActive(coupon);
                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Code */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-800 tracking-widest text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            title="Copy code"
                            className="text-slate-300 hover:text-blue-600 transition-colors"
                          >
                            {copied === coupon.code ? (
                              <span className="text-emerald-500 text-xs font-bold">✓</span>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold text-sm ${coupon.discount_type === "percentage" ? "text-blue-600" : "text-purple-600"}`}
                        >
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}% OFF`
                            : `₹${Number(coupon.discount_value).toLocaleString()} OFF`}
                        </span>
                      </td>

                      {/* Min Order */}
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        ₹{Number(coupon.min_order_amount).toLocaleString()}
                      </td>

                      {/* Max Cap */}
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        ₹{Number(coupon.max_discount_amount).toLocaleString()}
                      </td>

                      {/* Usage */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width:
                                  coupon.usage_limit > 0
                                    ? `${Math.min((coupon.used_count / coupon.usage_limit) * 100, 100)}%`
                                    : "0%",
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-500">
                            {coupon.used_count}/{coupon.usage_limit}
                          </span>
                        </div>
                      </td>

                      {/* Validity */}
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        <div>{formatDate(coupon.start_date)}</div>
                        <div className="text-slate-400">→ {formatDate(coupon.end_date)}</div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                            active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
