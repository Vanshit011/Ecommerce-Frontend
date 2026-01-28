import React, { useState, useEffect } from "react";
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

const Products = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sort, setSort] = useState("created_at_desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(9);

  const MIN_LIMIT = 0;
  const MAX_LIMIT = 100000;

  const [favoriteIds, setFavoriteIds] = useState([]);
  const [searchParams] = useSearchParams();

  /* CATEGORY FROM URL */
  useEffect(() => {
    const catFromUrl = searchParams.get("category");

    if (catFromUrl) {
      setSelectedCategory(catFromUrl.toLowerCase());
      setPage(1);
    }
  }, [searchParams]);

  /* FAVORITES */
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const res = await getFavorites();
        const ids = res.data.map((f) => f.id);
        setFavoriteIds(ids);
      } catch (err) {
        console.error("Load favorites failed", err);
      }
    };

    loadFavorites();
  }, []);

  const toggleFavorite = async (productId) => {
    const isFav = favoriteIds.includes(productId);

    try {
      if (isFav) {
        await removeFromFavorites(productId);
        setFavoriteIds((prev) => prev.filter((id) => id !== productId));
      } else {
        await addToFavorites(productId);
        setFavoriteIds((prev) => [...prev, productId]);
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId);
      showToast("Product added to bag!", "success");
    } catch (err) {
      console.error("Add to cart error:", err);
      showToast(err.response?.data?.message || "Failed to add to bag", "error");
    }
  };

  /* CATEGORIES */
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        const data =
          res?.data?.data ||
          res?.data?.categories ||
          (Array.isArray(res?.data) ? res.data : []);

        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchCats();
  }, []);

  /* PRODUCTS */
  useEffect(() => {
    const fetchProductsData = async () => {
      setLoading(true);

      try {
        const params = {
          page,
          limit,
          search: search || undefined,
          category: selectedCategory || undefined,
          minPrice: Number(minPrice),
          maxPrice: Number(maxPrice),
          sort: sort || undefined,
        };

        const res = await getProducts(params);

        setProducts(res?.data?.data || []);
        setMeta(res?.data?.meta || null);
      } catch (error) {
        console.error("Product fetch failed:", error);
        setProducts([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchProductsData, 400);
    return () => clearTimeout(timer);
  }, [page, limit, search, selectedCategory, minPrice, maxPrice, sort]);

  const toggleCategory = (catName) => {
    const normalized = catName.toLowerCase();
    setSelectedCategory((prev) => (prev === normalized ? "" : normalized));
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setMinPrice(MIN_LIMIT);
    setMaxPrice(MAX_LIMIT);
    setSort("created_at_desc");
    setPage(1);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">

        {/* ================= SIDEBAR ================= */}
        <aside className="bg-white rounded-lg shadow p-5 h-fit sticky top-20">
          <h3 className="font-semibold text-lg mb-4">Filters</h3>

          {/* Categories */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Categories</h4>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.map((cat) => {
                const catId = cat.id || cat._id;

                return (
                  <label
                    key={catId}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategory === cat.name.toLowerCase()}
                      onChange={() => toggleCategory(cat.name)}
                      className="accent-blue-600"
                    />
                    {cat.name}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div>
            <h4 className="font-medium mb-3">Price Range</h4>

            <input
              type="range"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              step="500"
              value={minPrice}
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), maxPrice - 5000);
                setMinPrice(val);
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
                const val = Math.max(Number(e.target.value), minPrice + 5000);
                setMaxPrice(val);
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

        {/* ================= CONTENT ================= */}
        <main className="bg-white rounded-lg shadow p-5">

          {/* TOP BAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">

            <span className="text-sm text-gray-600">
              {meta && `${meta.total} products`}
            </span>

            <div className="flex gap-3 items-center">

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
                  setSort(e.target.value);
                  setPage(1);
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

                    {/* IMAGE */}
                    <div className="relative bg-gray-50 p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-44 mx-auto object-contain group-hover:scale-105 transition"
                        onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/400")
                        }
                      />

                      <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        {product.category?.name || "Product"}
                      </span>

                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className={`absolute top-3 right-3 text-xl ${favoriteIds.includes(product.id)
                            ? "text-red-500"
                            : "text-gray-400"
                          }`}
                      >
                        ♥
                      </button>
                    </div>

                    {/* DETAILS */}
                    <div className="p-4">

                      <h3 className="font-medium truncate">
                        {product.name}
                      </h3>

                      <p className="text-xs text-gray-500 line-clamp-2 my-1">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mt-3">

                        <span className="text-lg font-semibold text-green-600">
                          ₹{product.price.toLocaleString()}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product.id || product._id);
                            }}
                            className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700"
                          >
                            Add
                          </button>

                          <button
                            onClick={() =>
                              navigate(
                                `/product/${product.id || product._id}`
                              )
                            }
                            className="border text-sm px-3 py-1.5 rounded hover:bg-gray-100"
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
          {!loading && meta && (
            <div className="flex justify-center items-center gap-4 mt-8">

              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="border px-4 py-2 rounded disabled:opacity-40"
              >
                Prev
              </button>

              <span className="text-sm">
                Page {page} of{" "}
                {meta.totalPages || Math.ceil(meta.total / limit)}
              </span>

              <button
                disabled={
                  page ===
                  (meta.totalPages ||
                    Math.ceil(meta.total / limit))
                }
                onClick={() => setPage((p) => p + 1)}
                className="border px-4 py-2 rounded disabled:opacity-40"
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
