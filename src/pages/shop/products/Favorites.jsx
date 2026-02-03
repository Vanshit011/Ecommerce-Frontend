import React, { useEffect, useState } from "react";
import { getFavorites, removeFromFavorites, addToCart, prefetchProductDetails, createOrder, getAddresses } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import Header from "../../../components/common/Header";
import { getImageUrl } from "../../../utils/imageUtils";
import { ProductSkeleton } from "../../../components/common/Skeleton";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // Load Favorites
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFavorites();

        const items = (res.data || []).map((f) => f.product || f);

        setFavorites(items);
      } catch (err) {
        console.error("Load favorites failed:", err);
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

      setFavorites((prev) =>
        prev.filter((item) => (item.id || item._id) !== id)
      );

      showToast("Removed from favorites", "success");
    } catch (err) {
      console.error("Remove favorite failed:", err);
      showToast("Failed to remove from favorites", "error");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    try {
      setAddingToCartId(productId);
      await addToCart(productId);
      showToast("Product added to bag!", "success");
    } catch {
      showToast("Failed to add to bag", "error");
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleBuyNow = async (e, productId) => {
    e.stopPropagation();
    try {
      setAddingToCartId(productId);
      await addToCart(productId);
      showToast("Added to bag! Redirecting...", "success");
      navigate("/cart");
    } catch {
      showToast("Failed to add to bag", "error");
    } finally {
      setAddingToCartId(null);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">

        <h2 className="text-2xl font-semibold mb-6">
          Your Favorites ❤️
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 animate-fade-in">
            {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
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
            <button
              onClick={() => navigate("/products")}
              className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95"
            >
              Start Shopping
            </button>
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
                    className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 transition-all duration-300 transform active:scale-110 ${removingId === (product.id || product._id)
                      ? "text-slate-300"
                      : "text-red-500 hover:bg-red-50"
                      }`}
                  >
                    {removingId === (product.id || product._id) ? (
                      <div className="w-4 h-4 border-2 border-slate-200 border-t-red-500 rounded-full animate-spin" />
                    ) : "♥"}
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
                      {product.salePrice && (
                        <span className="text-[10px] text-slate-400 line-through font-bold">₹{product.price?.toLocaleString()}</span>
                      )}
                      <span className="text-lg font-black text-slate-900 leading-none mt-0.5">
                        ₹{(product.salePrice || product.price || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleBuyNow(e, product.id || product._id)}
                        className="flex-1 bg-blue-600 text-white py-2.5 px-3 rounded-1.5xl font-bold text-[10px] hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-100"
                      >
                        Buy
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product.id || product._id}`);
                        }}
                        className="flex-1 bg-slate-900 text-white py-2.5 px-3 rounded-1.5xl font-bold text-[10px] hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(e, product.id || product._id);
                        }}
                        disabled={addingToCartId === (product.id || product._id)}
                        className={`w-10 h-10 flex items-center justify-center rounded-1.5xl transition-all shadow-lg flex-shrink-0 ${addingToCartId === (product.id || product._id)
                          ? "bg-slate-100 text-slate-400"
                          : "bg-blue-600 text-white hover:bg-blue-700 hover:rotate-12 shadow-blue-100"
                          }`}
                      >
                        {addingToCartId === (product.id || product._id) ? (
                          <div className="w-4 h-4 border-2 border-slate-200 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        )}
                      </button>
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
