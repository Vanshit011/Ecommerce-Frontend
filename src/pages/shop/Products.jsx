import React, { useState, useEffect } from "react";
import {
  getProducts,
  getCategories,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  addToCart,
} from "../../services/api";

import "../../styles/pages/products.css";
import Header from "../../components/common/Header";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

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

  useEffect(() => {
    const catFromUrl = searchParams.get("category");

    if (catFromUrl) {
      setSelectedCategory(catFromUrl.toLowerCase());
      setPage(1);
    }
  }, [searchParams]);

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
//categories fetch

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

 //products fetch

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

 //topggle category

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
    <div className="products-wrapper">
      <Header />

      <div className="products-main-layout">
        <div className="products-layout-container">
          {/* ================= SIDEBAR ================= */}

          <aside className="products-sidebar">
            <div className="sidebar-top">
              <h3>Filters</h3>
            </div>

            <div className="filter-group">
              <h4>Categories</h4>

              <div className="category-scroll">
                {categories.map((cat) => {
                  const catId = cat.id || cat._id;

                  return (
                    <label key={catId} className="category-option">
                      <input
                        type="checkbox"
                        checked={selectedCategory === cat.name.toLowerCase()}
                        onChange={() => toggleCategory(cat.name)}
                      />
                      <span className="check-text">{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="filter-group">
              <h4>Price Range</h4>

              <div className="price-slider-box">
                <div className="slider-track-container">
                  <div className="slider-track"></div>

                  <div
                    className="slider-active-range"
                    style={{
                      left: `${(minPrice / MAX_LIMIT) * 100}%`,
                      right: `${100 - (maxPrice / MAX_LIMIT) * 100}%`,
                    }}
                  />

                  <input
                    type="range"
                    min={MIN_LIMIT}
                    max={MAX_LIMIT}
                    step="500"
                    value={minPrice}
                    onChange={(e) => {
                      const val = Math.min(
                        Number(e.target.value),
                        maxPrice - 5000,
                      );
                      setMinPrice(val);
                      setPage(1);
                    }}
                    className="range-thumb range-thumb-min"
                  />

                  <input
                    type="range"
                    min={MIN_LIMIT}
                    max={MAX_LIMIT}
                    step="500"
                    value={maxPrice}
                    onChange={(e) => {
                      const val = Math.max(
                        Number(e.target.value),
                        minPrice + 5000,
                      );
                      setMaxPrice(val);
                      setPage(1);
                    }}
                    className="range-thumb range-thumb-max"
                  />
                </div>

                <div className="price-labels">
                  <div className="price-chip">₹{minPrice.toLocaleString()}</div>
                  <div className="price-chip">₹{maxPrice.toLocaleString()}</div>
                </div>

                <button className="reset-btn" onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            </div>
          </aside>

          {/* ================= CONTENT ================= */}

          <main className="products-content-area">
            {/* TOP TOOLBAR */}
            <div className="content-controls">
              <div className="controls-row-top">
                <div className="results-info">
                  {meta && <span>{meta.total} products</span>}
                </div>

                <div className="sort-box">
                  <label>Sort:</label>

                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="created_at_desc">Latest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="controls-row-search">
                <input
                  type="text"
                  placeholder="Search brands or products..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="content-search-input"
                />
              </div>
            </div>

            {/* ================= GRID ================= */}

            <section className="product-display-section">
              {loading ? (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                  <p>Loading products...</p>
                </div>
              ) : (
                <div className="products-v2-grid">
                  {products.length === 0 ? (
                    <div className="empty-results">
                      <h3>No matches found</h3>
                      <p>Try adjusting filters</p>
                      <button onClick={resetFilters}>Clear Filters</button>
                    </div>
                  ) : (
                    products.map((product) => (
                      <div
                        key={product.id || product._id}
                        className="premium-product-card"
                      >
                        <div className="card-image-box">
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            onError={(e) =>
                              (e.target.src = "https://via.placeholder.com/400")
                            }
                          />

                          <div className="category-badge">
                            {product.category?.name || "Product"}
                          </div>

                          <button
                            className={`heart-btn ${favoriteIds.includes(product.id) ? "active" : ""
                              }`}
                            onClick={() => toggleFavorite(product.id)}
                          >
                            ♥
                          </button>
                        </div>

                        <div className="card-details">
                          <h3 className="product-title">{product.name}</h3>

                          <p className="product-description">
                            {product.description}
                          </p>

                          <div className="card-footer">
                            <span className="price-tag">
                              ₹{product.price.toLocaleString()}
                            </span>

                            <div className="card-actions-row">
                              <button
                                className="buy-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product.id || product._id);
                                }}
                              >
                                Add to Bag
                              </button>
                              <button
                                className="view-details-btn"
                                onClick={() => navigate(`/product/${product.id || product._id}`)}
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
            </section>

            {/* ================= PAGINATION ================= */}

            {!loading && meta && (
              <div className="pagination-v2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-btn"
                >
                  Previous
                </button>

                <span className="p-info">
                  Page {page} of{" "}
                  {meta.totalPages || Math.ceil(meta.total / limit)}
                </span>

                <button
                  disabled={
                    page === (meta.totalPages || Math.ceil(meta.total / limit))
                  }
                  onClick={() => setPage((p) => p + 1)}
                  className="p-btn"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
