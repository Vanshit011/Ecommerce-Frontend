import React from "react";

const ProductTable = ({
  products,
  loading,
  getImageUrl,
  getCategoryPath,
  setPreviewImage,
  setOpenMenuId,
  openMenuId,
  setViewProduct,
  handleEditClick,
  handleDelete,
  meta,
  page,
  setPage,
  limit,
  setLimit,
}) => {
  if (loading) {
    return (
      <div className="h-60 flex flex-col items-center justify-center gap-3 text-slate-500">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Product
            </th>
            <th className="hidden lg:table-cell text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              SKU
            </th>
            <th className="hidden md:table-cell text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Category
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Price
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Stock
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Status
            </th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-8 text-slate-500">
                No products found.
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr
                key={p.id || p._id}
                className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                onClick={() => setViewProduct(p)}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={getImageUrl(p)}
                      alt={p.name}
                      className="w-10 h-10 object-cover rounded-lg cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(getImageUrl(p));
                      }}
                      onError={(e) => {
                        e.target.src = "https://placehold.jp/400x400.png?text=No%20Image";
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 line-clamp-1">{p.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {p.brand || "No Brand"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="hidden lg:table-cell py-3 px-4">
                  <code className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {p.sku || "N/A"}
                  </code>
                </td>
                <td className="hidden md:table-cell py-3 px-4">
                  <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded-md text-slate-600 whitespace-nowrap">
                    {getCategoryPath(
                      p.category_id || p.categoryId || p.category?.id || p.category?._id,
                    )}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold ${p.sale_price || p.salePrice ? "text-slate-400 line-through text-xs" : "text-slate-800"}`}
                    >
                      ₹{p.price}
                    </span>
                    {(p.sale_price || p.salePrice) && (
                      <>
                        <span className="text-sm font-bold text-green-600">
                          ₹{p.sale_price || p.salePrice}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 w-fit mt-1">
                          Save ₹{(p.price - (p.sale_price || p.salePrice)).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-sm font-medium ${(p.stock_qty || p.stockQty || 0) < 10 ? "text-red-600" : "text-slate-700"}`}
                  >
                    {p.stock_qty || p.stockQty || 0}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {(p.stock_qty || p.stockQty || 0) <= 0 ? (
                    <span className="bg-red-100 text-red-600 text-[10px] font-bold uppercase px-2 py-1 rounded-full">
                      SOLD OUT
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        p.availability === "INSTOCK"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {p.availability?.replace("_", " ") || "UNKNOWN"}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="relative inline-block">
                    <button
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === (p.id || p._id) ? null : p.id || p._id);
                      }}
                    >
                      Actions
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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

                    {openMenuId === (p.id || p._id) && (
                      <div
                        className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                          onClick={() => {
                            setViewProduct(p);
                            setOpenMenuId(null);
                          }}
                        >
                          👁️ View Details
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                          onClick={() => {
                            handleEditClick(p);
                            setOpenMenuId(null);
                          }}
                        >
                          ✏️ Edit Product
                        </button>

                        <button
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 flex items-center gap-2"
                          onClick={() => {
                            handleDelete(p.id || p._id);
                            setOpenMenuId(null);
                          }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Section */}
      {meta &&
        (() => {
          const totalItems = meta.total || meta.totalItems || meta.count || 0;
          const explicitPages = meta.totalPages || meta.pageCount || meta.pages;
          const calculatedPages = Math.ceil(totalItems / (limit || 10));
          const totalPages = explicitPages || calculatedPages || (totalItems > 0 ? 1 : 0);

          // if (totalPages <= 1) return null; // Removed to always show pagination

          return (
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>Rows per page:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="border border-slate-200 rounded-lg p-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[5, 10, 20, 50].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-800">{(page - 1) * limit + 1}</span> to{" "}
                  <span className="font-semibold text-slate-800">
                    {Math.min(page * limit, totalItems)}
                  </span>{" "}
                  of <span className="font-semibold text-slate-800">{totalItems}</span> products
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-9 h-9 flex items-center justify-center rounded-lg border font-medium text-sm transition-all ${
                            page === pageNum
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                              : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === 2 || pageNum === totalPages - 1) {
                      return (
                        <span key={pageNum} className="px-1 text-slate-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next Page"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default ProductTable;
