import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, getCategories } from "../../services/api";
import { getImageUrl } from "../../utils/imageUtils";
import { ProductSkeleton } from "../../components/common/Skeleton";
import { getLowestPrice, hasVariants, getPriceRange } from "../../utils/variantUtils";
import flashSaleImg from "../../assets/images/flash-sale.jpg";

const Home = () => {
  const navigate = useNavigate();

  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);

        const products = prodRes?.data?.data || prodRes?.data;
        const rawCats =
          catRes?.data?.data ||
          catRes?.data?.categories ||
          (Array.isArray(catRes?.data) ? catRes.data : []);

        // Logic from Header.jsx to be consistent
        const buildCategoryTree = (cats) => {
          const tree = cats.filter((cat) => {
            const hasNoParent =
              !cat.parentId &&
              (!cat.parent ||
                (typeof cat.parent === "object" && !cat.parent.id && !cat.parent._id));
            return hasNoParent;
          });

          const attachChildren = (parent) => {
            const children = cats.filter((cat) => {
              const parentIdMatch = cat.parentId === (parent.id || parent._id);
              const parentObjMatch =
                cat.parent &&
                typeof cat.parent === "object" &&
                (cat.parent.id === (parent.id || parent._id) ||
                  cat.parent._id === (parent.id || parent._id));
              return parentIdMatch || parentObjMatch;
            });

            if (children.length > 0) {
              parent.children = children.map((child) => attachChildren({ ...child }));
            }
            return parent;
          };

          return tree.map((cat) => attachChildren({ ...cat }));
        };

        const tree = buildCategoryTree(rawCats);
        let finalCats = tree;

        // Flatten single root: If only 1 root exists, show its children instead
        if (tree.length === 1 && tree[0].children && tree[0].children.length > 0) {
          finalCats = tree[0].children;
        }

        setCategories(finalCats);
        setFeatured(products.slice(0, 8));
        setBestSellers(products.slice(8, 16));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* HERO SECTION */}
      <section className="relative bg-white overflow-hidden pb-12">
        <div className="absolute inset-0 bg-blue-50/50"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 pt-8 md:pt-12 relative z-10">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-blue-200 overflow-hidden relative group">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
              {/* Left Content */}
              <div className="flex-1 text-center md:text-left">
                <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-widest uppercase mb-6 animate-fade-in text-yellow-300 shadow-lg">
                  ⚡ Flash Sale Live
                </span>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight animate-slide-up">
                  Discover{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 filter drop-shadow-sm">
                    Limitless
                  </span>
                  <br />
                  Shopping
                </h1>

                <p className="text-lg md:text-xl text-blue-100 max-w-xl mx-auto md:mx-0 mb-8 leading-relaxed font-medium opacity-90">
                  Experience the best in Electronics & Fashion with up to{" "}
                  <span className="font-bold text-yellow-300">70% OFF</span> on premium brands.
                </p>

                <button
                  onClick={() => navigate("/products")}
                  className="bg-white text-blue-900 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-yellow-400 hover:text-blue-900 transition-all hover:scale-105 shadow-xl shadow-blue-900/30 active:scale-95 flex items-center gap-2 mx-auto md:mx-0"
                >
                  Start Shopping
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Right Image */}
              <div className="flex-1 w-full max-w-md md:max-w-none flex justify-center md:justify-end relative">
                <div className="relative group/image">
                  <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-2xl opacity-40 group-hover/image:opacity-60 transition-opacity duration-500"></div>
                  <img
                    src={flashSaleImg}
                    alt="Flash Sale"
                    className="relative w-full max-h-[500px] object-cover rounded-3xl shadow-2xl border-4 border-white/10 rotate-3 hover:rotate-0 transition-all duration-500 ease-out"
                  />

                  {/* Floating Badge */}
                  <div className="absolute -bottom-6 -left-6 bg-white text-blue-900 p-4 rounded-2xl shadow-xl animate-bounce-slow hidden md:block">
                    <div className="text-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Limited Time
                      </p>
                      <p className="text-2xl font-black">80% OFF</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Shop by Category</h2>
              <p className="text-slate-500 mt-1">Explore our wide range of collections</p>
            </div>
          </div>

          <div className="relative w-full overflow-hidden pb-6 pt-2">
            <div className="absolute top-0 bottom-0 left-0 w-8 md:w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 bottom-0 right-0 w-8 md:w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

            <div className="flex gap-4 animate-marquee hover:[animation-play-state:paused]">
              {[...categories, ...categories].map((cat, index) => (
                <div
                  key={`${cat.id || cat._id}-${index}`}
                  onClick={() => navigate(`/products?category=${cat.id || cat._id}`)}
                  className="min-w-[140px] flex-shrink-0 cursor-pointer group"
                >
                  <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 group-hover:shadow-xl group-hover:shadow-blue-100/50 group-hover:-translate-y-2 transition-all duration-300 flex flex-col items-center h-full">
                    <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-colors rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner">
                      🛍️
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors text-center text-sm leading-tight">
                      {cat.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-2 block">
                Premium Selection
              </span>
              <h2 className="text-3xl font-bold text-slate-900">Featured Products</h2>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="group flex items-center gap-2 text-slate-500 font-semibold hover:text-blue-600 transition-colors"
            >
              View All
              <span className="bg-slate-100 p-2 rounded-full group-hover:bg-blue-50 transition-colors">
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
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
              : featured.map((p) => (
                  <div
                    key={p.id || p._id}
                    onClick={() => navigate(`/product/${p.id || p._id}`)}
                    className="group bg-white rounded-[2rem] border border-slate-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full relative"
                  >
                    <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to wishlist logic if needed
                        }}
                        className="w-10 h-10 bg-white rounded-full shadow-lg text-slate-400 hover:text-red-500 flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        ♥
                      </button>
                    </div>

                    <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-50 to-white p-6 overflow-hidden">
                      <img
                        src={getImageUrl(p)}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      {p.salePrice && (
                        <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 pb-1.5 rounded-full shadow-lg shadow-red-200 tracking-wider">
                          SALE
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
                        {p.brand || "PREMIUM"}
                      </p>
                      <h4 className="font-bold text-slate-800 text-lg mb-1 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                        {p.name}
                      </h4>

                      <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-50">
                        <div>
                          {hasVariants(p) ? (
                            <>
                              {p.variants.length > 1 ? (
                                <span className="text-xl font-black text-slate-900 tracking-tight">
                                  {getPriceRange(p.variants)}
                                </span>
                              ) : (
                                <span className="text-xl font-black text-slate-900 tracking-tight">
                                  ₹{getLowestPrice(p.variants).toLocaleString()}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xl font-black text-slate-900 tracking-tight">
                              ₹{(p.salePrice || p.price || 0).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Clickable card replaces separate buttons for a cleaner UI */}
                        <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0 duration-300">
                          <span>Details</span>
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
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="py-16 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-purple-600 font-bold tracking-widest uppercase text-xs mb-2 block">
                Trending Now
              </span>
              <h2 className="text-3xl font-bold text-slate-900">Best Sellers</h2>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="bg-white px-5 py-2.5 rounded-xl font-bold text-slate-600 shadow-sm hover:shadow-md hover:text-blue-600 transition-all border border-slate-200"
            >
              View Collection
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
              : bestSellers.map((p) => (
                  <div
                    key={p.id || p._id}
                    onClick={() => navigate(`/product/${p.id || p._id}`)}
                    className="group bg-white rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className="flex p-4 gap-4">
                      <div className="w-24 h-24 bg-slate-50 rounded-2xl p-2 flex-shrink-0">
                        <img
                          src={getImageUrl(p)}
                          alt={p.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      <div className="flex flex-col flex-1 min-w-0 py-1">
                        <div className="mb-auto">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {p.brand || "Top Rated"}
                          </p>
                          <h4 className="font-bold text-slate-800 text-sm leading-tight truncate group-hover:text-blue-600 transition-colors">
                            {p.name}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-black text-slate-900">
                            {hasVariants(p)
                              ? `₹${getLowestPrice(p.variants).toLocaleString()}`
                              : `₹${(p.salePrice || p.price || 0).toLocaleString()}`}
                          </span>

                          <div className="w-8 h-8 flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors">
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
