import React, { useEffect, useRef } from "react";

const ProductModal = ({
  showModal,
  setShowModal,
  isEditingId,
  formData,
  setFormData,
  handleChange,
  handleSubmit,
  isSubmitting,
  flattenedCategories,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal, setShowModal]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fade-in">
      <div
        ref={modalRef}
        className="bg-white rounded-[2rem] p-6 md:p-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl animate-scale-up custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              {isEditingId ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {isEditingId ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                {isEditingId
                  ? `Modifying ID: ${isEditingId}`
                  : "Create a new entry in your catalog"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Section 1: Basic Info */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-8 h-[2px] bg-indigo-100"></span>
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Product Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., iPhone 15 Pro Max"
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Brand
                </label>
                <input
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Apple"
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all outline-none text-slate-700 font-bold bg-white appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {flattenedCategories.map((cat) => (
                    <option key={cat.id || cat._id} value={cat.id || cat._id}>
                      {cat.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  SKU *
                </label>
                <input
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  placeholder="PROD-123-ABC"
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all outline-none text-slate-700 font-mono text-sm placeholder:text-slate-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Detailed description of the product..."
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all outline-none text-slate-700 font-medium resize-none placeholder:text-slate-300"
              />
            </div>
            <div className="flex flex-wrap items-center gap-8 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Active Status
                </span>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none ${
                    formData.isActive ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                      formData.isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Main Image Index
                </label>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        mainImageIndex: Math.max(0, prev.mainImageIndex - 1),
                      }))
                    }
                    className="p-1 hover:text-indigo-600 text-slate-400"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={formData.mainImageIndex}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        mainImageIndex: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-8 text-center font-black text-indigo-600 border-none focus:ring-0 p-0 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        mainImageIndex: Math.min(8, prev.mainImageIndex + 1),
                      }))
                    }
                    className="p-1 hover:text-indigo-600 text-slate-400"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Variants */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-8 h-[2px] bg-indigo-100"></span>
              Inventory & Variants
            </h3>

            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-50">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Color</th>
                      <th className="px-6 py-4">Size *</th>
                      <th className="px-6 py-4">Price *</th>
                      <th className="px-6 py-4">Stock *</th>
                      <th className="px-6 py-4">SKU</th>
                      <th className="px-6 py-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {formData.variants.map((variant, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <input
                            value={variant.color || ""}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[idx].color = e.target.value;
                              setFormData((prev) => ({ ...prev, variants: newVariants }));
                            }}
                            placeholder="Red"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <input
                            value={variant.size || ""}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[idx].size = e.target.value;
                              setFormData((prev) => ({ ...prev, variants: newVariants }));
                            }}
                            placeholder="XL"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={variant.price || ""}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[idx].price = e.target.value;
                                setFormData((prev) => ({ ...prev, variants: newVariants }));
                              }}
                              required
                              placeholder="999"
                              className="w-full bg-white border border-slate-200 rounded-xl pl-6 pr-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all"
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <input
                            type="number"
                            value={variant.stock_qty || variant.stockQty || ""}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[idx].stock_qty = e.target.value;
                              setFormData((prev) => ({ ...prev, variants: newVariants }));
                            }}
                            required
                            placeholder="50"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <input
                            value={variant.sku || ""}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              newVariants[idx].sku = e.target.value;
                              setFormData((prev) => ({ ...prev, variants: newVariants }));
                            }}
                            placeholder="V-RED-XL"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all"
                          />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const newVariants = formData.variants.filter((_, i) => i !== idx);
                              setFormData((prev) => ({ ...prev, variants: newVariants }));
                            }}
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    variants: [
                      ...prev.variants,
                      { color: "", size: "", price: "", stock_qty: "", sku: "" },
                    ],
                  }));
                }}
                className="w-full py-4 bg-slate-50/50 text-indigo-600 hover:bg-indigo-50 transition-all text-xs font-black uppercase tracking-widest border-t border-slate-50"
              >
                + Add New Variant Combination
              </button>
            </div>
          </div>

          {/* Section 3: Media */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-8 h-[2px] bg-indigo-100"></span>
              Product Media
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature Image */}
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Feature Image
                </label>
                <div className="bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center gap-4 group hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden h-[240px]">
                  {formData.image || isEditingId ? (
                    <img
                      src={
                        formData.image instanceof File
                          ? URL.createObjectURL(formData.image)
                          : formData.image || "https://placehold.jp/400x400.png?text=No%20Image"
                      }
                      alt="Feature preview"
                      className="absolute inset-0 w-full h-full object-contain p-4"
                    />
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Click to upload main image
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Gallery */}
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Product Gallery
                </label>
                <div className="bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 p-6 min-h-[240px] flex flex-col gap-4 group hover:border-indigo-300 transition-all cursor-pointer relative">
                  {(isEditingId && formData.images?.length > 0) ||
                  (formData.images && formData.images.length > 0) ? (
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from(formData.images).map((img, idx) => {
                        const url = img instanceof File ? URL.createObjectURL(img) : img.url || img;
                        if (!url || typeof url !== "string") return null;
                        return (
                          <div
                            key={idx}
                            className="aspect-square rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm relative"
                          >
                            <img src={url} className="w-full h-full object-cover" alt="" />
                          </div>
                        );
                      })}
                      <div className="aspect-square rounded-xl border border-indigo-200 bg-indigo-50/30 flex items-center justify-center text-indigo-600">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-1 gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Drag and drop gallery images here
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="images"
                    multiple
                    onChange={(e) => setFormData((prev) => ({ ...prev, images: e.target.files }))}
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-10 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
              className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all disabled:opacity-50 active:scale-95 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3 active:scale-95 text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving Changes...
                </>
              ) : (
                <>
                  {isEditingId ? "Update Product" : "Publish Product"}
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
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
