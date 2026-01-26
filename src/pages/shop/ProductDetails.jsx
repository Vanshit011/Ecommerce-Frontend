import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProductDetails,
  addToCart,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
} from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Header from "../../components/common/Header";
import "../../styles/pages/product-details.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductDetails(id);
        setProduct(res.data);
        setSelectedImage(res.data.image);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Product not found");
        setLoading(false);
      }
    };

    const checkFavoriteStatus = async () => {
      try {
        const res = await getFavorites();
        const favs = res.data || [];
        const found = favs.some((f) => (f.product?.id || f.id) === id);
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
      await addToCart(id);
      showToast("Product added to cart!", "success");
    } catch (err) {
      console.error("Error adding to cart:", err);
      showToast(
        err.response?.data?.message || "Failed to add to cart",
        "error",
      );
    }
  };

  if (loading) return;
  <div className="loading-container">
    <div className="loader"></div>
  </div>;
  if (error) return;
  <div className="error-container">
    <h2>{error}</h2>
    <button onClick={() => navigate("/")}>Go Home</button>
  </div>;

  return (
    <div className="product-details-page">
      <Header />
      <div className="container product-container">
        <button className="product-close-btn" onClick={() => navigate(-1)}>
          ✕
        </button>
        <div className="product-layout">
          {/* Left: Images */}
          <div className="product-images-section">
            <div className="main-image-container">
              <img
                src={selectedImage}
                alt={product?.name}
                className="main-image"
              />
            </div>
          </div>

          {/* Right: Info */}
          <div className="product-info-section">
            <nav className="breadcrumb">
              <span onClick={() => navigate("/")}>Home</span> /
              <span onClick={() => navigate("/products")}>Products</span> /
              <span className="current">{product?.name}</span>
            </nav>

            <div className="product-title-row">
              <h1 className="product-title">{product?.name}</h1>
              <button
                className={`product-heart-btn ${isFavorite ? "active" : ""}`}
                onClick={toggleFavorite}
              >
                {isFavorite ? "❤️" : "🤍"}
              </button>
            </div>
            <p className="product-category">
              {product?.category?.name || "General"}
            </p>

            <div className="product-pricing">
              <span className="current-price">₹{product?.price}</span>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product?.description}</p>
            </div>

            <div className="product-actions">
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button
                className="buy-now-btn"
                onClick={async () => {
                  await handleAddToCart();
                  navigate("/cart");
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
