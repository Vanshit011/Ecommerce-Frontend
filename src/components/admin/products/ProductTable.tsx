import React from "react";
import {
  getLowestPrice,
  getHighestPrice,
  getTotalStock,
  hasVariants,
} from "../../../utils/variantUtils";
import { Product } from "../../../types";

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  getImageUrl: (p: Product) => string;
  getCategoryPath: (categoryId: string) => string;
  setPreviewImage: (url: string | null) => void;
  setOpenMenuId: (id: string | null) => void;
  openMenuId: string | null;
  setViewProduct: (p: Product | null) => void;
  handleEditClick: (p: Product) => void;
  handleDelete: (id: string) => void;
  meta: any;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
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
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="overflow-x-auto scrollbar-hide pb-44 flex-1">
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Product
              </th>
              <th className="hidden md:table-cell text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Category
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Variants
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
                <td colSpan={7} className="text-center py-8 text-slate-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p, index) => (
                <tr
                  key={p.id || (p as any)._id || `prod-${index}`}
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
                          (e.target as HTMLImageElement).src =
                            "https://placehold.jp/400x400.png?text=No%20Image";
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
                  <td className="hidden md:table-cell py-3 px-4">
                    <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded-md text-slate-600 whitespace-nowrap">
                      {getCategoryPath(
                        (p as any).category_id ||
                          (p as any).categoryId ||
                          (typeof p.category === "string" ? p.category : p.category?._id),
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {hasVariants(p) ? (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        {p.variants?.length} variant{(p.variants?.length ?? 0) > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">No variants</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {hasVariants(p) ? (
                      <div className="flex flex-col">
                        {(p.variants?.length ?? 0) > 1 ? (
                          <span className="text-sm font-semibold text-slate-800">
                            ₹{getLowestPrice(p.variants!).toLocaleString()} - ₹
                            {getHighestPrice(p.variants!).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-slate-800">
                            ₹{getLowestPrice(p.variants!).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ) : p.price ? (
                      <span className="text-sm font-semibold text-slate-800">
                        ₹{p.price.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">No price</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {hasVariants(p) ? (
                      <span
                        className={`text-sm font-medium ${getTotalStock(p.variants!) < 10 ? "text-red-600" : "text-slate-700"}`}
                      >
                        {getTotalStock(p.variants!)}
                      </span>
                    ) : (
                      <span
                        className={`text-sm font-medium ${(p.stock_qty || (p as any).stockQty || 0) < 10 ? "text-red-600" : "text-slate-700"}`}
                      >
                        {p.stock_qty || (p as any).stockQty || 0}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {(() => {
                      const status = p.availability || "INSTOCK";
                      switch (status) {
                        case "OUTOFSTOCK":
                          return (
                            <span className="bg-red-100 text-red-600 text-[10px] font-bold uppercase px-2 py-1 rounded-full whitespace-nowrap">
                              OUT OF STOCK
                            </span>
                          );
                        case "PREORDER":
                          return (
                            <span className="bg-blue-100 text-blue-600 text-[10px] font-bold uppercase px-2 py-1 rounded-full whitespace-nowrap">
                              PRE-ORDER
                            </span>
                          );
                        default:
                          return (
                            <span className="bg-green-100 text-green-600 text-[10px] font-bold uppercase px-2 py-1 rounded-full whitespace-nowrap">
                              IN STOCK
                            </span>
                          );
                      }
                    })()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="relative inline-block">
                      <button
                        className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          const id = p.id || (p as any)._id;
                          setOpenMenuId(openMenuId === id ? null : id);
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

                      {openMenuId === (p.id || (p as any)._id) && (
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
                            View Details
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                            onClick={() => {
                              handleEditClick(p);
                              setOpenMenuId(null);
                            }}
                          >
                            Edit Product
                          </button>

                          <button
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 flex items-center gap-2"
                            onClick={() => {
                              handleDelete(p.id || (p as any)._id);
                              setOpenMenuId(null);
                            }}
                          >
                            Delete
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
      </div>

      {/* Pagination Section */}
      {meta &&
        (() => {
          const totalItems = meta.total || meta.totalItems || meta.count || 0;
          const totalPages =
            meta.totalPages || meta.pageCount || Math.ceil(totalItems / (limit || 10)) || 1;

          return (
            <div className="mt-auto px-10 py-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/20">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Rows:
                  </span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all shadow-sm"
                  >
                    {[5, 10, 20, 50].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Showing <span className="text-slate-800">{(page - 1) * limit + 1}</span>-
                  <span className="text-slate-800">{Math.min(page * limit, totalItems)}</span> of{" "}
                  <span className="text-slate-800">{totalItems}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-100 bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                          className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 font-bold text-xs transition-all ${
                            page === pageNum
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                              : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-600 hover:bg-slate-50"
                          }`}
                        >
                          {String(pageNum).padStart(2, "0")}
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
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-slate-100 bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
