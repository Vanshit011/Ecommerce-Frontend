import React, { useEffect, useState } from "react";
import { getFavorites, removeFromFavorites, addToCart } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import "../../styles/pages/favorites.css";
import Header from "../../components/common/Header";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { showToast } = useToast();

  //  Load Favorites
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFavorites();

        // console.log("Favorites API:", res.data);

        // Normalize backend response
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

  // Remove Favorite
  const removeItem = async (id) => {
    try {
      await removeFromFavorites(id);

      setFavorites((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error("Remove favorite failed:", err);
      showToast("Failed to remove from favorites", "error");
    }
  };

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
    <div className="fav-page">
      <Header />

      {/* PAGE BODY */}
      <div className="fav-container">
        <h2>Your Favorites ❤️</h2>

        {loading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="fav-empty">
            <p>No favorites yet.</p>
            <button onClick={() => navigate("/home")}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="fav-grid">
            {favorites.map((product) => (
              <div
                key={product.id || product._id}
                className="fav-card"
                onClick={() => navigate(`/product/${product.id || product._id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="fav-image-box">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/300?text=Product")
                    }
                  />
                  <button
                    className="fav-heart-btn active"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(product.id || product._id);
                    }}
                  >
                    ❤️
                  </button>
                </div>

                <div className="fav-card-content">
                  <h4>{product.name}</h4>
                  <p className="fav-price">
                    ₹{product.price?.toLocaleString()}
                  </p>

                  <button
                    className="fav-add-bag-btn"
                    onClick={(e) => handleAddToCart(e, product.id || product._id)}
                  >
                    Add to Bag
                  </button>
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
