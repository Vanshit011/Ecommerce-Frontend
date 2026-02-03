import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProductDetails,
  addToCart,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  createOrder,
  getAddresses,
} from "../../../services/api";
import { useToast } from "../../../context/ToastContext";
import Header from "../../../components/common/Header";
import { getImageUrl } from "../../../utils/imageUtils";
import { ProductDetailSkeleton } from "../../../components/common/Skeleton";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductDetails(id);
        const data = res.data;
        setProduct(data);

        // Handle initial image
        const mainImg = data.images && data.images.length > 0
          ? data.images[0]
          : data.image;
        setSelectedImage(getImageUrl(mainImg));
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    const checkFavoriteStatus = async () => {
      try {
        const res = await getFavorites();
        const favs = res.data || [];
        // Loose comparison or string conversion for safety
        const found = favs.some((f) => String(f.product?.id || f.id || f.product?._id || f._id) === String(id));
        setIsFavorite(found);
      } catch (err) {
        console.error("Error checking favorite status:", err);
      }
    };

    fetchProduct();
    checkFavoriteStatus();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(id);
        showToast("Removed from favorites", "success");
      } else {
        await addToFavorites(id);
        showToast("Added to favorites", "success");
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      showToast("Failed to update favorites", "error");
    }
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await addToCart(product.id || product._id);
      showToast("Product added to cart!", "success");
    } catch (err) {
      console.error("Error adding to cart:", err);
      showToast(err.response?.data?.message || "Failed to add to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setBuyingNow(true);
      await addToCart(product.id || product._id);
      showToast("Added to bag! Redirecting...", "success");
      navigate("/cart");
    } catch (err) {
      console.error("Error in buy now:", err);
      showToast(err.response?.data?.message || "Failed to add to bag", "error");
    } finally {
      setBuyingNow(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <ProductDetailSkeleton />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center flex-col">
          <h2 className="text-xl font-semibold mb-3">{error}</h2>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:underline"
          >
            Go Home
          </button>
        </div>
      </div>
    );

  return (
    <div className="bg-slate-50 min-h-screen animate-fade-in">
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500 overflow-x-auto whitespace-nowrap pb-2 sm:pb-0">
            <span onClick={() => navigate("/home")} className="hover:text-blue-600 transition-colors cursor-pointer">Home</span>
            <span className="text-slate-300">/</span>
            <span onClick={() => navigate("/products")} className="hover:text-blue-600 transition-colors cursor-pointer">Products</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium truncate max-w-[150px] sm:max-w-xs">{product?.name}</span>
          </nav>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Product Details</span>
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Left: Image Gallery */}
            <div className="p-6 md:p-10 bg-white border-b lg:border-b-0 lg:border-r border-slate-100">
              <div className="flex flex-col gap-6 sticky top-24">
                <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 group relative">
                  <img
                    src={selectedImage}
                    alt={product?.name}
                    className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-6 right-6 h-14 w-14 flex items-center justify-center bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 group/fav active:scale-90 transition-all">
                    <button
                      onClick={toggleFavorite}
                      className={`text-2xl transition-all duration-500 transform ${isFavorite ? "text-red-500 scale-125 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "text-slate-300 hover:text-slate-400"}`}
                    >
                      {isFavorite ? "♥" : "♡"}
                    </button>
                    <div className="absolute inset-0 bg-red-500/10 rounded-2xl opacity-0 group-hover/fav:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Thumbnails */}
                {(() => {
                  const gallery = [];
                  if (product?.image) gallery.push(product.image);
                  if (product?.images && Array.isArray(product.images)) {
                    product.images.forEach(img => {
                      const imgUrl = typeof img === 'string' ? img : img.url;
                      const isDup = gallery.some(g => (typeof g === 'string' ? g : g.url) === imgUrl);
                      if (!isDup) gallery.push(img);
                    });
                  }

                  if (gallery.length === 0) return null;

                  return (
                    <div className="flex gap-4 overflow-x-auto pb-4 -mb-4 px-1 scrollbar-hide">
                      {gallery.map((img, i) => {
                        const url = getImageUrl(img);
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedImage(url)}
                            className={`w-20 h-20 flex-shrink-0 rounded-2xl border-2 transition-all p-2 bg-slate-50 ${selectedImage === url
                              ? "border-blue-600 bg-white ring-4 ring-blue-50"
                              : "border-slate-100 hover:border-slate-300"
                              }`}
                          >
                            <img src={url} alt="" className="w-full h-full object-contain" />
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="p-8 md:p-12 lg:p-16 flex flex-col h-full bg-white">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-100/50">
                    {product?.category?.name || "Premium Collection"}
                  </span>
                  {product?.stockQty > 0 ? (
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100/50">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      In Stock
                    </div>
                  ) : (
                    <span className="px-4 py-1.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-red-100/50">
                      Sold Out
                    </span>
                  )}
                </div>

                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-[1.1]">
                    {product?.name}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest">
                    <span className="w-8 h-[1px] bg-slate-200" />
                    {product?.brand || "Artist's Edition"}
                  </div>
                </div>

                {/* PRICE SECTION - LUXURY DESIGN */}
                <div className="relative mb-10 group/price">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-[2.5rem] blur-xl opacity-0 group-hover/price:opacity-100 transition-opacity duration-700" />
                  <div className="relative p-8 bg-slate-50/50 backdrop-blur-sm rounded-[2rem] border border-slate-100 flex items-center justify-between overflow-hidden">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Investment</span>
                      <div className="grid">
                        <span className="text-5xl font-black text-slate-900 leading-none tracking-tighter">
                          ₹{(product?.salePrice || product?.price || 0).toLocaleString()}
                        </span>
                        {product?.salePrice && (
                          <span className="text-lg text-slate-400 line-through font-bold mt-2 opacity-60">
                            ₹{product?.price?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {product?.salePrice && (
                      <div className="flex flex-col items-end gap-2 text-right">
                        <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black tracking-widest shadow-xl shadow-slate-200">
                          LIMITED OFFER
                        </div>
                        <div className="text-3xl font-black text-blue-600 tracking-tighter">
                          {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="mb-10 sm:mb-12">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-5 flex items-center gap-3">
                    Overview
                    <span className="flex-1 h-[1px] bg-slate-100" />
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-lg font-medium">
                    {product?.description || "Experience the perfect blend of style and functionality. Every detail of this masterpiece is crafted for excellence."}
                  </p>
                </div>

                {/* SPECIFICATIONS GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-10">
                  <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">Weight</span>
                    </div>
                    <span className="text-base font-black text-slate-900">{product?.weight ? `${product.weight} kg` : "Premium Weight"}</span>
                  </div>

                  <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">Size</span>
                    </div>
                    <span className="text-base font-black text-slate-900 line-clamp-1">{product?.dimensions || "One Size Fits All"}</span>
                  </div>
                </div>

                {/* OPTIONS */}
                {(product?.colors?.length > 0 || product?.sizes?.length > 0) && (
                  <div className="space-y-8 mb-12">
                    {product.colors?.length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4">Colorway</h3>
                        <div className="flex flex-wrap gap-2.5">
                          {product.colors.map((color, i) => (
                            <span key={i} className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 shadow-sm first-letter:uppercase">
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {product.sizes?.length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4">Select Dimension</h3>
                        <div className="flex flex-wrap gap-3">
                          {product.sizes.map((size, i) => (
                            <button key={i} className="min-w-[60px] h-[60px] flex items-center justify-center bg-white border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-800 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm active:scale-90">
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAGS */}
                {product?.tags?.length > 0 && (
                  <div className="pt-6 border-t border-slate-50">
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors cursor-pointer">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTIONS AREA */}
              <div className="mt-12 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-4">
                  <button
                    onClick={handleBuyNow}
                    disabled={product?.stockQty === 0 || buyingNow}
                    className={`h-20 flex items-center justify-center gap-4 rounded-[2rem] font-black text-xl transition-all active:scale-95 shadow-2xl shadow-blue-200/50 ${product?.stockQty === 0
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      : buyingNow
                        ? "bg-blue-600/50 text-white/50"
                        : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1"
                      }`}
                  >
                    {buyingNow ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Checkout Now
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={product?.stockQty === 0 || addingToCart}
                    className={`h-20 flex items-center justify-center gap-4 rounded-[2rem] font-black text-xl transition-all active:scale-95 bg-white border-2 border-slate-900 group ${product?.stockQty === 0
                      ? "border-slate-100 text-slate-300 cursor-not-allowed"
                      : addingToCart
                        ? "bg-slate-50 text-slate-400 border-slate-200"
                        : "text-slate-900 hover:bg-slate-900 hover:text-white"
                      }`}
                  >
                    {addingToCart ? (
                      <div className="w-6 h-6 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Add to Bag
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" /></svg>
                    Encrypted Secure Payment
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3v7h3.11a2.5 2.5 0 014.89 0H20V8a1 1 0 00-1-1h-5z" /></svg>
                    Express Global Shipping
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
