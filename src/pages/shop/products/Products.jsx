import React, { useState, useEffect, useCallback } from "react";
import { getProducts, getCategories, addToCart, getFavorites, addToFavorites, removeFromFavorites, prefetchProductDetails, createOrder, getAddresses } from "../../../services/api";
import Header from "../../../components/common/Header";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import { getImageUrl } from "../../../utils/imageUtils";
import { ProductSkeleton, CategorySkeleton } from "../../../components/common/Skeleton";

/* ================= CATEGORY TREE NODE ================= */

const CategoryNode = ({
  cat,
  level = 0,
  expandedCategories,
  toggleExpand,
  selectedCategories,
  toggleCategoryTree,
}) => {
  const id = cat.id || cat._id;
  const hasChildren = cat.children?.length > 0;
  const isExpanded = expandedCategories.has(id);
  const isChecked = selectedCategories.includes(id);

  return (
    <div style={{ paddingLeft: level === 0 ? 0 : 16 }}>
      <div className={`flex items-center gap-2 py-2 px-2 rounded-xl transition-colors ${isChecked ? "bg-blue-50/50" : "hover:bg-slate-50"}`}>

        {hasChildren ? (
          <button
            onClick={() => toggleExpand(id)}
            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-all shadow-sm"
          >
            <span className={`transform transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>▶</span>
          </button>
        ) : (
          <span className="w-5" />
        )}

        <label className="flex items-center gap-3 flex-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => toggleCategoryTree(cat)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 rounded-md transition-all cursor-pointer"
          />
          <span className={`text-sm font-medium transition-colors ${isChecked ? "text-blue-700" : "text-slate-600 group-hover:text-slate-900"}`}>
            {cat.name}
          </span>
        </label>
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          {hasChildren &&
            cat.children.map((child) => (
              <CategoryNode
                key={child.id || child._id}
                cat={child}
                level={level + 1}
                expandedCategories={expandedCategories}
                toggleExpand={toggleExpand}
                selectedCategories={selectedCategories}
                toggleCategoryTree={toggleCategoryTree}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */

const Products = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const cat = searchParams.get("category");
    return cat ? cat.split(",") : [];
  });

  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [meta, setMeta] = useState(null);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [minPrice, setMinPrice] = useState(Number(searchParams.get("minPrice")) || 0);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get("maxPrice")) || 100000);
  const [debouncedPrice, setDebouncedPrice] = useState({
    min: minPrice,
    max: maxPrice,
  });

  const [sort, setSort] = useState(searchParams.get("sort") || "created_at_desc");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit] = useState(9);

  const MIN_LIMIT = 0;
  const MAX_LIMIT = 100000;

  const [favoriteIds, setFavoriteIds] = useState([]);

  /*  SYNC URL PARAMS  */
  const updateURL = useCallback((params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === 0 || (key === "page" && value === 1)) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  /*  DEBOUNCE SEARCH  */

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      updateURL({ search });
    }, 300);
    return () => clearTimeout(t);
  }, [search, updateURL]);

  useEffect(() => {
    const t = setTimeout(
      () =>
        setDebouncedPrice({
          min: minPrice,
          max: maxPrice,
        }),
      400,
    );
    return () => clearTimeout(t);
  }, [minPrice, maxPrice]);

  /*  FAVORITES  */
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const res = await getFavorites();
        setFavoriteIds(res.data.map((f) => f.id || f._id));
      } catch { }
    };
    loadFavorites();
  }, []);

  const handleBuyNow = async (product) => {
    try {
      const pId = product.id || product._id;
      setAddingToCartId(pId);
      await addToCart(pId);
      showToast("Added to bag! Redirecting...", "success");
      navigate("/cart");
    } catch {
      showToast("Failed to add to bag", "error");
    } finally {
      setAddingToCartId(null);
    }
  };

  const toggleFavorite = useCallback(
    async (productId) => {
      const isFav = favoriteIds.includes(productId);

      try {
        if (isFav) {
          await removeFromFavorites(productId);
          setFavoriteIds((prev) => prev.filter((id) => id !== productId));
        } else {
          await addToFavorites(productId);
          setFavoriteIds((prev) => [...prev, productId]);
        }
      } catch { }
    },
    [favoriteIds],
  );

  /*  CART  */

  const handleAddToCart = async (productId) => {
    try {
      setAddingToCartId(productId);
      await addToCart(productId);
      showToast("Product added to bag!", "success");
    } catch (err) {
      console.error("Add to cart error:", err);
      showToast(err.response?.data?.message || "Failed to add to bag", "error");
    } finally {
      setAddingToCartId(null);
    }
  };

  /*  FETCH CATEGORIES  */

  /*  FETCH CATEGORIES & TREE BUILD  */

  const buildTree = useCallback((cats) => {
    if (!cats || cats.length === 0) return [];

    // Check if data is already nested (has children array populated)
    // We assume if at least one item has children, it's a tree structure
    const isAlreadyTree = cats.some(cat => cat.children && cat.children.length > 0);
    if (isAlreadyTree) return cats;

    // Build the tree structure from flat list
    const categoryMap = new Map();
    cats.forEach(cat => {
      const id = cat.id || cat._id;
      categoryMap.set(id, { ...cat, children: [] });
    });

    const roots = [];
    categoryMap.forEach(cat => {
      const parentId = cat.parentId || cat.parent?.id || cat.parent?._id;
      if (parentId && categoryMap.has(parentId)) {
        categoryMap.get(parentId).children.push(cat);
      } else {
        roots.push(cat);
      }
    });

    return roots;
  }, []);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        const data =
          res?.data?.data ||
          res?.data?.categories ||
          (Array.isArray(res?.data) ? res.data : []);

        setCategories(data);

        setCategories(data);
        setExpandedCategories(new Set());
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCats();
  }, [buildTree]);

  // Sync state from URL when it changes (e.g. clicking Header link)
  useEffect(() => {
    const searchParam = searchParams.get('search') || "";
    const categoryParam = searchParams.get('category');
    const pageParam = Number(searchParams.get('page')) || 1;
    const sortParam = searchParams.get('sort') || "created_at_desc";

    if (searchParam !== search) setSearch(searchParam);
    if (searchParam !== debouncedSearch) setDebouncedSearch(searchParam);

    if (categoryParam) {
      const catIds = categoryParam.split(",");
      if (JSON.stringify(catIds) !== JSON.stringify(selectedCategories)) {
        setSelectedCategories(catIds);
      }
    } else if (selectedCategories.length > 0 && !searchParam) {
      setSelectedCategories([]);
    }

    if (pageParam !== page) setPage(pageParam);
    if (sortParam !== sort) setSort(sortParam);
  }, [searchParams]);

  const treeData = React.useMemo(() => {
    const tree = buildTree(categories);
    // Flatten single root: If only 1 root exists (e.g. "Root" or "Catalog"), show its children instead
    if (tree.length === 1 && tree[0].children && tree[0].children.length > 0) {
      return tree[0].children;
    }
    return tree;
  }, [categories, buildTree]);

  /*  CATEGORY HELPERS  */

  const toggleExpand = (id) => {
    setExpandedCategories((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleCategoryTree = (cat) => {
    const id = cat.id || cat._id;
    const isSelected = selectedCategories.includes(id);

    // Helper function to get all descendant IDs
    const getAllDescendantIds = (category) => {
      const ids = [category.id || category._id];
      if (category.children && category.children.length > 0) {
        category.children.forEach(child => {
          ids.push(...getAllDescendantIds(child));
        });
      }
      return ids;
    };

    // Get all IDs to toggle (parent + all children)
    const idsToToggle = getAllDescendantIds(cat);

    let next;
    if (isSelected) {
      // Remove parent and all children
      next = selectedCategories.filter(x => !idsToToggle.includes(x));
    } else {
      // Add parent and all children
      const newIds = idsToToggle.filter(x => !selectedCategories.includes(x));
      next = [...selectedCategories, ...newIds];
    }

    setSelectedCategories(next);
    setPage(1);
    updateURL({ category: next.join(","), page: 1 });
  };

  // Get all category IDs including children for API filtering
  const getCategoryIdsForFilter = () => {
    if (selectedCategories.length === 0) return [];

    const allIds = new Set();

    // Create a flat map of all categories
    const categoryMap = new Map();
    const flattenCategories = (cats) => {
      cats.forEach(cat => {
        const catId = cat.id || cat._id;
        categoryMap.set(catId, cat);
        if (cat.children && cat.children.length > 0) {
          flattenCategories(cat.children);
        }
      });
    };
    flattenCategories(categories);

    // For each selected category, add it and all its children
    selectedCategories.forEach(selectedId => {
      allIds.add(selectedId);

      const category = categoryMap.get(selectedId);
      if (category) {
        const getChildIds = (cat) => {
          if (cat.children && cat.children.length > 0) {
            cat.children.forEach(child => {
              const childId = child.id || child._id;
              allIds.add(childId);
              getChildIds(child);
            });
          }
        };
        getChildIds(category);
      }
    });

    return Array.from(allIds);
  };

  /*  FETCH PRODUCTS  */

  useEffect(() => {
    const fetchProductsData = async () => {
      setLoading(true);

      try {
        // Get all category IDs including children of selected categories
        const categoryIdsToFilter = getCategoryIdsForFilter();

        const params = {
          page,
          limit,
          search: debouncedSearch || undefined,
          category: categoryIdsToFilter.length
            ? categoryIdsToFilter.join(",")
            : undefined,
          minPrice: debouncedPrice.min,
          maxPrice: debouncedPrice.max,
          sort,
        };

        const res = await getProducts(params);

        setProducts(res?.data?.data || []);
        setMeta(res?.data?.meta || null);
      } catch {
        setProducts([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsData();
  }, [
    page,
    limit,
    debouncedSearch,
    selectedCategories,
    debouncedPrice,
    sort,
    categories,
  ]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const resetFilters = async () => {
    setResetting(true);
    setSearch("");
    setSelectedCategories([]);
    setExpandedCategories(new Set());
    setMinPrice(MIN_LIMIT);
    setMaxPrice(MAX_LIMIT);
    setSort("created_at_desc");
    setPage(1);
    setSearchParams({}); // Clear URL
    setTimeout(() => setResetting(false), 800);
  };


  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">

        {/*  SIDEBAR  */}
        <aside className="h-fit sticky top-24 space-y-8">

          {/* CATEGORIES */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-slate-800">All Categories</h3>
            </div>

            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {categories.length === 0 ? (
                <CategorySkeleton />
              ) : (
                treeData.map((cat) => (
                  <CategoryNode
                    key={cat.id || cat._id}
                    cat={cat}
                    expandedCategories={expandedCategories}
                    toggleExpand={toggleExpand}
                    selectedCategories={selectedCategories}
                    toggleCategoryTree={toggleCategoryTree}
                  />
                ))
              )}
            </div>
          </div>

          {/* PRICE FILTER */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-slate-800">Price Range</h3>
            </div>

            <div className="px-2">
              {/* Dual Slider Container */}
              <div className="relative h-2 bg-slate-100 rounded-full mb-6">
                {/* Active Track */}
                <div
                  className="absolute h-full bg-blue-600 rounded-full opacity-80"
                  style={{
                    left: `${((minPrice - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100}%`,
                    right: `${100 - ((maxPrice - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100}%`
                  }}
                />

                {/* Range Inputs */}
                <input
                  type="range"
                  min={MIN_LIMIT}
                  max={MAX_LIMIT}
                  step="500"
                  value={minPrice}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), maxPrice - 500);
                    setMinPrice(val);
                    setPage(1);
                  }}
                  className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:active:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:shadow-md cursor-pointer z-20"
                />
                <input
                  type="range"
                  min={MIN_LIMIT}
                  max={MAX_LIMIT}
                  step="500"
                  value={maxPrice}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), minPrice + 500);
                    setMaxPrice(val);
                    setPage(1);
                  }}
                  className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:active:scale-110 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:shadow-md cursor-pointer z-10"
                />
              </div>

              {/* Price Inputs */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Min</span>
                  <div className="flex items-end">
                    <span className="text-sm font-semibold text-slate-600 mb-[2px]">₹</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-full bg-transparent font-bold text-slate-800 outline-none p-0 pl-1"
                    />
                  </div>
                </div>
                <div className="text-slate-300 font-bold">-</div>
                <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Max</span>
                  <div className="flex items-end">
                    <span className="text-sm font-semibold text-slate-600 mb-[2px]">₹</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full bg-transparent font-bold text-slate-800 outline-none p-0 pl-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={resetFilters}
              disabled={resetting}
              className="mt-6 w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
            >
              {resetting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filters
                </>
              )}
            </button>
          </div>
        </aside>

        {/*  MAIN  */}
        < main className="bg-white rounded-lg shadow p-5" >

          {/* TOP BAR */}
          < div className="flex flex-col md:flex-row justify-between gap-4 mb-5" >
            <span className="text-sm text-gray-600">
              {meta && `${meta.total} products`}
            </span>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="border rounded px-3 py-2 text-sm w-56"
              />

              <select
                value={sort}
                onChange={(e) => {
                  const val = e.target.value;
                  setSort(val);
                  setPage(1);
                  updateURL({ sort: val, page: 1 });
                }}
                className="border rounded px-2 py-2 text-sm"
              >
                <option value="created_at_desc">Latest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>
            </div>
          </div >

          {/* GRID */}
          < div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" >
            {loading || resetting ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No products found</h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                  Try adjusting your filters or search keywords to find what you're looking for.
                </p>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id || product._id}
                  onMouseEnter={() => prefetchProductDetails(product.id || product._id)}
                  className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col h-full animate-slide-up"
                >
                  {/* Image Section */}
                  <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden p-6">
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
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

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id || product._id);
                      }}
                      className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 transition-all duration-300 transform active:scale-150 ${favoriteIds.includes(product.id || product._id)
                        ? "text-red-500 scale-110"
                        : "text-slate-300 hover:text-red-400"
                        }`}
                    >
                      ♥
                    </button>

                    {/* Red card area ends here, overlay removed */}
                  </div>

                  {/* Info Section */}
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <div className="mb-3">
                      <h3 className="font-bold text-slate-800 truncate text-lg group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-medium italic">
                        {product.brand || "Premium Quality"}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                      <div className="flex flex-col">
                        {product.salePrice && (
                          <span className="text-[10px] text-slate-400 line-through font-bold">₹{product.price.toLocaleString()}</span>
                        )}
                        <span className="text-xl font-black text-slate-900 leading-none mt-0.5">
                          ₹{(product.salePrice || product.price).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyNow(product);
                          }}
                          className="flex-1 bg-blue-600 text-white py-2.5 px-3 rounded-2xl font-bold text-[10px] hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-100"
                        >
                          Buy
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id || product._id}`);
                          }}
                          className="flex-1 bg-slate-900 text-white py-2.5 px-3 rounded-2xl font-bold text-[10px] hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-200"
                        >
                          View
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product.id || product._id);
                          }}
                          disabled={addingToCartId === (product.id || product._id)}
                          className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all shadow-lg flex-shrink-0 ${addingToCartId === (product.id || product._id)
                            ? "bg-slate-100 text-slate-400"
                            : "bg-blue-600 text-white hover:bg-blue-700 hover:rotate-12 shadow-blue-100"
                            }`}
                          title="Add to Cart"
                        >
                          {addingToCartId === (product.id || product._id) ? (
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
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
              ))
            )}
          </div >

          {/* PAGINATION */}
          {
            meta && meta.totalPages > 1 && (
              <div className="mt-10 flex flex-wrap justify-center items-center gap-2">
                <button
                  onClick={() => {
                    const next = Math.max(1, page - 1);
                    setPage(next);
                    updateURL({ page: next });
                  }}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(meta.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Only show current page, 1, last page, and 1 surrounding current page
                    const isGap = pageNum !== 1 && pageNum !== meta.totalPages && Math.abs(pageNum - page) > 1;

                    if (isGap) {
                      if (pageNum === 2 || pageNum === meta.totalPages - 1) {
                        return <span key={pageNum} className="px-2 self-end">...</span>;
                      }
                      return null;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setPage(pageNum);
                          updateURL({ page: pageNum });
                        }}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors font-medium text-sm ${page === pageNum
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white hover:bg-gray-100 border-gray-200"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    const next = Math.min(meta.totalPages, page + 1);
                    setPage(next);
                    updateURL({ page: next });
                  }}
                  disabled={page === meta.totalPages}
                  className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                  Next
                </button>
              </div>
            )
          }
        </main >
      </div >
    </div >
  );
};

export default Products;
