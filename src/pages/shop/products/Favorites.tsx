import React, { useEffect, useState } from "react";
import { getFavorites, removeFromFavorites, prefetchProductDetails } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import { getLowestPrice } from "../../../utils/variantUtils";
import { Button } from "antd";

import { getImageUrl } from "../../../utils/imageUtils";
import { ProductSkeleton } from "../../../components/common/Skeleton";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // Load Favorites
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getFavorites();
        const data = (res.data as any)?.data || res.data || [];
        const items = Array.isArray(data) ? data.map((f: any) => f.product || f) : [];
        setFavorites(items);
      } catch {
        // Silently skip if error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const removeItem = async (id) => {
    try {
      setRemovingId(id);
      await removeFromFavorites(id);

      setFavorites((prev) => prev.filter((item) => (item.id || item._id) !== id));

      showToast("Removed from favorites", "success");
    } catch (err) {
      console.error("Remove favorite failed:", err);
      showToast("Failed to remove from favorites", "error");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Your Favorites ❤️</h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 animate-fade-in">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-16 text-center border border-slate-100 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              ❤️
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Your wishlist is empty</h3>
            <p className="mb-8 text-slate-500 font-medium">
              Looks like you haven't added anything to your favorites yet.
            </p>
            <Button
              type="primary"
              onClick={() => navigate("/products")}
              className="bg-slate-900 text-white px-10 h-14 rounded-2xl font-bold hover:bg-slate-800 hover:text-white shadow-xl shadow-slate-200 transition-all active:scale-95 border-none text-base"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 animate-fade-in">
            {favorites.map((product) => (
              <div
                key={product.id || product._id}
                onClick={() => navigate(`/product/${product.id || product._id}`)}
                onMouseEnter={() => prefetchProductDetails(product.id || product._id)}
                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col h-full animate-slide-up"
              >
                {/* Image Section */}
                <div className="relative aspect-square bg-slate-50 overflow-hidden p-6">
                  <img
                    src={getImageUrl(product.images?.[0] || product.image || product)}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 bg-white/80 backdrop-blur-md text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-white/50">
                      {product.category?.name || "Product"}
                    </span>
                    {product.salePrice && (
                      <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg shadow-red-200 rotate-[-2deg]">
                        SALE
                      </span>
                    )}
                  </div>

                  {/* Remove from Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(product.id || product._id);
                    }}
                    disabled={removingId === (product.id || product._id)}
                    className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 transition-all duration-300 transform active:scale-110 ${
                      removingId === (product.id || product._id)
                        ? "text-slate-300"
                        : "text-red-500 hover:bg-red-50"
                    }`}
                  >
                    {removingId === (product.id || product._id) ? (
                      <div className="w-4 h-4 border-2 border-slate-200 border-t-red-500 rounded-full animate-spin" />
                    ) : (
                      "♥"
                    )}
                  </button>
                </div>

                {/* Info Section */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-800 truncate text-base group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {product.brand || "Premium QC"}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                    <div className="flex flex-col">
                      {(product.salePrice ||
                        product.sale_price ||
                        (product.variants?.[0] as any)?.sale_price) > 0 && (
                        <span className="text-[10px] text-slate-400 line-through font-bold">
                          ₹
                          {(
                            product.price ||
                            (product.variants?.[0] as any)?.price ||
                            0
                          ).toLocaleString()}
                        </span>
                      )}
                      <span className="text-lg font-black text-blue-600 leading-none mt-0.5">
                        ₹
                        {(
                          product.salePrice ||
                          product.sale_price ||
                          product.price ||
                          getLowestPrice(product.variants) ||
                          0
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                      View
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
