import React, { useEffect, useState } from "react";
import { getFavorites, removeFromFavorites, addToCart } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import Header from "../../../components/common/Header";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // Load Favorites
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFavorites();

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

  const removeItem = async (id) => {
    try {
      await removeFromFavorites(id);

      setFavorites((prev) =>
        prev.filter((item) => item.id !== id)
      );

      showToast("Removed from favorites", "success");
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
      showToast(
        err.response?.data?.message || "Failed to add to bag",
        "error"
      );
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">

        <h2 className="text-2xl font-semibold mb-6">
          Your Favorites ❤️
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            Loading favorites...
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-10 text-center">

            <p className="mb-4 text-gray-600">
              No favorites yet.
            </p>

            <button
              onClick={() => navigate("/home")}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Browse Products
            </button>

          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

            {favorites.map((product) => (
              <div
                key={product.id || product._id}
                onClick={() =>
                  navigate(
                    `/product/${product.id || product._id}`
                  )
                }
                className="bg-white rounded-lg shadow hover:shadow-xl transition cursor-pointer group relative"
              >

                {/* IMAGE */}
                <div className="bg-gray-50 p-4 relative">

                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-40 mx-auto object-contain group-hover:scale-105 transition"
                    onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/300?text=Product")
                    }
                  />

                  {/* REMOVE */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(product.id || product._id);
                    }}
                    className="absolute top-3 right-3 text-red-500 text-lg"
                  >
                    ♥
                  </button>

                </div>

                {/* CONTENT */}
                <div className="p-4">

                  <h4 className="font-medium truncate">
                    {product.name}
                  </h4>

                  <p className="text-green-600 font-semibold mt-1">
                    ₹{product.price?.toLocaleString()}
                  </p>

                  <button
                    onClick={(e) =>
                      handleAddToCart(
                        e,
                        product.id || product._id
                      )
                    }
                    className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
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
