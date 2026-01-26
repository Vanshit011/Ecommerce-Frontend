import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, getCategories, addToCart } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import "../../styles/pages/home.css";
import Header from "../../components/common/Header";

const Home = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);

  //  Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        const products = prodRes?.data?.data || prodRes?.data ;

        const cats = catRes?.data?.data || catRes?.data ;

        setCategories(cats);

        // fallback if flags not exist
        setFeatured(products.slice(0, 8));
        setBestSellers(products.slice(8, 16));
      } catch (err) {
        console.error("Home data load failed:", err);
      }
    };

    loadData();
  }, []);

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    try {
      await addToCart(productId);
      showToast("Product added to bag!", "success");
    } catch (err) {
      console.error("Add to cart error:", err);
      showToast(err.response?.data?.message || "Failed to add to bag", "error");
    }
  };

  return (
    <div className="home-wrapper">
      <Header />

      {/* HERO BANNER */}
      <section className="hero-banner">
        <h1>Flash Sale Banner</h1>
        <p>Up to 70% OFF</p>
        <button onClick={() => navigate("/products")}>Shop Now</button>
      </section>

      {/* CATEGORIES */}
      <section className="home-section">
        <h2 className="home-section-title">Shop by Category</h2>

        <div className="category-strip">
          {categories.map((cat) => (
            <div
              key={cat.id || cat._id}
              className="category-tile premium-category-tile"
              onClick={() => navigate(`/products?category=${cat.name}`)}
            >
              <div className="category-icon-circle">🛍️</div>

              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="home-section">
        <div className="section-head">
          <h2>Featured Products</h2>
          <span onClick={() => navigate("/products")}>View All</span>
        </div>

        <div className="home-products-grid">
          {featured.map((p) => (
            <div
              key={p.id}
              className="home-product-card"
              onClick={() => navigate(`/product/${p.id || p._id}`)}
            >
              <img src={p.image} />
              <div className="home-card-info">
                <h4>{p.name}</h4>
                <p>₹{p.price}</p>
                <div className="home-card-actions">
                  <button
                    className="home-add-btn"
                    onClick={(e) => handleAddToCart(e, p.id || p._id)}
                  >
                    Add to Bag
                  </button>
                  <button
                    className="home-view-btn"
                    onClick={() => navigate(`/product/${p.id || p._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="home-section">
        <div className="section-head">
          <h2>Best Sellers</h2>
          <span onClick={() => navigate("/products")}>View All</span>
        </div>

        <div className="home-products-grid">
          {bestSellers.map((p) => (
            <div
              key={p.id}
              className="home-product-card"
              onClick={() => navigate(`/product/${p.id || p._id}`)}
            >
              <img src={p.image} />
              <div className="home-card-info">
                <h4>{p.name}</h4>
                <p>₹{p.price}</p>
                <div className="home-card-actions">
                  <button
                    className="home-add-btn"
                    onClick={(e) => handleAddToCart(e, p.id || p._id)}
                  >
                    Add to Bag
                  </button>
                  <button
                    className="home-view-btn"
                    onClick={() => navigate(`/product/${p.id || p._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
