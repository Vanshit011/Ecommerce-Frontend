import React, { useState, useEffect, useCallback } from "react";
import {
  getProducts,
  getCategories,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  addToCart,
} from "../../../services/api";
import Header from "../../../components/common/Header";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";

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
    <div style={{ marginLeft: level * 16 }}>
      <div className="flex items-center gap-2 py-1">

        {hasChildren && (
          <button
            onClick={() => toggleExpand(id)}
            className="text-xs w-4 text-slate-600 hover:text-blue-600"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        )}

        {!hasChildren && <span className="w-4" />}

        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => toggleCategoryTree(cat)}
          className="accent-blue-600"
        />

        <span className="text-sm">{cat.name}</span>
      </div>

      {isExpanded &&
        hasChildren &&
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

  const handleAddToCart = useCallback(
    async (productId) => {
      try {
        await addToCart(productId);
        showToast("Product added to bag!", "success");
      } catch (err) {
        showToast(
          err.response?.data?.message || "Failed to add to bag",
          "error",
        );
      }
    },
    [showToast],
  );

  /*  FETCH CATEGORIES  */

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        const data =
          res?.data?.data ||
          res?.data?.categories ||
          (Array.isArray(res?.data) ? res.data : []);

        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCats();
  }, []);

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
  }, [searchParams]); // Categories added to help find path, but not in dependency to avoid loops

  const buildTree = (cats) =>
    cats.filter((cat) => {
      const hasNoParent =
        !cat.parentId &&
        (!cat.parent ||
          (typeof cat.parent === "object" &&
            !cat.parent.id &&
            !cat.parent._id));

      return hasNoParent;
    });

  const treeData = buildTree(categories);

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
    const next = isSelected
      ? selectedCategories.filter((x) => x !== id)
      : [...selectedCategories, id];

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

  const resetFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setExpandedCategories(new Set());
    setMinPrice(MIN_LIMIT);
    setMaxPrice(MAX_LIMIT);
    setSort("created_at_desc");
    setPage(1);
    setSearchParams({}); // Clear URL
  };


  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">

        {/*  SIDEBAR  */}
        <aside className="bg-white rounded-lg shadow p-5 h-fit sticky top-20">

          <h3 className="font-semibold text-lg mb-4">Filters</h3>

          {/* CATEGORIES */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Categories</h4>

            <div className="space-y-1 max-h-72 overflow-y-auto">
              {treeData.map((cat) => (
                <CategoryNode
                  key={cat.id || cat._id}
                  cat={cat}
                  expandedCategories={expandedCategories}
                  toggleExpand={toggleExpand}
                  selectedCategories={selectedCategories}
                  toggleCategoryTree={toggleCategoryTree}
                />
              ))}
            </div>
          </div>

          {/* PRICE */}
          <div>
            <h4 className="font-medium mb-3">Price Range</h4>

            <input
              type="range"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              step="500"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(Number(e.target.value));
                setPage(1);
              }}
              className="w-full"
            />

            <input
              type="range"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              step="500"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setPage(1);
              }}
              className="w-full mt-2"
            />

            <div className="flex justify-between text-sm mt-2">
              <span>₹{minPrice.toLocaleString()}</span>
              <span>₹{maxPrice.toLocaleString()}</span>
            </div>

            <button
              onClick={resetFilters}
              className="mt-4 w-full border py-2 rounded hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </div>
        </aside>

        {/*  MAIN  */}
        <main className="bg-white rounded-lg shadow p-5">

          {/* TOP BAR */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-5">
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
          </div>

          {/* GRID */}
          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Loading products...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
              {products.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <h3 className="text-lg font-semibold mb-2">
                    No matches found
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="text-blue-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id || product._id}
                    className="border rounded-lg overflow-hidden hover:shadow-xl transition group relative"
                  >
                    <div className="relative bg-gray-50 p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-44 mx-auto object-contain"
                      />

                      <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        {product.category?.name || "Product"}
                      </span>

                      <button
                        onClick={() => toggleFavorite(product.id || product._id)}
                        className={`absolute top-3 right-3 text-xl ${favoriteIds.includes(product.id || product._id)
                          ? "text-red-500"
                          : "text-gray-400"
                          }`}
                      >
                        ♥
                      </button>
                    </div>

                    <div className="p-4">
                      <h3 className="font-medium truncate">{product.name}</h3>

                      <p className="text-xs text-gray-500 line-clamp-2 my-1">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-semibold text-green-600">
                          ₹{product.price.toLocaleString()}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleAddToCart(product.id || product._id)
                            }
                            className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded"
                          >
                            Add
                          </button>

                          <button
                            onClick={() =>
                              navigate(`/product/${product.id || product._id}`)
                            }
                            className="border text-sm px-3 py-1.5 rounded"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PAGINATION */}
          {meta && meta.totalPages > 1 && (
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
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
