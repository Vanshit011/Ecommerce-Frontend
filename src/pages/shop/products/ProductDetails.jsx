import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProductDetails,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  getProductStats,
} from "../../../services/api";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../../../context/ToastContext";
import ReviewSection from "../../../components/shop/ReviewSection";
import StarRating from "../../../components/common/StarRating";

import { getImageUrl } from "../../../utils/imageUtils";
import { ProductDetailSkeleton } from "../../../components/common/Skeleton";
import ImageMagnifier from "../../../components/common/ImageMagnifier";
import {
  isVariantAvailable,
  getFirstAvailableVariant,
  hasVariants,
  getStockStatus,
  getAvailableColors,
  getAvailableSizes,
  findVariant,
  getLowestPrice,
} from "../../../utils/variantUtils";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addToCart: globalAddToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // Variant Selection State
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentColor, setCurrentColor] = useState("");
  const [currentSize, setCurrentSize] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const [res, statsRes] = await Promise.all([
          getProductDetails(id),
          getProductStats(id).catch(() => ({ data: null })),
        ]);

        const data = res.data?.data || res.data;
        const statsData = statsRes.data?.data || statsRes.data;

        setProduct(data);
        if (statsData) {
          setStats({
            averageRating:
              statsData.averageRating || statsData.average_rating || statsData.average || 0,
            totalReviews:
              statsData.totalReviews ||
              statsData.total_reviews ||
              statsData.count ||
              statsData.total ||
              0,
          });
        }

        // Handle initial image
        const mainImg = data?.images && data.images.length > 0 ? data.images[0] : data?.image;
        if (mainImg) setSelectedImage(getImageUrl(mainImg));
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    const checkFavoriteStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await getFavorites();
        const favs = res.data || [];
        const found = favs.some(
          (f) => String(f.product?.id || f.id || f.product?._id || f._id) === String(id),
        );
        setIsFavorite(found);
      } catch (err) {
        console.error("Error checking favorite status:", err);
      }
    };

    fetchProduct();
    checkFavoriteStatus();
  }, [id]);

  // Initialize selected variant when product loads
  useEffect(() => {
    if (product && hasVariants(product)) {
      const firstVariant = getFirstAvailableVariant(product.variants);
      if (firstVariant) {
        setSelectedVariant(firstVariant);
        setCurrentColor(firstVariant.color || "");
        setCurrentSize(firstVariant.size || "");
      }
    }
  }, [product]);

  // Update selected variant when attributes change
  useEffect(() => {
    if (product && hasVariants(product)) {
      const variant = findVariant(product.variants, currentColor, currentSize);
      setSelectedVariant(variant);
    }
  }, [currentColor, currentSize, product]);

  const toggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to add to favorites", "error");
      navigate("/login");
      return;
    }

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

  const validateSelection = () => {
    if (hasVariants(product) && !selectedVariant) {
      showToast("Please select a variant", "error");
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!validateSelection()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to add to cart", "error");
      navigate("/login");
      return;
    }

    try {
      setAddingToCart(true);
      await globalAddToCart(product.id || product._id, {
        variant_id: selectedVariant?.id,
        quantity: quantity,
      });
      showToast("Product added to cart!", "success");
    } catch (err) {
      console.error("Error adding to cart:", err);
      showToast(err.response?.data?.message || "Failed to add to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!validateSelection()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to checkout", "error");
      navigate("/login");
      return;
    }

    try {
      setBuyingNow(true);
      await globalAddToCart(product.id || product._id, {
        variant_id: selectedVariant?.id,
        quantity: quantity,
      });
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
        <ProductDetailSkeleton />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center flex-col">
          <h2 className="text-xl font-semibold mb-3">{error}</h2>
          <button onClick={() => navigate("/")} className="text-blue-600 hover:underline">
            Go Home
          </button>
        </div>
      </div>
    );

  return (
    <div className="bg-slate-50 min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500 overflow-x-auto whitespace-nowrap pb-2 sm:pb-0">
            <span
              onClick={() => navigate("/home")}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Home
            </span>
            <span className="text-slate-300">/</span>
            <span
              onClick={() => navigate("/products")}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Products
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium truncate max-w-[150px] sm:max-w-xs">
              {product?.name}
            </span>
          </nav>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
              Product Details
            </span>
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left: Image Gallery */}
            <div className="p-6 md:p-10 bg-white border-b lg:border-b-0 lg:border-r border-slate-100 relative z-20 rounded-t-[2.5rem] lg:rounded-l-[2.5rem] lg:rounded-tr-none overflow-visible">
              <div className="flex flex-col-reverse md:flex-row gap-4 h-full max-h-[600px] sticky top-24">
                {/* Thumbnails */}
                {(() => {
                  const gallery = [];
                  if (product?.image) gallery.push(product.image);
                  if (product?.images && Array.isArray(product.images)) {
                    product.images.forEach((img) => {
                      const imgUrl = typeof img === "string" ? img : img.url;
                      const isDup = gallery.some(
                        (g) => (typeof g === "string" ? g : g.url) === imgUrl,
                      );
                      if (!isDup) gallery.push(img);
                    });
                  }

                  if (gallery.length === 0) return null;

                  return (
                    <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:w-16 flex-shrink-0 scrollbar-hide py-1">
                      {gallery.map((img, i) => {
                        const url = getImageUrl(img);
                        const isSelected = selectedImage === url;
                        return (
                          <div
                            key={i}
                            onMouseEnter={() => setSelectedImage(url)}
                            onClick={() => setSelectedImage(url)}
                            className={`relative w-16 h-16 md:w-full md:h-16 flex-shrink-0 rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
                              isSelected
                                ? "border-blue-600 ring-2 ring-blue-50"
                                : "border-slate-100 hover:border-blue-900"
                            }`}
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            {isSelected && <div className="absolute inset-0 bg-blue-600/10" />}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Main Image */}
                <div className="flex-1 aspect-square md:aspect-[4/3] max-h-[350px] bg-slate-50 rounded-3xl overflow-visible border border-slate-100 group relative z-0">
                  <div className="w-full h-full flex items-center justify-center p-6 md:p-10">
                    <ImageMagnifier
                      src={selectedImage}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  {/* Navigation Buttons */}
                  {product?.images?.length > 0 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const gallery = [];
                          if (product?.image) gallery.push(getImageUrl(product.image));
                          if (product?.images)
                            product.images.forEach((img) => gallery.push(getImageUrl(img)));

                          const currentIndex = gallery.indexOf(selectedImage);
                          const prevIndex =
                            currentIndex > 0 ? currentIndex - 1 : gallery.length - 1;
                          setSelectedImage(gallery[prevIndex]);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
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
                          const gallery = [];
                          if (product?.image) gallery.push(getImageUrl(product.image));
                          if (product?.images)
                            product.images.forEach((img) => gallery.push(getImageUrl(img)));

                          const currentIndex = gallery.indexOf(selectedImage);
                          const nextIndex =
                            currentIndex < gallery.length - 1 ? currentIndex + 1 : 0;
                          setSelectedImage(gallery[nextIndex]);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
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
                    </>
                  )}

                  <div className="absolute top-6 right-6 h-14 w-14 flex items-center justify-center bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 group/fav active:scale-90 transition-all z-10">
                    <button
                      onClick={toggleFavorite}
                      className={`text-2xl transition-all duration-500 transform ${isFavorite ? "text-red-500 scale-125 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "text-slate-300 hover:text-slate-400"}`}
                    >
                      {isFavorite ? "♥" : "♡"}
                    </button>
                    <div className="absolute inset-0 bg-red-500/10 rounded-2xl opacity-0 group-hover/fav:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="p-8 md:p-12 lg:p-16 flex flex-col h-full bg-white relative z-10 rounded-b-[2.5rem] lg:rounded-r-[2.5rem] lg:rounded-bl-none">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-100/50">
                    {product?.category?.name || "Premium Collection"}
                  </span>
                  {hasVariants(product) ? (
                    selectedVariant && isVariantAvailable(selectedVariant) ? (
                      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100/50">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {getStockStatus(selectedVariant)}
                      </div>
                    ) : (
                      <span className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-red-200">
                        Sold Out
                      </span>
                    )
                  ) : (product?.stock_qty || product?.stockQty || 0) > 0 ? (
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100/50">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      In Stock
                    </div>
                  ) : (
                    <span className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-red-200">
                      Sold Out
                    </span>
                  )}
                </div>

                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-[1.1]">
                    {product?.name}
                  </h1>

                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <StarRating rating={Math.round(stats?.averageRating || 0)} size="sm" />
                      <span className="text-sm font-black text-slate-900">
                        {stats?.averageRating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                    <div className="w-[1px] h-4 bg-slate-200" />
                    <button
                      onClick={() =>
                        document
                          .getElementById("reviews-section")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:text-blue-700 transition-colors"
                    >
                      {stats?.totalReviews || 0} Reviews
                    </button>
                    <div className="w-[1px] h-4 bg-slate-200" />
                    <div className="text-slate-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                      {product?.brand || "Artist's Edition"}
                    </div>
                  </div>
                </div>

                {/* PRICE SECTION */}
                <div className="relative mb-10 group/price">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-[2.5rem] blur-xl opacity-0 group-hover/price:opacity-100 transition-opacity duration-700" />
                  <div className="relative p-8 bg-slate-50/50 backdrop-blur-sm rounded-[2rem] border border-slate-100 flex items-center justify-between overflow-hidden">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          {selectedVariant ? "Price" : "Starting From"}
                        </span>
                        {(selectedVariant?.sku || product?.sku || product?.variants?.[0]?.sku) && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-wider rounded">
                            SKU:{" "}
                            {selectedVariant?.sku || product?.sku || product?.variants?.[0]?.sku}
                          </span>
                        )}
                      </div>
                      <div className="grid">
                        <span className="text-5xl font-black text-slate-900 leading-none tracking-tighter">
                          ₹
                          {selectedVariant
                            ? (
                                selectedVariant.sale_price ||
                                selectedVariant.price ||
                                0
                              ).toLocaleString()
                            : hasVariants(product)
                              ? getLowestPrice(product.variants).toLocaleString()
                              : (
                                  product?.sale_price ||
                                  product?.salePrice ||
                                  product?.price ||
                                  0
                                ).toLocaleString()}
                        </span>
                        {selectedVariant?.sale_price && selectedVariant?.price ? (
                          <span className="text-lg text-slate-400 line-through font-bold mt-2 opacity-60">
                            ₹{selectedVariant.price.toLocaleString()}
                          </span>
                        ) : (
                          !selectedVariant &&
                          (product?.salePrice || product?.sale_price) &&
                          product?.price && (
                            <span className="text-lg text-slate-400 line-through font-bold mt-2 opacity-60">
                              ₹{product.price.toLocaleString()}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {selectedVariant?.sale_price && selectedVariant?.price && (
                      <div className="flex flex-col items-end gap-2 text-right">
                        <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black tracking-widest shadow-xl shadow-slate-200">
                          LIMITED OFFER
                        </div>
                        <div className="text-3xl font-black text-blue-600 tracking-tighter">
                          {Math.round(
                            ((selectedVariant.price - selectedVariant.sale_price) /
                              selectedVariant.price) *
                              100,
                          )}
                          % OFF
                        </div>
                        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                          You Save ₹
                          {(selectedVariant.price - selectedVariant.sale_price).toLocaleString()}
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
                    {product?.description ||
                      "Experience the perfect blend of style and functionality. Every detail of this masterpiece is crafted for excellence."}
                  </p>
                </div>

                {/* VARIANT SELECTORS */}
                {hasVariants(product) && (
                  <div className="space-y-8 mb-10">
                    {/* Color Selection */}
                    {getAvailableColors(product.variants).length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                          Selection Color
                          <span className="text-blue-600 font-bold lowercase tracking-normal">
                            — {currentColor || "Not selected"}
                          </span>
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {getAvailableColors(product.variants).map((color) => (
                            <button
                              key={color}
                              onClick={() => setCurrentColor(color)}
                              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                                currentColor === color
                                  ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100 scale-105"
                                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size Selection */}
                    {getAvailableSizes(product.variants).length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                          Selection Size
                          <span className="text-blue-600 font-bold lowercase tracking-normal">
                            — {currentSize || "Not selected"}
                          </span>
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {getAvailableSizes(product.variants).map((size) => (
                            <button
                              key={size}
                              onClick={() => setCurrentSize(size)}
                              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                                currentSize === size
                                  ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100 scale-105"
                                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-10">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-4">
                    Quantity
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-fit">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-white rounded-xl transition-all font-bold text-lg"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-bold text-slate-800 text-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-white rounded-xl transition-all font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-xs font-bold text-slate-400">
                      {selectedVariant
                        ? `${selectedVariant.stock_qty || 0} items available`
                        : hasVariants(product)
                          ? `Select variant to see stock`
                          : `${product?.stock_qty || product?.stockQty || 0} items available`}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIONS AREA */}
              <div className="mt-4 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-4">
                  <button
                    onClick={handleBuyNow}
                    disabled={
                      hasVariants(product)
                        ? !selectedVariant || !isVariantAvailable(selectedVariant)
                        : (product?.stock_qty || 0) <= 0 || buyingNow
                    }
                    className={`h-20 flex items-center justify-center gap-4 rounded-[2rem] font-black text-xl transition-all active:scale-95 shadow-2xl shadow-blue-200/50 ${
                      (
                        hasVariants(product)
                          ? !selectedVariant || !isVariantAvailable(selectedVariant)
                          : (product?.stock_qty || 0) <= 0
                      )
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
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={
                      hasVariants(product)
                        ? !selectedVariant || !isVariantAvailable(selectedVariant)
                        : (product?.stock_qty || 0) <= 0 || addingToCart
                    }
                    className={`h-20 flex items-center justify-center gap-4 rounded-[2rem] font-black text-xl transition-all active:scale-95 bg-white border-2 border-blue-600 group ${
                      (
                        hasVariants(product)
                          ? !selectedVariant || !isVariantAvailable(selectedVariant)
                          : (product?.stock_qty || 0) <= 0
                      )
                        ? "border-slate-100 text-slate-300 cursor-not-allowed"
                        : addingToCart
                          ? "bg-slate-50 text-slate-400 border-slate-200"
                          : "text-blue-600 hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    {addingToCart ? (
                      <div className="w-6 h-6 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 transform group-hover:scale-110 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        Add to Bag
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                    </svg>
                    Encrypted Secure Payment
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3v7h3.11a2.5 2.5 0 014.89 0H20V8a1 1 0 00-1-1h-5z" />
                    </svg>
                    Express Global Shipping
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="reviews-section">
          <ReviewSection productId={id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
