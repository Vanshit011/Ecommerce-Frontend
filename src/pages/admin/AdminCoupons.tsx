import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  getMyProducts,
} from "../../services/api";
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
  product_ids: [],
};

const AdminCoupons = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [viewingCoupon, setViewingCoupon] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const productDropdownRef = useRef(null);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllCoupons();
      setCoupons((res.data as any)?.data || res.data || []);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getMyProducts({ limit: 200 });
        setAllProducts((res.data as any)?.data || res.data || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const closeMenu = (e) => {
      setOpenMenuId(null);
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type.toUpperCase(),
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount,
      max_discount_amount: coupon.max_discount_amount,
      usage_limit: coupon.usage_limit,
      start_date: coupon.start_date ? new Date(coupon.start_date).toISOString().split("T")[0] : "",
      end_date: coupon.end_date ? new Date(coupon.end_date).toISOString().split("T")[0] : "",
      is_active: coupon.is_active,
      product_ids: coupon.products ? coupon.products.map((p) => p.id) : [],
    });
    setProductSearch("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleProduct = (productId) => {
    setForm((prev) => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter((id) => id !== productId)
        : [...prev.product_ids, productId],
    }));
  };

  const removeProduct = (productId) => {
    setForm((prev) => ({
      ...prev,
      product_ids: prev.product_ids.filter((id) => id !== productId),
    }));
  };

  const filteredProducts = allProducts.filter((p) =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const getProductById = (id) => allProducts.find((p) => p.id === id);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteCoupon(id);
      showToast("Coupon deleted successfully", "success");
      fetchCoupons();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to delete coupon", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return showToast("Coupon code is required", "error");

    try {
      setSubmitting(true);
      const payload = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount),
        max_discount_amount: Number(form.max_discount_amount),
        usage_limit: Number(form.usage_limit),
        start_date: form.start_date ? new Date(form.start_date).toISOString() : undefined,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
        is_active: form.is_active,
        product_ids: form.product_ids,
      };

      if (editingId) {
        await updateCoupon(editingId, payload);
        showToast("Coupon updated!", "success");
      } else {
        await createCoupon(payload);
        showToast("Coupon created!", "success");
      }

      setForm(EMPTY_FORM);
      setShowForm(false);
      setEditingId(null);
      fetchCoupons();
    } catch (err) {
      showToast(
        err?.response?.data?.message || `Failed to ${editingId ? "update" : "create"} coupon`,
        "error",
      );
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
    <div className="p-4 sm:p-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 px-2 sm:px-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
            Coupons & Discounts
          </h1>
          <p className="text-slate-400 mt-1 text-sm lg:text-base font-bold uppercase tracking-widest">
            Manage your storefront's promotional logic.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm(EMPTY_FORM);
            setShowForm(true);
          }}
          className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-[1.25rem] font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95"
        >
          <span className="text-xl">+</span> Add New Coupon
        </button>
      </div>

      {/* CREATE FORM */}
      {/* CREATE/EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                {editingId ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm active:scale-90"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Code */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Coupon Code *
                  </label>
                  <input
                    name="code"
                    value={form.code}
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SAVE20"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all bg-slate-50/50"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
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
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all bg-slate-50/30"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat (₹)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Discount Value *
                  </label>
                  <div className="relative">
                    <input
                      name="discount_value"
                      type="number"
                      value={form.discount_value}
                      onChange={handleChange}
                      placeholder={form.discount_type === "PERCENTAGE" ? "20" : "100"}
                      required
                      min="0"
                      className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all bg-slate-50/30"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm bg-white px-2 py-1 rounded-lg border border-slate-100">
                      {form.discount_type === "PERCENTAGE" ? "%" : "₹"}
                    </div>
                  </div>
                </div>

                {/* Min Order Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Min Order (₹) *
                  </label>
                  <input
                    name="min_order_amount"
                    type="number"
                    value={form.min_order_amount}
                    onChange={handleChange}
                    placeholder="500"
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all bg-slate-50/30"
                  />
                </div>

                {/* Max Discount Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Max Cap (₹) *
                  </label>
                  <input
                    name="max_discount_amount"
                    type="number"
                    value={form.max_discount_amount}
                    onChange={handleChange}
                    placeholder="200"
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all bg-slate-50/30"
                  />
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
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
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all bg-slate-50/30"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Start Date *
                  </label>
                  <input
                    name="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all bg-slate-50/30"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    End Date *
                  </label>
                  <input
                    name="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all bg-slate-50/30"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={form.is_active}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6.5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-5.5 h-5.5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5.5" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-widest">
                      Active
                    </span>
                  </label>
                </div>

                {/* Applicable Products (Full Width Row) */}
                <div className="sm:col-span-2 lg:col-span-3 pt-4">
                  <div className="flex flex-col gap-1 mb-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Applicable Products
                    </label>
                    <p className="text-[10px] text-slate-400 font-medium">
                      (Leave empty for global coupon — valid for all products)
                    </p>
                  </div>

                  <div className="relative" ref={productDropdownRef}>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all bg-slate-50/50"
                      placeholder="Search products to add..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      onFocus={() => setShowProductDropdown(true)}
                    />

                    {showProductDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[110] max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 p-2 space-y-1 custom-scrollbar">
                        {filteredProducts.length === 0 ? (
                          <div className="p-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                            No products found
                          </div>
                        ) : (
                          filteredProducts.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => toggleProduct(p.id)}
                              className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
                            >
                              <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                  form.product_ids.includes(p.id)
                                    ? "bg-blue-600 border-blue-600"
                                    : "border-slate-300 group-hover:border-blue-400 bg-white"
                                }`}
                              >
                                {form.product_ids.includes(p.id) && (
                                  <span className="text-white text-[10px]">✓</span>
                                )}
                              </div>
                              {p.images?.[0] && (
                                <img
                                  src={p.images[0]?.url}
                                  alt=""
                                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-100"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-700">{p.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                  ₹{p.base_price?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Product Tags */}
                  {form.product_ids.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 max-h-32 overflow-y-auto p-1">
                      {form.product_ids.map((id) => {
                        const product = getProductById(id);
                        if (!product) return null;
                        return (
                          <div
                            key={id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl animate-in zoom-in duration-200"
                          >
                            {product.images?.[0] && (
                              <img
                                src={product.images[0]?.url}
                                alt=""
                                className="w-4 h-4 rounded object-cover"
                              />
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-wide">
                              {product.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeProduct(id);
                              }}
                              className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors"
                            >
                              <span className="text-xs">×</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 flex gap-4 pt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(EMPTY_FORM);
                  }}
                  className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {editingId ? "Updating..." : "Creating..."}
                    </>
                  ) : editingId ? (
                    "Update Coupon"
                  ) : (
                    "Create Coupon"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUPON LIST SECTION */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col min-h-[600px] mb-10 transition-all scrollbar-hide">
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100 bg-slate-50/30">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Active Coupons</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Manage your storefront's discount logic
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
              {coupons.length} total coupons
            </span>
          </div>
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
          <div className="overflow-x-auto scrollbar-hide pb-44">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="text-left px-10 py-5">Code</th>
                  <th className="text-left px-10 py-5">Type</th>
                  <th className="text-left px-10 py-5">Discount</th>
                  <th className="text-left px-10 py-5">Min Order</th>
                  <th className="text-left px-10 py-5">Max Cap</th>
                  <th className="text-left px-10 py-5">Usage</th>
                  <th className="text-left px-10 py-5">Validity</th>
                  <th className="text-left px-10 py-5">Scope</th>
                  <th className="text-left px-10 py-5">Status</th>
                  <th className="text-center px-10 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {coupons.map((coupon) => {
                  const active = isCouponActive(coupon);
                  return (
                    <tr
                      key={coupon.id}
                      onClick={() => setViewingCoupon(coupon)}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer group/row"
                    >
                      {/* Code */}
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-800 tracking-widest text-xs bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-transform group-hover/row:scale-105">
                            {coupon.code}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(coupon.code);
                            }}
                            title="Copy code"
                            className="text-slate-300 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-white"
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

                      {/* Type */}
                      <td className="px-10 py-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                          {coupon.discount_type?.toUpperCase() === "PERCENTAGE"
                            ? "Percentage (%)"
                            : "Flat (₹)"}
                        </span>
                      </td>

                      {/* Discount */}
                      <td className="px-10 py-6">
                        <span
                          className={`font-bold text-base tracking-tight ${coupon.discount_type?.toUpperCase() === "PERCENTAGE" ? "text-indigo-600" : "text-purple-600"}`}
                        >
                          {coupon.discount_type?.toUpperCase() === "PERCENTAGE"
                            ? `${coupon.discount_value}% OFF`
                            : `₹${Number(coupon.discount_value).toLocaleString()} OFF`}
                        </span>
                      </td>

                      {/* Min Order */}
                      <td className="px-10 py-6 text-slate-600 font-bold text-sm tracking-tight">
                        ₹{Number(coupon.min_order_amount).toLocaleString()}
                      </td>

                      {/* Max Cap */}
                      <td className="px-10 py-6 text-slate-600 font-bold text-sm tracking-tight">
                        ₹{Number(coupon.max_discount_amount).toLocaleString()}
                      </td>

                      {/* Usage */}
                      <td className="px-10 py-6">
                        <div className="flex flex-col gap-1.5 min-w-[120px]">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Usage</span>
                            <span className="text-slate-600">
                              {coupon.used_count}/{coupon.usage_limit || "∞"}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                              style={{
                                width:
                                  coupon.usage_limit > 0
                                    ? `${Math.min((coupon.used_count / coupon.usage_limit) * 100, 100)}%`
                                    : "0%",
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Validity */}
                      <td className="px-10 py-6">
                        <div className="flex flex-col gap-0.5 min-w-[100px]">
                          <div className="text-[10px] font-bold text-slate-800 tracking-tight">
                            {formatDate(coupon.start_date)}
                          </div>
                          <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                            Expires {formatDate(coupon.end_date)}
                          </div>
                        </div>
                      </td>

                      {/* Scope */}
                      <td className="px-10 py-6">
                        {coupon.products?.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm inline-block w-fit">
                              Product Specific
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em]">
                              {coupon.products.length} products
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm inline-block w-fit">
                            Global
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-10 py-6">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border shadow-sm ${
                            active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-10 py-6 text-center">
                        <div className="relative inline-block text-left">
                          <button
                            className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 border border-indigo-100/50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === coupon.id ? null : coupon.id);
                            }}
                          >
                            Actions
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 transition-transform duration-200 ${openMenuId === coupon.id ? "rotate-180" : ""}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>

                          {openMenuId === coupon.id && (
                            <div
                              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-[110] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingCoupon(coupon);
                                  setOpenMenuId(null);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-slate-400 group-hover:text-indigo-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                View Details
                              </button>
                              <button
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(coupon);
                                  setOpenMenuId(null);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-slate-400 group-hover:text-indigo-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit Coupon
                              </button>
                              <div className="h-px bg-slate-100 mx-4 my-1.5" />
                              <button
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 group"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(coupon.id);
                                  setOpenMenuId(null);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-red-400 group-hover:text-red-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW DETAILS SIDEBAR DRAWER */}
      {viewingCoupon && (
        <div className="fixed inset-0 z-[120] overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setViewingCoupon(null)}
          />
          <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-slate-100">
            {/* Drawer Header */}
            <div className="px-8 py-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Coupon Details</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                  ID: {viewingCoupon.id}
                </p>
              </div>
              <button
                onClick={() => setViewingCoupon(null)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm active:scale-95"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 flex flex-col items-center justify-center text-center gap-4 group">
                <div className="w-16 h-16 bg-white rounded-2xl border border-blue-200 flex items-center justify-center text-blue-600 shadow-lg shadow-blue-50 transition-transform group-hover:scale-110">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-3xl text-blue-700 tracking-widest mb-1 uppercase">
                    {viewingCoupon.code}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full border shadow-sm ${
                      isCouponActive(viewingCoupon)
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {isCouponActive(viewingCoupon) ? "Active & Ready" : "Expired / Inactive"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Discount Type
                  </label>
                  <div className="font-bold text-slate-800 text-lg uppercase">
                    {viewingCoupon.discount_type?.toUpperCase() === "PERCENTAGE"
                      ? "Percentage (%)"
                      : "Flat (₹)"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Value
                  </label>
                  <div className="font-bold text-slate-800 text-lg">
                    {viewingCoupon.discount_type?.toUpperCase() === "PERCENTAGE"
                      ? `${viewingCoupon.discount_value}% OFF`
                      : `₹${Number(viewingCoupon.discount_value).toLocaleString()} OFF`}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Usage Count
                  </label>
                  <div className="font-bold text-slate-800 text-lg flex items-baseline gap-1">
                    {viewingCoupon.used_count}
                    <span className="text-[10px] text-slate-300">
                      / {viewingCoupon.usage_limit || "∞"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Min Order
                  </label>
                  <div className="font-bold text-slate-800 text-lg tracking-tight">
                    ₹{Number(viewingCoupon.min_order_amount).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Associated Products Section */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Applicable Scope
                  </h4>
                  {viewingCoupon.products?.length > 0 ? (
                    <span className="bg-indigo-50 text-indigo-600 text-[9px] font-bold px-2 py-0.5 rounded-md border border-indigo-100">
                      Product Specific
                    </span>
                  ) : (
                    <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-md border border-blue-100">
                      Global Coupon
                    </span>
                  )}
                </div>

                {viewingCoupon.products?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {viewingCoupon.products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-all group"
                      >
                        <div className="w-10 h-10 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0].url}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              📦
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-700 text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                            ₹{product.base_price?.toLocaleString() || "—"}
                          </p>
                        </div>
                        <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
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
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-blue-50/30 rounded-2xl border border-blue-100/50 text-center">
                    <p className="text-blue-700 font-bold text-xs uppercase tracking-widest">
                      Global Scope
                    </p>
                    <p className="text-blue-500/70 text-[10px] mt-1 font-medium">
                      This coupon applies to all products in your store.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Validity Period
                </h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block">
                      Starts
                    </label>
                    <div className="font-bold text-slate-700 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      {formatDate(viewingCoupon.start_date)}
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block">
                      Expires
                    </label>
                    <div className="font-bold text-slate-700 flex items-center justify-end gap-2">
                      {formatDate(viewingCoupon.end_date)}
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Performance Tracking
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Usage Progress</span>
                    <span className="text-slate-700 font-bold">
                      {viewingCoupon.usage_limit > 0
                        ? `${Math.round((viewingCoupon.used_count / viewingCoupon.usage_limit) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                      style={{
                        width:
                          viewingCoupon.usage_limit > 0
                            ? `${Math.min((viewingCoupon.used_count / viewingCoupon.usage_limit) * 100, 100)}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => {
                  setViewingCoupon(null);
                  handleEdit(viewingCoupon);
                }}
                className="flex-1 bg-white border border-slate-200 text-blue-600 font-bold uppercase tracking-widest text-[10px] py-4 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95 shadow-sm"
              >
                Edit Coupon
              </button>
              <button
                onClick={() => setViewingCoupon(null)}
                className="flex-1 bg-slate-800 text-white font-bold uppercase tracking-widest text-[10px] py-4 rounded-2xl hover:bg-slate-900 transition-all active:scale-95"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
