import React, { useState, useEffect, useRef } from "react";
import { Product, ProductImage } from "../../../types";

interface ProductDetailsModalProps {
  viewProduct: Product | null;
  setViewProduct: (p: Product | null) => void;
  getCategoryPath: (categoryId: string) => string;
  handleEditClick: (p: Product) => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  viewProduct,
  setViewProduct,
  getCategoryPath,
  handleEditClick,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [prevProductId, setPrevProductId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const getUrl = (img: ProductImage | string): string => (typeof img === "string" ? img : img.url);

  const currentId = viewProduct?.id || (viewProduct as any)?._id;
  if (viewProduct && currentId !== prevProductId) {
    setPrevProductId(currentId);
    if (Array.isArray(viewProduct.images)) {
      const mainImage = (viewProduct.images as any[]).find((img) => img && img.is_main);
      setSelectedImage(mainImage?.url || getUrl(viewProduct.images[0]) || "");
    } else {
      setSelectedImage("");
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setViewProduct(null);
      }
    };

    if (viewProduct) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [viewProduct, setViewProduct]);

  if (!viewProduct) return null;

  const galleryImages = (Array.isArray(viewProduct.images) ? viewProduct.images : []) as (
    | ProductImage
    | string
  )[];

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[999] backdrop-blur-sm p-4 animate-fade-in">
      <div
        ref={modalRef}
        className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up custom-scrollbar"
      >
        <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {viewProduct.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  ID: {viewProduct.id || (viewProduct as any)._id}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                  {viewProduct.brand || "GENERIC"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setViewProduct(null)}
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

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10">
          <div className="space-y-6">
            <div className="aspect-square relative group bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden flex items-center justify-center shadow-inner">
              <img
                src={selectedImage || "https://placehold.jp/400x400.png?text=No%20Image"}
                alt={viewProduct.name}
                className="w-full h-full object-contain p-4"
              />

              {/* Navigation */}
              {galleryImages.length > 1 && (
                <div className="absolute inset-x-4 bottom-4 flex justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIndex = galleryImages.findIndex(
                        (img) => getUrl(img) === selectedImage,
                      );
                      const prevIndex =
                        currentIndex > 0 ? currentIndex - 1 : galleryImages.length - 1;
                      const prevImg = galleryImages[prevIndex];
                      setSelectedImage(getUrl(prevImg));
                    }}
                    className="w-10 h-10 bg-white/90 rounded-xl shadow-lg shadow-black/5 flex items-center justify-center text-slate-600 hover:bg-white hover:scale-110 transition-all"
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
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIndex = galleryImages.findIndex(
                        (img) => getUrl(img) === selectedImage,
                      );
                      const nextIndex =
                        currentIndex < galleryImages.length - 1 ? currentIndex + 1 : 0;
                      const nextImg = galleryImages[nextIndex];
                      setSelectedImage(getUrl(nextImg));
                    }}
                    className="w-10 h-10 bg-white/90 rounded-xl shadow-lg shadow-black/5 flex items-center justify-center text-slate-600 hover:bg-white hover:scale-110 transition-all"
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
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {galleryImages.map((img, i) => {
                  const finalUrl = getUrl(img);

                  return (
                    <div
                      key={(img as ProductImage).id || (img as ProductImage)._id || i}
                      onClick={() => setSelectedImage(finalUrl)}
                      className={`w-16 h-16 flex-shrink-0 cursor-pointer rounded-2xl border-2 transition-all p-1 bg-white overflow-hidden ${
                        selectedImage === finalUrl
                          ? "border-indigo-600 ring-4 ring-indigo-50"
                          : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <img
                        src={finalUrl}
                        className="w-full h-full object-contain rounded-xl"
                        alt=""
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                  Category
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {typeof viewProduct.category === "string"
                    ? getCategoryPath(viewProduct.category)
                    : viewProduct.category?.name ||
                      getCategoryPath(
                        (viewProduct as any).category_id || (viewProduct as any).categoryId,
                      ) ||
                      "Uncategorized"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                  Availability
                </p>
                <div>
                  {(() => {
                    const status = viewProduct.availability || "INSTOCK";
                    switch (status) {
                      case "OUTOFSTOCK":
                        return (
                          <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-red-100 uppercase tracking-wider">
                            OUT OF STOCK
                          </span>
                        );
                      case "PREORDER":
                        return (
                          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-wider">
                            PRE-ORDER
                          </span>
                        );
                      default:
                        return (
                          <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-green-100 uppercase tracking-wider">
                            IN STOCK
                          </span>
                        );
                    }
                  })()}
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                Description
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                {viewProduct.description || "No description available for this product."}
              </p>
            </div>

            {/* VARIANTS SECTION */}
            {viewProduct.variants && viewProduct.variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  Product Variants ({viewProduct.variants.length})
                </h3>
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50/50 border-b border-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Variant
                        </th>
                        <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Price
                        </th>
                        <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          SKU
                        </th>
                        <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {viewProduct.variants.map((v, idx) => (
                        <tr
                          key={v.id || (v as any)._id || idx}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap gap-1.5">
                              {v.color && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-black rounded-md uppercase border border-slate-200">
                                  {v.color}
                                </span>
                              )}
                              {v.size && (
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-md uppercase border border-indigo-100">
                                  {v.size}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col">
                              {v.sale_price ? (
                                <>
                                  <span className="text-xs font-black text-slate-900">
                                    ₹{v.sale_price.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-slate-400 line-through">
                                    ₹{v.price.toLocaleString()}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs font-black text-slate-900">
                                  ₹{v.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[10px] font-bold text-slate-400">
                            {v.sku || "N/A"}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span
                              className={`text-[10px] font-black ${v.stock_qty <= 5 ? "text-red-500" : "text-slate-900"}`}
                            >
                              {v.stock_qty} unit{v.stock_qty !== 1 ? "s" : ""}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-end gap-3 pt-8 border-t border-slate-100">
          <button
            onClick={() => setViewProduct(null)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95 order-2 sm:order-1"
          >
            Close Window
          </button>
          <button
            onClick={() => {
              handleEditClick(viewProduct);
              setViewProduct(null);
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 order-1 sm:order-2 flex items-center justify-center gap-2"
          >
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
